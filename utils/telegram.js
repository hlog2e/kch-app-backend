const https = require("https");
const TelegramBot = require("node-telegram-bot-api");
const verifyService = require("../services/verify.service");

let bot = null;
const pendingRejections = new Map(); // chatId → { requestId, messageId }

const TYPE_LABEL = {
  undergraduate: "재학생",
  teacher: "선생님",
  graduate: "졸업생",
};

// 사진 메시지면 editMessageCaption, 텍스트 메시지면 editMessageText
async function editMessage(text, chatId, messageId) {
  try {
    await bot.editMessageCaption(text, {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
    });
  }
}

function initialize() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("[Telegram] TELEGRAM_BOT_TOKEN 미설정 — 봇 비활성화");
    return;
  }

  // pm2 cluster에서 polling은 0번 워커만. 다른 워커는 sendPhoto 호출용으로만 봇 인스턴스 유지
  const isPollingWorker =
    process.env.INSTANCE_VAR === undefined || process.env.INSTANCE_VAR === "0";

  bot = new TelegramBot(token, {
    polling: isPollingWorker,
    request: { agentClass: https.Agent, agentOptions: { family: 4 } },
  });
  console.log(
    `[Telegram] 봇 초기화 완료 (polling=${isPollingWorker}, instance=${
      process.env.INSTANCE_VAR ?? "none"
    })`,
  );

  if (!isPollingWorker) return;

  // nodemon 재시작 시 이전 polling 정리
  process.once("SIGINT", () => {
    bot.stopPolling().then(() => process.exit(0));
  });
  process.once("SIGTERM", () => {
    bot.stopPolling().then(() => process.exit(0));
  });

  // 콜백 쿼리 핸들러 (인라인 버튼 클릭)
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    try {
      if (data.startsWith("approve:")) {
        const requestId = data.replace("approve:", "");
        const result = await verifyService.approveVerification(requestId);

        if (result.success) {
          await editMessage("✅ 승인 완료", chatId, messageId);
        } else {
          await bot.answerCallbackQuery(query.id, {
            text: result.reason,
            show_alert: true,
          });
        }
      } else if (data.startsWith("reject:")) {
        const requestId = data.replace("reject:", "");

        // 요청이 아직 pending인지 확인
        const VerificationRequest = require("../models/verificationRequest");
        const request = await VerificationRequest.findById(requestId);
        if (!request || request.status !== "pending") {
          await bot.answerCallbackQuery(query.id, {
            text: "이미 처리된 요청입니다.",
            show_alert: true,
          });
          return;
        }

        pendingRejections.set(chatId, { requestId, messageId });

        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(
          chatId,
          "거절 사유를 입력해주세요.\n취소하려면 /cancel 을 입력하세요.",
        );
      }
    } catch (err) {
      console.error("[Telegram] 콜백 처리 오류:", err);
      await bot.answerCallbackQuery(query.id, {
        text: "처리 중 오류가 발생했습니다.",
        show_alert: true,
      });
    }
  });

  // 메시지 핸들러 (거절 사유 입력)
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || !pendingRejections.has(chatId)) return;

    const { requestId, messageId } = pendingRejections.get(chatId);
    pendingRejections.delete(chatId);

    if (text === "/cancel") {
      await bot.sendMessage(chatId, "거절이 취소되었습니다.");
      return;
    }

    try {
      const result = await verifyService.rejectVerification(requestId, text);

      if (result.success) {
        await editMessage(`❌ 거절됨 (사유: ${text})`, chatId, messageId);
        await bot.sendMessage(chatId, "거절 처리 완료");
      } else {
        await bot.sendMessage(chatId, `처리 실패: ${result.reason}`);
      }
    } catch (err) {
      console.error("[Telegram] 거절 처리 오류:", err);
      await bot.sendMessage(chatId, "처리 중 오류가 발생했습니다.");
    }
  });
}

function formatElapsed(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 ${minutes % 60}분 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 ${hours % 24}시간 전`;
}

async function notifyNewVerification(request, opts = {}) {
  if (!bot) return;

  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return;

  const {
    isReminder = false,
    attempts = 0,
    elapsedMs = 0,
    escalate = false,
  } = opts;

  const typeLabel = TYPE_LABEL[request.type] || request.type;
  const reminderHeader = isReminder
    ? `${escalate ? "🚨" : "🔔"} 리마인더 #${attempts} · 최초 요청 ${formatElapsed(
        elapsedMs,
      )}\n━━━━━━━━━━━━\n`
    : "";
  const caption =
    reminderHeader +
    `📋 새로운 인증 요청\n` +
    `━━━━━━━━━━━━\n` +
    `이름: ${request.name}\n` +
    `유형: ${typeLabel}\n` +
    (request.birthYear ? `출생연도: ${request.birthYear}\n` : "");

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ 승인",
          callback_data: `approve:${request._id}`,
        },
        {
          text: "❌ 거절",
          callback_data: `reject:${request._id}`,
        },
      ],
    ],
  };

  try {
    await bot.sendPhoto(chatId, request.image, {
      caption,
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error(
      "[Telegram] 이미지 전송 실패, 텍스트로 fallback:",
      err.message,
    );
    try {
      await bot.sendMessage(chatId, `${caption}\n📎 이미지: ${request.image}`, {
        reply_markup: keyboard,
      });
    } catch (fallbackErr) {
      console.error("[Telegram] 텍스트 전송도 실패:", fallbackErr.message);
    }
  }
}

module.exports = {
  initialize,
  notifyNewVerification,
};
