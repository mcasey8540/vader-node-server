'use strict';

/*
* Module Dependencies
*/
const Promise = require('bluebird')
const User = require('../models/user');

const getUserByEmail = function(email){
	return User.findOneAsync({email: email})
		.then((user)=>{
			return Promise.resolve(user)
		})
		.catch((e)=>{
			return Promise.reject(e);
		})
}

const createUser = function(email,password){
	return User.create({email: email, password: password})
		.then((user)=>{
			return Promise.resolve(user)
		})
		.catch((e)=>{
			return Promise.reject(e);
		})
}

module.exports = {
	getUserByEmail: getUserByEmail,
	createUser: createUser
}


