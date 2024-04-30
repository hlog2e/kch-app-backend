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
    const { phoneNumber, code, type, name } = req.body; //가입시 필수 데이터
    let doneUserData;

    console.log(phoneNumber);

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

    // -------- type 따른 가입 로직 분류 --------
    switch (type) {
      // -------- 재학생 --------
      case "undergraduate":
        if (req.body.hiddenCode) {
          if (process.env.HIDDEN_CODE === req.body.hiddenCode) {
            console.log("1");
            doneUserData = await User.create({
              phoneNumber: phoneNumber,
              name: name,
              desc: "학생",
              type: type,
              birthYear: req.body.birthYear,
              barcode: null,
              notifications: ["meal", "weather", "feed", "community"],
            });
          } else {
            return res.status(400).json({
              status: 400,
              message: "가입코드가 올바르지 않습니다.",
            });
          }
          break;
        }

        if (!req.body.birthYear || !req.body.barcode) {
          return res.status(400).json({
            status: 400,
            message: "가입에 필요한 필수 정보가 누락되었습니다.",
          });
        }

        const barcodeExists = await User.findOne({ barcode: req.body.barcode });
        if (barcodeExists) {
          return res
            .status(400)
            .json({ status: 400, message: "이미 사용된 학생증 입니다!" });
        }

        doneUserData = await User.create({
          phoneNumber: phoneNumber,
          name: name,
          desc: "학생",
          type: type,
          birthYear: req.body.birthYear,
          barcode: req.body.barcode,
          notifications: ["meal", "weather", "feed", "community"],
        });
        break;

      // -------- 졸업생 --------
      case "graduate":
        doneUserData = await User.create({
          phoneNumber: phoneNumber,
          name: name,
          desc: "졸업생",
          type: type,
        });
        break;

      // -------- 선생님 --------
      case "teacher":
        if (process.env.TEACHER_CODE !== req.body.teacherCode) {
          return res.status(400).json({
            status: 400,
            message: "선생님 가입코드가 올바르지 않습니다.",
          });
        }

        doneUserData = await User.create({
          phoneNumber: phoneNumber,
          name: name,
          desc: "선생님",
          type: type,
        });
        break;
      // -------- 부모님/외부인 --------
      case "parents/outsider":
        doneUserData = await User.create({
          phoneNumber: phoneNumber,
          name: name,
          desc: "학부모/외부인",
          type: type,
        });
        break;
    }

    const accessToken = await createAccessToken(doneUserData._id);
    res.json({
      status: 200,
      message: "정상적으로 가입되었습니다.",
      user: doneUserData,
      token: accessToken,
    });
  },
  verifyUndergradute: async (req, res) => {
    const userId = req.userId;
    const { barcdoe } = req.body;

    if (req.body.hiddenCode) {
      if (process.env.HIDDEN_CODE === req.body.hiddenCode) {
        //TODO: 여기에 히든코드 가입자 유저 데이터 변경 로직 추가
      } else {
        return res.status(400).json({
          status: 400,
          message: "가입코드가 올바르지 않습니다.",
        });
      }
    } else {
      //TODO: 여기에 바코드 가입자 유저 데이터 변경로직 추가
    }
  },
};
