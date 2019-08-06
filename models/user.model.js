const mongoose = require("mongoose");
const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const APIError = require("../helpers/APIError");
const EncodeToken = require("../helpers/TokenEncoder");

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    minlength: 4,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  }
});
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Duplicate th ID field
 */
UserSchema.virtual("id").get(function() {
  return this._id.toHexString();
});

/**
 * Ensure virtual fields are serialised
 */
UserSchema.set("toJSON", {
  virtuals: true
});

/**
 * pre-save hooks
 */
UserSchema.pre("save", function(next) {
  /**
   * Ensures the password is hash before its been saved
   */
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Validate the user's password
   * @param {*} password - The user's password
   * @returns {Promise<Error, true>}
   */
  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
  /**
   * generates token for user auth
   * @returns {string} token - jwt token for user auth
   */
  token() {
    return EncodeToken(this._id, this.email, this.isAdmin);
  }
};
/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { username, password } = options;
    if (!username) {
      throw new APIError({
        message: "A username is required to generate a token"
      });
    }

    const user = await this.findOne({
      username,
      deleted: false
    }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      }
      err.message = "Incorrect username or password";
    }
    throw new APIError(err);
  },
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      const user = await this.findById(id).exec();
      if (user) {
        return user;
      }
      const err = new APIError({
        message: "No such user exists!",
        status: httpStatus.NOT_FOUND,
        isPublic: true
      });
    } catch (error) {
      throw new APIError(error);
    }
  },
  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  async list(query) {
    return this.find(query)
      .sort({
        createdAt: -1
      })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};
/**
 * @typedef User
 */
module.exports = mongoose.model("User", UserSchema);
