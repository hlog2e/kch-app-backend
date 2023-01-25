const { sendSMS, createCode, validateCode } = require("../utils/sms");
const RegisterCode = require("../models/registerCode");
const User = require("../models/user");
const { createAccessToken } = require("../utils/jwt");

module.exports = {
  login: async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const code = req.body.code;

    // 플레이 스토어 및 앱 심사시 테스트 계정은 통과 ----------------
    let validated;
    if (phoneNumber === "01000000000" && code === "5231") {
      validated = true;
    } else {
      validated = await validateCode(phoneNumber, code);
    }
    // --------------------------------------------------

    //const validated = await validateCode(phoneNumber, code);

    if (!validated) {
      return res
        .status(500)
        .json({ status: 500, message: "인증번호가 유효하지 않습니다." });
    }

    const user = await User.findOne({ phone_number: phoneNumber });

    const accessToken = await createAccessToken(user._id);

    res.status(200).json({
      status: 200,
      message: "정상 처리 되었습니다.",
      user: user,
      token: accessToken,
    });
  },
  join: async (req, res) => {
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
        agreement: true,
        blocked_users: [],
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

    const alreadyJoinedUser = await User.findOne({
      phone_number: phoneNumber,
    });
    if (type === "join" && alreadyJoinedUser) {
      return res.status(400).json({
        status: 400,
        message: "이미 가입한 회원입니다. 로그인 해주세요!",
      });
    }
    if (type === "login" && !alreadyJoinedUser) {
      return res.status(400).json({
        status: 400,
        message: "가입되지 않은 회원입니다. 가입 후 이용해 주세요!",
      });
    }
    const code = await createCode(phoneNumber);

    await sendSMS(phoneNumber, `[금천고등학교] 인증번호는 [${code}]입니다.`);
    res
      .status(200)
      .json({ status: 200, message: "인증코드가 발송되었습니다." });
  },
  validateCode: async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const code = req.body.code;

    // 플레이 스토어 및 앱 심사시 테스트 가입 ----------------
    let validated;
    if (phoneNumber === "01011111111" && code === "5231") {
      validated = true;
    } else {
      validated = await validateCode(phoneNumber, code);
    }
    // --------------------------------------------------

    //const validated = await validateCode(phoneNumber, code);

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

  modifyUserInfo: async (req, res) => {
    const userId = req.userId;
    await User.updateOne(
      { _id: userId },
      { grade: req.body.grade, class: req.body.class, number: req.body.number }
    );

    res.json({ status: 200, message: "정보 수정을 완료했습니다." });
  },
};
