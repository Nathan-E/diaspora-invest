const { Joi } = require('celebrate');

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      name: Joi.string().required(),
      username: Joi.string().min(4).required(),
      phone: Joi.string().regex(/^[+]{0,1}\d{1,}$/).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }
  }
};
