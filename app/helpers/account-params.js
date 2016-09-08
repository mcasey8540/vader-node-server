'use strict';

/*
*	Module Dependencies
*/
const validator = require('validator');

const createAccount = function (req, res, next) {
	if(!req.body.firstName || validator.isNull(req.body.firstName)){
    const err = new Error('First name required');
    err.status = 400;
    return next(err);
	}

	if(!req.body.lastName || validator.isNull(req.body.lastName)){
    const err = new Error('Last name required');
    err.status = 400;
    return next(err);
	}

	if(!req.body.teamId || !validator.isMongoId(req.body.teamId)){
    const err = new Error('Valid Team id required');
    err.status = 400;
    return next(err);
	}	
  next();
}

const editAccount = function (req, res, next) {
  if(!req.body.firstName || validator.isNull(req.body.firstName)){
    const err = new Error('First name required');
    err.status = 400;
    return next(err);
  }

  if(!req.body.lastName || validator.isNull(req.body.lastName)){
    const err = new Error('Last name required');
    err.status = 400;
    return next(err);
  }

  if(!req.body.accountId || !validator.isMongoId(req.body.accountId)){
    const err = new Error('Valid Account id required');
    err.status = 400;
    return next(err);
  } 
  next();
}

module.exports = {
  createAccount: createAccount,
  editAccount: editAccount
}