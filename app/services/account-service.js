'use strict';

/*
* Module Dependencies
*/
const Promise = require('bluebird')
const Account = require('../models/account');

const createAccount = function(firstName, lastName, teamId, userId, title){
	let account = new Account({
    firstName: firstName,
    lastName: lastName,
    user: userId,
    team: teamId,
    title: title    		
	})
	return account.saveAsync()
		.then((savedAccount)=>{
			return savedAccount.populate('team').execPopulate()
		})
		.catch((e)=>{
			return Promise.reject(e)
		})
}

const getUserAccounts = function(userId){
	let query = Account.find({user: userId})
    .populate('team teamOrganization')
    .sort( { createdAt: 1 } )
  return query.exec()
    .then((accounts) =>{
    	return Promise.resolve(accounts);
    })
    .catch((e)=>{
    	return Promise.reject(e) 
    })
}

const getUserAccountByTeamId = function(userId, teamId){
  let query = Account.findOne({
      user: userId, 
      $or: [ {team: teamId}, {teamOrganization: teamId}]
    })
    .populate('team teamOrganization')
    .sort( { createdAt: 1 } )

  return query.exec()
    .then((accounts) =>{
      return Promise.resolve(accounts);
    })
    .catch((e)=>{
      return Promise.reject(e) 
    })
}

const updateUserAccount = function(userId, accountId, firstName, lastName, title){
	let query = Account.findOneAndUpdate({user: userId, _id: accountId},
		{$set:{
			firstName: firstName,
			lastName: lastName,
			title: title, 
		}},
		{new: true})
    .populate('team teamOrganization')

  return query.exec()
    .then((account) =>{
    	return Promise.resolve(account);
    })
    .catch((e)=>{
    	return Promise.reject(e) 
    })
}

module.exports = {
	createAccount: createAccount,
	getUserAccounts: getUserAccounts,
	updateUserAccount: updateUserAccount,
  getUserAccountByTeamId: getUserAccountByTeamId
}