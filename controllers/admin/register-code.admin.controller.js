const RegisterCode = require("../../models/registerCode");

module.exports = {
  createRegisterCodeMany: async (req, res) => {
    const { amount } = req.body;
    let codesArray = [];

    for (let i = 0; i < amount; i++) {
      codesArray.push({
        isUsed: false,
        _id: Math.random().toString(36).substring(2, 7).toUpperCase(),
        issuer: "system",
      });
    }

    await RegisterCode.insertMany(codesArray);
    res.json({
      status: 200,
      message: `가입코드 ${amount}개가 생성되었습니다.`,
      codes: codesArray,
    });
  },
};
