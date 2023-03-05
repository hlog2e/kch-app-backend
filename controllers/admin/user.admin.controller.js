const User = require("../../models/user");

module.exports = {
  getCountOfUsers: async (req, res) => {
    const allUserCount = await User.count();

    console.log(allUserCount);
  },
  getStudentByGradeAndClass: async (req, res) => {
    const users = await User.find({
      grade: req.query.grade,
      class: req.query.class,
    }).sort({ name: 1 });

    res.json(users);
  },
};
