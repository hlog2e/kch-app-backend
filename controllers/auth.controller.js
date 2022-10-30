const { sendSMS, createCode, validateCode } = require("../utils/sms");
const RegisterCode = require("../models/registerCode");
const User = require("../models/user");
const { createAccessToken } = require("../utils/jwt");

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
  join: async (req, res) => {
    if (
      !req.body.phoneNumber ||
      !req.body.name ||
      !req.body.grade ||
      !req.body.registerCode
    ) {
      return res.status(400).json({
        status: 400,
        message: "가입에 필요한 필수정보가 누락되었습니다.",
      });
    }

    //가입코드 유효성 확인 및 사용함으로 변경
    const foundRegisterCode = await RegisterCode.findOne({
      _id: req.body.registerCode,
      isUsed: false,
    });
    if (!foundRegisterCode) {
      return res.status(400).json({
        status: 400,
        message: "유효하지 않은 가입코드입니다.",
        isValidate: false,
      });
    }

    //회원 정보 DB 저장 및 가입 확인 코드 사용함으로 변경.
    try {
      const newUser = await User.create({
        phone_number: req.body.phoneNumber,
        name: req.body.name,
        grade: req.body.grade,
        class: req.body.class,
        number: req.body.number,
      });

      await RegisterCode.updateOne(
        { _id: req.body.registerCode },
        { isUsed: true, usedUser: newUser }
      );

      const accessToken = await createAccessToken(newUser._id);
      return res.status(200).json({
        status: 200,
        message: "회원가입이 정상적으로 완료되었습니다.",
        user: newUser,
        token: accessToken,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ status: 500, message: "회원가입 도중 오류가 발생하였습니다." });
    }
  },
  requestCode: async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const type = req.body.type;
    if (type === "join") {
      const alreadyJoinedUser = await User.findOne({
        phone_number: phoneNumber,
      });
      if (alreadyJoinedUser) {
        return res.status(400).json({
          status: 400,
          message: "이미 가입한 회원입니다. 로그인 해주세요!",
        });
      }
    }
    const code = await createCode(phoneNumber);

    // await sendSMS(phoneNumber, `[금천고등학교] 인증번호는 [${code}]입니다.`);
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
