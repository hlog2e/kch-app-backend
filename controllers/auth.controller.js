const { sendCode } = require("../utils/sms");
const VerifyCode = require("../models/verifyCode");
const moment = require("moment");
const User = require("../models/user");
const { createAccessToken } = require("../utils/jwt");

module.exports = {
  requestCode: async (req, res) => {
    const { phoneNumber } = req.body;
    const code = await sendCode(phoneNumber);

    await VerifyCode.updateOne(
      { _id: phoneNumber },
      { code: code, isUsed: false, expire: moment().add(10, "minutes") },
      { upsert: true }
    );

    res.json({ status: 200, message: "인증번호를 발송 했습니다." });
  },

  verifyCodeAndLogin: async (req, res) => {
    const { phoneNumber, code } = req.body;

    // -------------- 심사용 계정 Bypass --------------
    if (phoneNumber === "01012345678" && code === "5231") {
      const userData = await User.findOne({ phoneNumber: phoneNumber });
      const accessToken = await createAccessToken(userData._id);
      return res.json({
        status: 200,
        message: "인증되었습니다.",
        user: userData,
        token: accessToken,
      });
    }
    // -------------- 심사용 계정 Bypass --------------

    const codeData = await VerifyCode.findOne({
      _id: phoneNumber,
      code: code,
      isUsed: false,
      expire: { $gt: moment() },
    });

    if (!codeData) {
      return res
        .status(400)
        .json({ status: 400, message: "인증번호가 유효하지 않습니다." });
    }

    await VerifyCode.updateOne({ _id: phoneNumber }, { isUsed: true });

    const userData = await User.findOne({ phoneNumber: phoneNumber });
    if (!userData) {
      return res.json({
        status: 200,
        message: "인증되었습니다.",
        user: null,
        token: null,
      });
    }

    const accessToken = await createAccessToken(userData._id);
    return res.json({
      status: 200,
      message: "인증되었습니다.",
      user: userData,
      token: accessToken,
    });
  },
  join: async (req, res) => {
    const { phoneNumber, code, name } = req.body;

    const userExists = await User.findOne({ phoneNumber: phoneNumber });
    if (userExists) {
      return res
        .status(400)
        .json({ status: 400, message: "이미 가입된 회원입니다." });
    }

    // -------- 인증 코드 검증 로직 --------
    const codeData = await VerifyCode.findOne({
      _id: phoneNumber,
      code: code,
      expire: { $gt: moment() },
    });

    if (!codeData) {
      return res.status(400).json({
        status: 400,
        message: "인증코드가 만료되었습니다. 처음부터 다시 시도해주세요 :(",
      });
    }

    // -------- 모든 유저는 parents/outsider로 가입 --------
    const doneUserData = await User.create({
      phoneNumber: phoneNumber,
      name: name,
      desc: "학부모/외부인",
      type: "parents/outsider",
      birthYear: req.body.birthYear || null,
    });

    const accessToken = await createAccessToken(doneUserData._id);
    res.json({
      status: 200,
      message: "정상적으로 가입되었습니다.",
      user: doneUserData,
      token: accessToken,
    });
  },
};
