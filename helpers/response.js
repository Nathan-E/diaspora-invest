/**
 * @param {Number} statusCode - status code of the response
 * @param {string} message - message identify the code
 * @param {{}} payload - response object
 * @param {Error} error - error message
 * @param {Token} token - jwt token 
 * @returns {{}}
 */

module.exports = function(statusCode, message, payload, error, token) {
  return {
    statusCode,
    message,
    payload,
    error,
    token,
  };
};
