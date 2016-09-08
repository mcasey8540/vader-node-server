'use strict';

/* 
* Module Dependencies
*/
const chai = require('chai')
const expect = chai.expect
const userService = require('../../../app/services/user-service')
const teamService = require('../../../app/services/team-service')
const accountService = require('../../../app/services/account-service')
const Account = require('../../../app/models/account');

describe('## Account Service', function () {

  const decodedUid = '57b5fd1b1cd1a37a3e8c3cb3'
  const teamId = '57b5b8e65f4f56b1e2b4cd4c'
  describe('.createAccount', () => {
  	it('should fail if required account model attributes not present',(done)=>{
  		accountService.createAccount()
  			.catch((e)=>{
  				expect(e).to.exist;
  				done();
  			})
  	})

  	it('should success if required params are met',(done)=>{
  		accountService.createAccount("mike","casey",teamId,decodedUid,"SuperHero")
  			.then((savedAccount)=>{
  				expect(savedAccount).to.exist;
  				expect(savedAccount.firstName).to.equal("mike");
  				done();
  			})
  			.catch((e)=>{
  				expect(e).to.not.exist;
  				done();
  			})
  	})  	
  })

  describe('.getUserAccounts', () => {

    it('should return no accounts',(done)=>{
      accountService.getUserAccounts('nonvalidId')
        .catch((e)=>{
          expect(e).to.exist;
          done();
        })        
    })    

    it('should return accounts for valid user id',(done)=>{
      let newAccount;
      accountService.createAccount("mike","casey",teamId,decodedUid,"SuperHero")
        .then((savedAccount)=>{
          newAccount = savedAccount;
          expect(savedAccount).to.exist;
          return accountService.getUserAccounts(decodedUid);
        })
        .then((foundAccounts)=>{
          expect(foundAccounts).to.exist;
          return newAccount.removeAsync()
        })
        .then(()=>{
          done()
        })
        .catch((e)=>{
          expect(e).not.to.exist;
          done();
        })        
    })    

  })

  describe('.getUserAccountByTeamId', () => {

    const nonExistingUserId = '57b5fd1b1ab1a37a3e8c3cb3';
    const nonExistingTeamId = '57b5fd1b1ab1a37a3e9c3cb3';
    const email = 'accctrltest123@aventr.com';
    const password = 'pass1234';
    const teamName = 'AcctServiceTestTeam';
    const firstName = 'Mike';
    const lastName = 'Casey';
    let account;
    let user;
    let team;

    beforeEach((done)=>{
      userService.createUser(email,password)
        .then((newUser)=>{
          expect(newUser).to.exist;
          user = newUser;
          return teamService.createTeam(teamName, user._id)
        })
        .then((newTeam)=>{
          expect(newTeam).to.exist;
          team = newTeam;
          return accountService.createAccount(firstName, lastName, team._id, user._id)
        })
        .then((newAccount)=>{
          expect(newAccount).to.exist;
          account = newAccount; 
          done()         
        }) 
    })

    afterEach((done)=>{
      user.removeAsync()
        .then(()=>{
          return team.removeAsync()
        })
        .then(()=>{
          return account.removeAsync()
        })
        .then(()=>{
          done();
        })
    })

    it('should generate error for invalid Mongo id',(done)=>{
      accountService.getUserAccountByTeamId('nonvalidId','nonvalidId')
        .catch((e)=>{
          expect(e).to.exist;
          done();
        })        
    })    

    it('should return accounts for valid user id and team id',(done)=>{
      accountService.getUserAccountByTeamId(user._id,team._id)
        .then((foundAccount)=>{
          expect(foundAccount.firstName).to.equal('Mike');
          expect(foundAccount.lastName).to.equal('Casey');
          expect(foundAccount.team._id.toString()).to.equal(team._id.toString());
          expect(foundAccount.team.name).to.equal(team.name);
          done();
        })            
    })

    it('should return no accounts',(done)=>{
      accountService.getUserAccountByTeamId(nonExistingUserId,nonExistingTeamId)
        .then((foundAccount)=>{
          expect(foundAccount).to.not.exist;
          done();
        })            
    })         

  })  


  describe('.updateUserAccount', () => {

    it('should return error',(done)=>{
      accountService.updateUserAccount('invalidId', 'invalidId')
        .catch((e)=>{
          expect(e).to.exist;
          done();
        })        
    })    

    it('should return updated account',(done)=>{
      let newAccount;
      accountService.createAccount("Mike","Casey",teamId,decodedUid,"SuperHero")
        .then((savedAccount)=>{
          expect(savedAccount).to.exist;
          return accountService.updateUserAccount(decodedUid, savedAccount._id, "Bruce", "Wayne", "Gotham Hero" );
        })
        .then((updatedAccount)=>{
          expect(updatedAccount.firstName).to.equal("Bruce");
          expect(updatedAccount.lastName).to.equal("Wayne");
          expect(updatedAccount.title).to.equal("Gotham Hero");
          return updatedAccount.removeAsync()
        })
        .then(()=>{
          done()
        })
        .catch((e)=>{
          expect(e).not.to.exist;
          done();
        })        
    })    

  })  

})