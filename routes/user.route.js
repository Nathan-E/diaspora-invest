const express = require('express');
const { celebrate: validate, errors } = require('celebrate');
const paramValidation = require('../validations/user.validation');
const userCtrl = require('../controllers/user.controller');

const router = express.Router(); // eslint-disable-line new-cap 

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

router
  .route('/signup')
  /** POST /api/v1/users - Create new user */
  .post(validate(paramValidation.createUser, { abortEarly: false }), userCtrl.create);


module.exports = router; 
