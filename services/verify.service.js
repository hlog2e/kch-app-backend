const VerificationRequest = require("../models/verificationRequest");
const User = require("../models/user");
const PushToken = require("../models/pushToken");
const { sendNotification } = require("../utils/expo-notifications");

const TYPE_DESC_MAP = {
  undergraduate: "학생",
  teacher: "선생님",
  graduate: "졸업생",
};

async function notifyUser(userId, title, body) {
  const tokens = await PushToken.find({ user_id: userId });
  if (tokens.length === 0) return;
  const tokenIds = tokens.map((t) => t._id);
  await sendNotification(tokenIds, title, body, {});
}

async function approveVerification(requestId) {
  const request = await VerificationRequest.findById(requestId);
  if (!request) {
    return { success: false, reason: "인증 요청을 찾을 수 없습니다." };
  }

  if (request.status !== "pending") {
    return { success: false, reason: "이미 처리된 요청입니다." };
  }

  const desc = TYPE_DESC_MAP[request.type];

  await User.updateOne(
    { _id: request.user },
    {
      type: request.type,
      desc,
      name: request.name,
      ...(request.birthYear && { birthYear: request.birthYear }),
    }
  );

  request.status = "approved";
  await request.save();

  // 승인 푸시 알림 (fire-and-forget)
  notifyUser(request.user, "인증 승인", "인증이 승인되었습니다.").catch(
    console.error,
  );

  return { success: true, request };
}

async function rejectVerification(requestId, reason) {
  const request = await VerificationRequest.findById(requestId);
  if (!request) {
    return { success: false, reason: "인증 요청을 찾을 수 없습니다." };
  }

  if (request.status !== "pending") {
    return { success: false, reason: "이미 처리된 요청입니다." };
  }

  request.status = "rejected";
  request.rejectedReason = reason || null;
  await request.save();

  // 거절 푸시 알림 (fire-and-forget)
  const body = reason
    ? `인증이 거절되었습니다. (사유: ${reason})`
    : "인증이 거절되었습니다.";
  notifyUser(request.user, "인증 거절", body).catch(console.error);

  return { success: true, request };
}

module.exports = {
  TYPE_DESC_MAP,
  approveVerification,
  rejectVerification,
};
