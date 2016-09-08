'use strict';

/* 
* Module Dependencies
*/
const chai = require('chai')
const expect = chai.expect
const userService = require('../../../app/services/user-service')
const User = require('../../../app/models/user')

describe('## User Service', function () {
  const decodedUid = '57b5fd1b1cd1a37a3e8c3cb3'
  describe('.getUserByEmail', () => {

  	it('should not return invalid user',(done)=>{
  		userService.getUserByEmail("INVALID")
  			.then((foundUser)=>{
  				expect(foundUser).to.not.exist;
  				done();
  			})
  	})

  	it('should return user',(done)=>{
  		userService.createUser("tester1@test.com","password123")
  			.then((newUser)=>{
  				expect(newUser).to.exist;
  				return userService.getUserByEmail(newUser.email)
  			})
  			.then((foundUser)=>{
  				expect(foundUser).to.exist;
  				foundUser.removeAsync()
  			})
  			.then(()=>{
  				done()
  			})
  	})

  })

  describe('.createUser', () => {

  	it('should return created user',(done)=>{
  		userService.createUser("tester2@test.com","password123")
  			.then((newUser)=>{
  				expect(newUser).to.exist;
  				return newUser.removeAsync();
  			})
  			.then(()=>{
  				done()
  			})
  	})

  	it('should not create invalid user',(done)=>{
  		userService.createUser("tester2","passwo")
  			.catch((e)=>{
  				expect(e).to.exist;
  				done()
  			})
  	})

  })


})