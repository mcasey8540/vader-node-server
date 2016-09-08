'use strict';

/*
* Module Dependencies
*/
const User = require('../models/user')
const Invite = require('../models/invite')
const authenticationService = require('../services/authentication-service')
const invitationService = require('../services/invitation-service')
const userService = require('../services/user-service')
const Promise = require('bluebird');

const checkUserStatus = function(req, res, next) {
  const email = req.query.email;
  userService.getUserByEmail(email)
    .then((foundUser)=>{
      return res.json({
        success: true,
        userEmail: email,
        userExists: foundUser != null
      });
    })
    .catch((e)=>{
      next(e);
    })
}

const createUser = function(req, res, next) {
  const email = req.body.email;
  const inviteToken = req.body.token;
  const password = req.body.password;
  invitationService.fetchInviteByEmailAndConfirmationToken(email,inviteToken)
    .then((foundInvite)=>{
      if(!foundInvite || !foundInvite.isEmailConfirmed){
        const err = new Error('Confirmed invite not found');
        err.status = 404;
        return Promise.reject(err);         
      }else{
        return userService.createUser(email,password)
      }      
    })
    .then((newUser)=>{
      const token = authenticationService.generateToken(newUser, '30d');
      return res.json({
        success: true,
        token: token,
        message: 'User successfully created for '+ newUser.email
      })   
    })
    .catch((e)=>{
      next(e);
    })
}

module.exports = {
  checkUserStatus: checkUserStatus,
  createUser: createUser
}
