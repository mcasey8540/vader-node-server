'use strict';

/*
*	Module Dependencies
*/
const validator = require('validator');

const checkUserStatus = function (req, res, next) {
	if(!req.query.email || !validator.isEmail(req.query.email)){
    const err = new Error('Valid email required');
    err.status = 400;
    return next(err);
	}  
  next();
}

const createUser = function (req, res, next) {
  if(!req.body.email || !validator.isEmail(req.body.email)){
    const err = new Error('Valid email required');
    err.status = 400;
    return next(err);
  } 

	if(!req.body.token || validator.isNull(req.body.token)){
    const err = new Error('Confirmation token required');
    err.status = 400;
    return next(err);
	}

  if(!req.body.password || validator.isNull(req.body.password) || !validator.isLength(req.body.password, {min: 8})){
    const err = new Error('Password at least 8 characters required');
    err.status = 400;
    return next(err);
  } 
  next();
}

module.exports = {
	checkUserStatus: checkUserStatus,
	createUser: createUser
}