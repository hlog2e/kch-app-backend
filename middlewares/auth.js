const { validateAccessToken } = require("../utils/jwt");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  checkToken: async (req, res, next) => {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ status: 401, message: "Authorization Header is Empty" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const { validated, payload } = await validateAccessToken(token);

    if (!validated) {
      return res
        .status(401)
        .json({ status: 401, message: "해당 서비스에 접근 권한이 없습니다." });
    }
    req.userId = ObjectId(payload.userId);
    next();
  },

  checkAdmin: async (req, res, next) => {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ status: 401, message: "Authorization Header is Empty" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const { validated, payload } = await validateAccessToken(token);

    if (!validated) {
      return res
        .status(1)
        .json({ status: 401, message: "해당 서비스에 접근 권한이 없습니다." });
    }

    if (!payload.isAdmin) {
      return res
        .status(401)
        .json({ status: 401, message: "해당 서비스에 접근 권한이 없습니다." });
    }
    req.userId = ObjectId(payload.userId);
    next();
  },
};
