const { validationResult } = require("express-validator");

module.exports.validator = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log(errors);
  res.status(400).json({
    status: 400,
    message: "요청값이 잘못 되었습니다.",
    errors: errors.array(),
  });
};
