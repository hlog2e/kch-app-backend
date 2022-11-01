const { SolapiMessageService } = require("solapi");
const messageService = new SolapiMessageService(
  process.env.SOLAPI_KEY,
  process.env.SOLAPI_SECRET
);
const redisCli = require("../models/redis");

module.exports = {
  sendSMS: async (_phoneNum, _msg) => {
    try {
      await messageService.sendOne({
        to: _phoneNum,
        from: process.env.SOLAPI_FROM_NUMBER,
        text: _msg,
      });
    } catch (err) {
      console.log(err);
    }
  },
  createCode: async (_phoneNumber) => {
    const verifyCode = Math.floor(1000 + Math.random() * 9000); //4자리 난수
    await redisCli.set(_phoneNumber, verifyCode, { EX: 180 }); //180초 = 3분
    return verifyCode;
  },
  validateCode: async (_phoneNumber, _code) => {
    const resultVerifyCode = await redisCli.get(_phoneNumber);
    if (resultVerifyCode === _code) {
      return true;
    } else {
      return false;
    }
  },
};
