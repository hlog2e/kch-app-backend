const Notice = require("../models/notice");

module.exports = {
  getNotices: async (req, res) => {
    const data = await Notice.find().sort({ _id: -1 });
    res.json(data);
  },
};
