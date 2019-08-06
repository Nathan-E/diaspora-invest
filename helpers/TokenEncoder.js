const jwt = require('jwt-simple');
const moment = require('moment-timezone');
const { jwtExpirationInterval, jwtSecret } = require('../config/env');

const EncodeToken = (id, email) => {
  const payload = {
      exp: moment()
        .add(jwtExpirationInterval, 'days')
        .unix(),
      iat: moment().unix(),
      sub: id,
      email
    };
    return jwt.encode(payload, jwtSecret);
};

module.exports = EncodeToken;
