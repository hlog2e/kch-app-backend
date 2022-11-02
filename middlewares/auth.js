const { validateAccessToken } = require("../utils/jwt");

module.exports = {
  checkToken: async (req, res, next) => {
    const token = req.headers.authorization.replace("Bearer ", "");
    const validated = await validateAccessToken(token);

    if (!validated) {
      return res
        .status(403)
        .json({ status: 403, message: "해당 서비스에 접근 권한이 없습니다." });
    }

    next();
  },
};
