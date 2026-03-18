const VerificationRequest = require("../models/verificationRequest");
const verifyService = require("../services/verify.service");
const telegram = require("../utils/telegram");

module.exports = {
  // 인증 요청 제출
  requestVerification: async (req, res) => {
    const userId = req.userId;
    const { type, name, birthYear } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        status: 400,
        message: "type과 name은 필수입니다.",
      });
    }

    if (!["undergraduate", "teacher", "graduate"].includes(type)) {
      return res.status(400).json({
        status: 400,
        message: "유효하지 않은 type입니다.",
      });
    }

    if ((type === "undergraduate" || type === "graduate") && !birthYear) {
      return res.status(400).json({
        status: 400,
        message: "학생/졸업생은 birthYear가 필수입니다.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "인증 서류 이미지를 첨부해주세요.",
      });
    }

    // 이미 대기 중인 인증 요청이 있는지 확인
    const existingRequest = await VerificationRequest.findOne({
      user: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        status: 400,
        message: "이미 대기 중인 인증 요청이 있습니다.",
      });
    }

    const imageUrl = "https://static.kch-app.me/" + req.file.key;

    const doc = await VerificationRequest.create({
      user: userId,
      type,
      name,
      birthYear: birthYear || null,
      image: imageUrl,
    });

    // 텔레그램 알림 (fire-and-forget)
    telegram.notifyNewVerification(doc).catch(console.error);

    res.json({
      status: 200,
      message: "인증 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.",
    });
  },

  // 내 인증 요청 상태 조회
  getMyVerificationStatus: async (req, res) => {
    const userId = req.userId;

    const request = await VerificationRequest.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(request);
  },

  // [관리자] 대기 중인 인증 요청 목록 조회
  getPendingRequests: async (req, res) => {
    const requests = await VerificationRequest.find({ status: "pending" })
      .populate("user", "phoneNumber name type")
      .sort({ createdAt: 1 })
      .lean();

    res.json(requests);
  },

  // [관리자] 인증 요청 승인
  approveRequest: async (req, res) => {
    const { requestId } = req.params;
    const result = await verifyService.approveVerification(requestId);

    if (!result.success) {
      const status = result.reason.includes("찾을 수 없") ? 404 : 400;
      return res.status(status).json({ status, message: result.reason });
    }

    res.json({ status: 200, message: "인증 요청이 승인되었습니다." });
  },

  // [관리자] 인증 요청 거절
  rejectRequest: async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    const result = await verifyService.rejectVerification(requestId, reason);

    if (!result.success) {
      const status = result.reason.includes("찾을 수 없") ? 404 : 400;
      return res.status(status).json({ status, message: result.reason });
    }

    res.json({ status: 200, message: "인증 요청이 거절되었습니다." });
  },
};
