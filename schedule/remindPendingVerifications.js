const VerificationRequest = require("../models/verificationRequest");
const telegram = require("../utils/telegram");

const SKIP_IF_CREATED_WITHIN_MS = 5 * 60 * 1000;
const DELAY_BETWEEN_MS = 1000;
const ESCALATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async () => {
  try {
    const cutoff = new Date(Date.now() - SKIP_IF_CREATED_WITHIN_MS);
    const pendings = await VerificationRequest.find({
      status: "pending",
      createdAt: { $lt: cutoff },
    }).sort({ createdAt: 1 });

    if (pendings.length === 0) return;
    console.log(`[Reminder] pending ${pendings.length}건 재알림 시작`);

    for (const req of pendings) {
      try {
        const elapsedMs = Date.now() - req.createdAt.getTime();
        const attempts = (req.notifyAttempts || 0) + 1;
        const escalate = elapsedMs >= ESCALATE_THRESHOLD_MS;

        await telegram.notifyNewVerification(req, {
          isReminder: true,
          attempts,
          elapsedMs,
          escalate,
        });

        req.notifyAttempts = attempts;
        req.lastNotifiedAt = new Date();
        await req.save();
      } catch (err) {
        console.error(`[Reminder] ${req._id} 재알림 실패:`, err);
      }
      await sleep(DELAY_BETWEEN_MS);
    }

    console.log(`[Reminder] pending 재알림 완료`);
  } catch (error) {
    console.error("remindPendingVerifications error:", error);
  }
};
