const User = require("../../models/user");

module.exports = {
  getStudentByGradeAndClass: async (req, res) => {
    const users = await User.find({
      grade: req.query.grade,
      class: req.query.class,
    }).sort({ name: 1 });

    res.json(users);
  },
};
