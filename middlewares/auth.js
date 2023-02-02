const { validateAccessToken } = require("../utils/jwt");

module.exports = {
  checkToken: async (req, res, next) => {
    if (!req.headers.authorization) {
      return res
        .status(403)
        .json({ status: 403, message: "Authorization Header is Empty" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const { validated, payload } = await validateAccessToken(token);

    if (!validated) {
      return res
        .status(403)
        .json({ status: 403, message: "해당 서비스에 접근 권한이 없습니다." });
    }
    req.userId = payload.userId;
    next();
  },

  checkAdmin: async (req, res, next) => {
    if (!req.headers.authorization) {
      return res
        .status(403)
        .json({ status: 403, message: "Authorization Header is Empty" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const { validated, payload } = await validateAccessToken(token);

    if (!validated) {
      return res
        .status(403)
        .json({ status: 403, message: "해당 서비스에 접근 권한이 없습니다." });
    }

    if (!payload.isAdmin) {
      return res
        .status(403)
        .json({ status: 403, message: "해당 서비스에 접근 권한이 없습니다." });
    }
    req.userId = payload.userId;
    next();
  },
};
