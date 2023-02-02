const Admin = require("../../models/admin");
const { createAdminAccessToken } = require("../../utils/jwt");

module.exports = {
  login: async (req, res) => {
    const { id, pw } = req.body;

    const user = await Admin.findOne({ _id: id, password: pw });

    if (!user) {
      return res.status(403).json({
        status: 403,
        message: "아이디 또는 패스워드가 올바르지 않습니다.",
      });
    }

    const token = await createAdminAccessToken(user._id);

    res.status(200).json({
      status: 200,
      message: "정상 처리되었습니다.",
      token: token,
      user: user,
    });
  },
};
