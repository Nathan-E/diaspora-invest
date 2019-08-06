const httpStatus = require("http-status");
const User = require("../models/user.model");
const sendResponse = require("../helpers/response");

/**
 * Load user and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    let user = await User.get(id);
    if (user && !user.deleted) {
      req.user = user;
      return next();
    }
    return res.json(sendResponse(
      httpStatus.NOT_FOUND,
      "No such user exists!",
      null,
      null
    ))
  } catch (error) {
    next(error);
  }
}; 

/**
 * Get user
 * @returns {User}
 */
exports.get = async (req, res) =>{
  //get number of comments and post made by user
  res.json(sendResponse(
    httpStatus.OK,
    "success",
    req.user,
    null
  ));
}

/**
 * Create new user
 * @property {string} req.body.name - The name of user.
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.phone - The mobileNumber of user.
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
exports.create = async (req, res, next) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password
    } = req.body;

    const userExist = await User.findOne({
      username
    }).exec();
    if (userExist) {
      return res.json(
        sendResponse(
          httpStatus.BAD_REQUEST,
          "username already exist",
          null,
          null
        )
      );
    }

    const emailExist = await User.findOne({
      email
    }).exec();
    if (emailExist) {
      return res.json(
        sendResponse(
          httpStatus.BAD_REQUEST,
          "email already exist",
          null,
          null
        )
      );
    }

    let user = new User({
      name,
      username,
      email,
      phone,
      password
    });

    user = await user.save();

    const accessToken = user.token();

    return res.json(
      sendResponse(
        httpStatus.OK,
        "success",
        user,
        null,
        accessToken
      )
    );
  } catch (error) {
    next(error);
  }
};
