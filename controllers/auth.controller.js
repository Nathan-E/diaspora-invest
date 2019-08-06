const httpStatus = require("http-status");
const User = require("../models/user.model");
const sendResponse = require("../helpers/response");

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    return res.json(
      sendResponse(
        httpStatus.OK,
        "successfully logged in",
        user,
        null,
        accessToken
      )
    );
  } catch (error) {
    return next(error);
  }
};
