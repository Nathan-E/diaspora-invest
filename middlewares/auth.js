/* eslint no-underscore-dangle: 0, max-len: ['error', 120] */
const Promise = require("bluebird");
const httpStatus = require("http-status");
const passport = require("passport");
const APIError = require("../helpers/APIError");

const handleJWT = (req, res, next) => async (err, user, info) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : "Unauthorized",
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined
  });

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (req.params.userId !== user._id.toString()) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = "Forbidden";
    return next(apiError);
  } else if (err || !user) {
    return next(apiError);
  }

  req.user = user;

  return next();
};


exports.authorize = (req, res, next) =>
  passport.authenticate("jwt", { session: false }, handleJWT(req, res, next))(
    req,
    res,
    next
  );
