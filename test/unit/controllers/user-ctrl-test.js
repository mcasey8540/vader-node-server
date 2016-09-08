'use strict';

/*
* Module Dependencies
*/
const chai = require('chai');
const expect = chai.expect;
const server = require('../../../server');
const User = require('../../../app/models/user');
const userService = require('../../../app/services/user-service');
const invitationService = require('../../../app/services/invitation-service');
const request = require('supertest');

describe('## User Controller', function () {
  describe('.checkUserStatus', () => {
  	const email = "userctrltest1@aventr.com";
		const password = "pass1234"; 
		describe('bad request', ()=>{

			it('should return a 400 if email is not present',(done)=>{
			  request(server.app)
			    .get('/checkuserstatus')
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Valid email required')
			    	done();
			    });
			})

			it('should return a 404 if email is not valid format',(done)=>{
			  request(server.app)
			    .get('/checkuserstatus?email=mike@')
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Valid email required')
			    	done();
			    });
			})
		})  	

		describe('user does not exist', ()=>{
			it('should return a 200 if email is not found',(done)=>{
			  request(server.app)
			    .get('/checkuserstatus?email='+email)
			    .expect(200)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.true;
			    	expect(res.body.userEmail).to.equal(email);
			    	expect(res.body.userExists).to.be.false;
			    	done();
			    });
			})
		})

		describe('user exists', ()=>{
			let user;
			beforeEach((done)=>{
				userService.createUser(email, password)
					.then((newUser)=>{
						user = newUser;
						expect(user).to.exist;
						done();
					})
			})

			afterEach((done)=>{
				user.removeAsync()
					.then(()=>{
						done()
					})
			})

			it('should return a 200 if email is found',(done)=>{
			  request(server.app)
			    .get('/checkuserstatus?email='+email)
			    .expect(200)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.true;
			    	expect(res.body.userEmail).to.equal(email);
			    	expect(res.body.userExists).to.be.true;
			    	done();
			    });
			})
		}) 		 		  		
  })

  describe('.createUser', () => {
  	const email = "userctrltest1@aventr.com";
		const password = "pass1234"; 
		const token = '1234';

		describe('bad request', ()=>{
			it('should return a 400 if email is not present',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Valid email required')
			    	done();
			    });
			})

			it('should return a 400 if email is not valid format',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: 'invalid@'
			    })
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Valid email required')
			    	done();
			    });
			})

			it('should return a 400 if token is not present',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email
			    })
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Confirmation token required')
			    	done();
			    });
			})

			it('should return a 400 if password is not present',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email,
			    	token: token
			    })
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Password at least 8 characters required')
			    	done();
			    });
			})

			it('should return a 400 if password is not 8 char length',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email,
			    	token: token,
			    	password: '1234567'
			    })
			    .expect(400)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Password at least 8 characters required')
			    	done();
			    });
			})							
		})   	

		describe('confirmed invite not found, user not created', ()=>{
			it('should return a 404 for non existing invite',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email,
			    	token: token,
			    	password: password
			    })
			    .expect(404)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Confirmed invite not found')
			    	done();
			    });
			})
		})

		describe('unconfirmed invite found', ()=>{
			let user;
			let invite;
			beforeEach((done)=>{
				invitationService.createInvite(email)
					.then((newInvite)=>{
						invite = newInvite;
						expect(invite).to.exist;
						done();
					})
			})

			afterEach((done)=>{
				invite.removeAsync()
					.then(()=>{
						done();
					})
			})

			it('should return a 400 for invite not fonfirmed',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email,
			    	token: invite.inviteConfirmationToken,
			    	password: password
			    })
			    .expect(404)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.false;
			    	expect(res.body.message).to.equal('Confirmed invite not found');
			    	done();
			    });
			})
		})

		describe('confirmed invite found, user created', ()=>{
			let user;
			let invite;
			beforeEach((done)=>{
				invitationService.createInvite(email)
					.then((newInvite)=>{
						invite = newInvite;
						expect(invite).to.exist;
						return invitationService.confirmEmailInvite(invite._id)
					})
					.then((confirmedInvite)=>{
						expect(confirmedInvite.emailConfirmedAt).to.exist;
						done();
					})
			})

			afterEach((done)=>{
				invite.removeAsync()
					.then(()=>{
						return User.removeAsync({email: email})
					})
					.then(()=>{
						done();
					})
			})

			it('should return a 200',(done)=>{
			  request(server.app)
			    .post('/createuser')
			    .send({
			    	email: email,
			    	token: invite.inviteConfirmationToken,
			    	password: password
			    })
			    .expect(200)
			    .end((err,res)=>{
			    	expect(res.body.success).to.be.true;
			    	expect(res.body.token).to.exist;
			    	expect(res.body.message).to.equal('User successfully created for '+ email);
			    	done();
			    });
			})
		})				

  })

})

