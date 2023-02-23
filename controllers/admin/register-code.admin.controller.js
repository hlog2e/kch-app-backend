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

  deleteUnUsedRegisterCode: async (req, res) => {
    const { code } = req.body;

    try {
      await RegisterCode.deleteOne({ _id: code, isUsed: false });
      return res.json({
        status: 200,
        message: `가입코드 "${code}"를 정상적으로 삭제하였습니다.`,
      });
    } catch (_err) {
      return res.status(400).json({
        status: 400,
        message:
          "가입코드 삭제 중 오류가 발생하였습니다. 존재하지 않는 가입코드거나, 이미 사용된 코드 일 수 있습니다.",
      });
    }
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
