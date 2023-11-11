const { SolapiMessageService } = require("solapi");
const messageService = new SolapiMessageService(
  process.env.SOLAPI_KEY,
  process.env.SOLAPI_SECRET
);

module.exports = {
  sendCode: async (_phoneNumber) => {
    const verifyCode = Math.floor(1000 + Math.random() * 9000); //4자리 난수

    try {
      await messageService.sendOne({
        to: _phoneNumber,
        from: process.env.SOLAPI_FROM_NUMBER,
        text: `[금천고등학교] 인증번호는 (${verifyCode})입니다.`,
      });
    } catch (err) {
      console.log(err);
    }

    return verifyCode;
  },
};
