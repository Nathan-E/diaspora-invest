const express = require("express");
const { celebrate: validate, errors } = require("celebrate");
const paramValidation = require("../validations/auth.validation");
const authCtrl = require("../controllers/auth.controller");


const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router
  .route("/login")
  .post(
    validate(paramValidation.login, { abortEarly: false }),
    authCtrl.login
  );


module.exports = router;
