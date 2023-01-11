const Banners = require("../models/banner");

module.exports = {
  getBanners: async (req, res) => {
    const data = await Banners.find({});
    res.json(data);
  },
};
