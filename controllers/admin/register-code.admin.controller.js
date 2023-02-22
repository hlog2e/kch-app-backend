const RegisterCode = require("../../models/registerCode");

module.exports = {
  getRegisterCodeInfo: async (req, res) => {
    const allRegisterCodeCount = await RegisterCode.count({});
    const unUsedRegisterCodeCount = await RegisterCode.count({ isUsed: false });
    const usedRegisterCodeCount = await RegisterCode.count({ isUsed: true });

    res.json({
      all: allRegisterCodeCount,
      unUsed: unUsedRegisterCodeCount,
      used: usedRegisterCodeCount,
    });
  },
  getRegisterCodes: async (req, res) => {
    const { isUsed } = req.query;

    const codes = await RegisterCode.find({ isUsed: isUsed });

    res.json(codes);
  },

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
