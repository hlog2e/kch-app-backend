const Banners = require("../models/banner");

module.exports = {
  getBanners: async (req, res) => {
    const { location } = req.query;

    const data = await Banners.find({ location: location });
    res.json(data);
  },
};
