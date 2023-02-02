const jwt = require("jsonwebtoken");

module.exports = {
  createAccessToken: async (_userId) => {
    const payload = { userId: _userId, idAdmin: false };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1y",
    });

    return newToken;
  },
  createAdminAccessToken: async (_userId) => {
    const payload = { userId: _userId, isAdmin: true };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "10m",
    });

    return newToken;
  },
  validateAccessToken: async (_token) => {
    try {
      const payload = await jwt.verify(_token, process.env.JWT_SECRET);
      return { validated: true, payload: payload };
    } catch (err) {
      return { validated: false };
    }
  },
};
