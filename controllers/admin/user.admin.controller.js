const User = require("../../models/user");

module.exports = {
  getCount: async (req, res) => {
    const allUserCount = await User.countDocuments();
    const grade1Count = await User.countDocuments({ grade: 1 });
    const grade2Count = await User.countDocuments({ grade: 2 });
    const grade3Count = await User.countDocuments({ grade: 3 });
    const teacherCount = await User.countDocuments({ grade: "선생님" });

    res.json({
      all: allUserCount,
      grade1: grade1Count,
      grade2: grade2Count,
      grade3: grade3Count,
      teacher: teacherCount,
    });
  },
  getStudentByGradeAndClass: async (req, res) => {
    const users = await User.find({
      grade: req.query.grade,
      class: req.query.class,
    }).sort({ name: 1 });

    res.json(users);
  },
};
