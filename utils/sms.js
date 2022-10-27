const { SolapiMessageService } = require("solapi");
const messageService = new SolapiMessageService(
  process.env.SOLAPI_KEY,
  process.env.SOLAPI_SECRET
);

module.exports = {
  sendSMS: async (_phoneNum, _msg) => {
    messageService.sendOne({
      to: _phoneNum,
      from: process.env.SOLAPI_FROM_NUMBER,
      text: _msg,
    });
  },
};
