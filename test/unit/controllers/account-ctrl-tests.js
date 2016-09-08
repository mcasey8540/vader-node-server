'use strict';

/*
* Module Dependencies
*/
const chai = require('chai')
const sinon = require('sinon');
const expect = chai.expect;
const Promise = require('bluebird');
const accountCtrl = require('../../../app/controllers/account-ctrl');
const server = require('../../../server');
const request = require('supertest');
const userService = require('../../../app/services/user-service')
const accountService = require('../../../app/services/account-service')
const teamService = require('../../../app/services/team-service')
const authService = require('../../../app/services/authentication-service')

describe('## Account Controller', function () {

  describe.skip('.createAccount Unit Test', () => {
  	const teamId = '57b5b8e65f4f56b1e2b4cd4c'
		const decodedUid = '57b5fd1b1cd1a37a3e8c3cb3'
  	const req = {
			body: {
				firstName: 'Bruce',
				lastName: 'Wayne',
				teamId: teamId
			},
			decoded: {
				uid: decodedUid
			}
		};
  	const res = {};
  	const resJsonSpy = res.json = sinon.spy();

  	it('should successfully create an account',(done)=>{
  		accountCtrl.createAccount(req, res);
		setTimeout(() => {
			expect(resJsonSpy.calledOnce).to.equal(true);
			done();
		}, 6000);
  	})
  })

  describe('.createAccount', () => {

  	const firstName = 'Michael';
  	const lastName = 'Casey';
  	const teamName = 'AcctCtrlTestTeam';
  	const email = "acctrltestuser@test.com"
  	let token;
  	let user;
  	let team;

  	beforeEach((done) => {

  		userService.createUser(email,"pass1234")
  			.then((newUser) => {
					user = newUser;
					return authService.generateToken(newUser, '30d')
				})
				.then((newToken)=>{
					token = newToken;
					return teamService.createTeam(teamName, user._id)
  			})
  			.then((newTeam) =>{
  				team = newTeam;
  				done()
  			})
  	})

  	afterEach((done) => {
  		user.removeAsync()
  			.then(()=>{
  				return team.removeAsync();
  			})
  			.then(()=>{
  				done();
  			})
  	})  	

  	it('should successfully create an account',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	firstName:firstName,
		    	lastName:lastName,
		    	teamId: team._id
		    })
		    .expect(200)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.true;
		    	expect(res.body.message).to.equal("Account successfully added to " + team.name + ".")
		    	expect(res.body.account).to.exist;
		    	expect(res.body.account.fullName).to.exist;
    			expect(res.body.account.accountId).to.exist;
    			expect(res.body.account.createdAt).to.exist;
    			expect(res.body.account.title).to.exist;

		    	done();
		    });
		});

  	it('should generate a 400 without firstName',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	lastName:lastName,
		    	teamId: team._id
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('First name required')
		    	done();
		    });

		});

  	it('should generate a 400 without lastName',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	firstName:firstName,
		    	teamId: team._id
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Last name required')
		    	done();
		    });
		});

  	it('should generate a 400 without teamId',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	firstName:firstName,
		    	lastName: lastName
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Valid Team id required')
		    	done();
		    });
		});

  	it('should generate a 404 error with non-existing teamId',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	firstName:firstName,
		    	lastName: lastName,
		    	teamId: '57b5fd1b1cd1a37a3e8c3cb3'
		    })
		    .expect(404)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Team name not found');
		    	done();
		    });
		});		


  	it('should generate a 400 without valid teamId',(done)=>{
		  request(server.app)
		    .post('/api/account/create')
		    .set('x-access-token',token)
		    .send({
		    	firstName: firstName,
		    	lastName: lastName,
		    	teamId: 'invalidid'
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Valid Team id required')
		    	done();
		    });
		});		

  })

  describe('.editAccount', () => {

  	const firstName = 'Michael';
  	const lastName = 'Casey';
  	const title = "Superhero";
  	const email = "acctrltestuser1@test.com";
  	const teamName = "AcctCtrlTestTeam1";
  	let token;
  	let invalidToken;
  	let user;
  	let team;
  	let account;

  	beforeEach((done) => {

  		userService.createUser(email,"pass1234")
  			.then((newUser) => {
  				user = newUser;
					return authService.generateToken(newUser,'30d')
				})
				.then((newToken)=>{
					token = newToken;
					return authService.generateToken({_id: '57b5fd1b1cd1a37a3e8c3cb3'},'30d')
				})
				.then((invToken)=>{
					invalidToken = invToken;
					return teamService.createTeam(teamName, user._id)
  			})
  			.then((newTeam) =>{
  				team = newTeam;
  				return accountService.createAccount(firstName,lastName,team._id,user._id,title)
  			})
  			.then((newAccount)=>{
  				account = newAccount;
  				done();
  			})
			
  	})

  	afterEach((done) => {
  		user.removeAsync()
  			.then(()=>{
  				return team.removeAsync();
  			})
  			.then(()=>{
  				return account.removeAsync();
  			})
  			.then(()=>{
  				done();
  			})
  	})  	

  	it('should edit account',(done)=>{
		  request(server.app)
		    .post('/api/account/edit')
		    .set('x-access-token',token)
		    .send({
		    	firstName: 'Mike',
		    	lastName: 'Thomas',
		    	accountId: account._id,
		    	title: 'Happster Superhero'
		    })
		    .expect(200)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.true;
		    	expect(res.body.message).to.equal('Account update successful')
		    	expect(res.body.account.fullName).to.equal('Mike Thomas')
    			expect(res.body.account.accountId).to.exist;
    			expect(res.body.account.createdAt).to.exist;
    			expect(res.body.account.title).to.equal('Happster Superhero')
		    	done();
		    });
		});

  	it('should generate an error without firstName',(done)=>{
		  request(server.app)
		    .post('/api/account/edit')
		    .set('x-access-token',token)
		    .send({
		    	lastName:lastName,
		    	accountId: account._id
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('First name required')
		    	done();
		    });

		});

  	it('should generate an error without lastName',(done)=>{
		  request(server.app)
		    .post('/api/account/edit')
		    .set('x-access-token',token)
		    .send({
		    	firstName: firstName,
		    	accountId: account._id
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Last name required')
		    	done();
		    });

		});


  	it('should generate a 404 without valid accountId',(done)=>{
		  request(server.app)
		    .post('/api/account/edit')
		    .set('x-access-token',token)
		    .send({
		    	firstName: firstName,
		    	lastName: lastName,
		    	accountId: '56b5b8e65f4f56b1e2b4cd4c'
		    })
		    .expect(404)
		    .end((err,res)=>{
		   		expect(res.body.success).to.be.false;
		   		expect(res.body.message).to.equal("Account update failed")
		    	done();
		    });

		});

  	it('should generate a 400 without valid MongoId accountId',(done)=>{
		  request(server.app)
		    .post('/api/account/edit')
		    .set('x-access-token',token)
		    .send({
		    	firstName: firstName,
		    	lastName: lastName,
		    	accountId: 'invalidstring'
		    })
		    .expect(400)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.false;
		    	expect(res.body.message).to.equal('Valid Account id required')
		    	done();
		    });

		});
  })

  describe('.fetchAccounts', () => {

  	let token;
  	let invalidToken;
  	let user;
  	let team;
  	let account1;
  	let account2;
  	const email = "acctrltestuser2@test.com";
  	const teamName = "AcctCtrlTestTeam2";  	

  	beforeEach((done) => {

  		userService.createUser(email,"pass1234")
  			.then((newUser) => {
  				user = newUser;
					return authService.generateToken(newUser, '30d')
				})
				.then((newToken)=>{
					token = newToken;
					return authService.generateToken({_id: 'invalidtoken'}, '30d')
				})
				.then((invToken)=>{
					invalidToken = invToken;
					return teamService.createTeam(teamName, user._id)
  			})
  			.then((newTeam) =>{
  				team = newTeam;
  				return accountService.createAccount('Mike','Casey',team._id,user._id)
  			})
  			.then((newAccount) =>{
  				account1 = newAccount;
  				return accountService.createAccount('Bruce','Wayne',team._id,user._id,'SuperHero')
  			})  			
  			.then((newAccount)=>{
  				account2 = newAccount;
  				done();
  			})
			
  	})

  	afterEach((done) => {
  		user.removeAsync()
  			.then(()=>{
  				return team.removeAsync();
  			})
  			.then(()=>{
  				return account1.removeAsync();
  			})
  			.then(()=>{
  				return account2.removeAsync();
  			})  			
  			.then(()=>{
  				done();
  			})
  	})  	

  	it('should return user accounts',(done)=>{
		  request(server.app)
		    .get('/api/user/accounts')
		    .set('x-access-token',token)
		    .expect(200)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.true;
		    	expect(res.body.accounts.length).to.equal(2);
		    	expect(res.body.accounts[0].fullName).to.equal('Mike Casey');
		    	expect(res.body.accounts[0].title).to.equal('Teammate');
		    	expect(res.body.accounts[1].fullName).to.equal('Bruce Wayne');
		    	expect(res.body.accounts[1].title).to.equal('SuperHero');
		    	done();
		    });
		});

  	it('should return no accounts for invalid token',(done)=>{
		  request(server.app)
		    .get('/api/user/accounts')
		    .set('x-access-token',invalidToken)
		    .expect(200)
		    .end((err,res)=>{
		    	expect(res.body.success).to.be.true;
		    	expect(res.body.accounts.length).to.equal(0);
		    	done();
		    });
		});		

  })     

})
