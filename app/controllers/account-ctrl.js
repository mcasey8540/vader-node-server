'use strict'

/*
* Module Dependencies
*/
const Promise = require('bluebird');
var Team = require('../models/team');
var Account = require('../models/account');
var formatAccountInfo = require('../helpers/helper').formatAccountInfo;
const teamService = require('../services/team-service');
const accountService = require('../services/account-service');

const createAccount = function (req, res, next) {
  const teamName;
  teamService.getTeamById(req.body.teamId)
    .then((existingTeam)=>{
      if (!existingTeam){
        const err = new Error('Team name not found');
        err.status = 404;
        return Promise.reject(err);
      }
      teamName = existingTeam.name;
      return accountService.createAccount(req.body.firstName, req.body.lastName, existingTeam._id, req.decoded.uid, req.body.title)
    })
    .then((savedAccount)=>{
      return res.json({
        success: true,
        message: 'Account successfully added to ' + teamName,
        account: formatAccountInfo(savedAccount)
      })
    })
    .catch((e)=>{
      return next(e);
    })
}

const fetchAccounts = function(req, res, next){
  const userId = req.decoded.uid
  accountService.getUserAccounts(userId)
    .then((accounts)=>{
      var acctsFormatted = accounts.map(function(acct){ return formatAccountInfo(acct)});
      return res.json({
        success: true,
        accounts: acctsFormatted
      });         
    })
    .catch((e)=>{   
      return next(e);  
    })
}

const editAccount = function(req, res, next){
  const userId = req.decoded.uid
  return accountService.updateUserAccount(
    userId, 
    req.body.accountId,
    req.body.firstName,
    req.body.lastName,
    req.body.title)
    .then((updatedAccount) => {
      if(!updatedAccount){
        const err = new Error('Account update failed');
        err.status = 404;
        return Promise.reject(err);
      }else{
        return res.json({
          success: true,
          message: 'Account update successful',
          account: formatAccountInfo(updatedAccount)
        })
      }      
    })
    .catch((e)=>{
      return next(e);
    })
}

module.exports = {
  createAccount: createAccount,
  editAccount: editAccount,
  fetchAccounts: fetchAccounts
}