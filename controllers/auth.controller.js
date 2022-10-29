const { sendSMS, createCode, validateCode } = require("../utils/sms");
const RegisterCode = require("../models/registerCode");

module.exports = {
  login: async (req, res) => {
    // const phoneNumber = req.body.phoneNumber;
    // const code = req.body.code;
    // if (!phoneNumber || !code) {
    //   return res
    //     .status(500)
    //     .json({ status: 500, message: "요청값이 누락되었습니다." });
    // }
    // const validated = validateCode(phoneNumber, code);
    // if (!validated) {
    //   res
    //     .status(500)
    //     .json({ status: 500, message: "인증번호가 유효하지 않습니다." });
    // }
  },
  join: async (req, res) => {},
  requestCode: async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const code = await createCode(phoneNumber);

    await sendSMS(phoneNumber, `[금천고등학교] 인증번호는 [${code}]입니다.`);
    res
      .status(200)
      .json({ status: 200, message: "인증코드가 발송되었습니다." });
  },
  validateCode: async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const code = req.body.code;
    if (!phoneNumber || !code) {
      return res
        .status(500)
        .json({ status: 500, message: "요청값이 누락되었습니다." });
    }

    const validated = await validateCode(phoneNumber, code);

    if (validated) {
      return res.status(200).json({
        status: 200,
        message: "유효한 인증번호 입니다.",
        isValidate: true,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "유효하지 않은 인증번호 입니다.",
        isValidate: false,
      });
    }
  },
  validateRegisterCode: async (req, res) => {
    const registerCode = req.body.registerCode;
    const foundRegisterCode = await RegisterCode.findOne({
      _id: registerCode,
      isUsed: false,
    });
    if (!foundRegisterCode) {
      return res.status(200).json({
        status: 200,
        message: "유효하지 않은 가입코드입니다.",
        isValidate: false,
      });
    }

    res.status(200).json({
      status: 200,
      message: "유효한 가입코드입니다.",
      isValidate: true,
    });
  },
};
