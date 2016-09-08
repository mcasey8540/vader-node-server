'use strict';

/*
* Module Dependencies
*/
const chai = require('chai')
const expect = chai.expect
const helper = require('../../../app/helpers/helper')
const Account = require('../../../app/models/account')
const Hero = require('../../../app/models/hero')
const appSettings = require('../../../config/app-settings/account')

describe('## Account Model', function () {
	let minimum = {
		team: "57b5fd1b1cd1a37a3e8c3cb3",
    user: "57b5fd1b1cd1a37a3e8c3cd6",
    firstName: "Michael",
    lastName: "Casey",
	}

  describe('required attributes', () => {
    it('should be invalid if team is empty', (done) => {
    	let account = new Account()
    	account.validate(function(err){
    		expect(err.errors.team).to.exist;
    		done();
    	})
    }) 

    it('should be invalid if user is empty', (done) => {
      let account = new Account()
      account.validate(function(err){
        expect(err.errors.user).to.exist;
        done();
      })
    }) 

    it('should be invalid if firstName is empty', (done) => {
      let account = new Account()
      account.validate(function(err){
        expect(err.errors.firstName).to.exist;
        done();
      })
    }) 

    it('should be invalid if lastName is empty', (done) => {
      let account = new Account()
      account.validate(function(err){
        expect(err.errors.lastName).to.exist;
        done();
      })
    })               

    it('should be valid if required attributes are present', (done) => {
    	let account = new Account(minimum)
    	account.validate(function(err){
    		expect(err).to.not.exist;
    		done();
    	})
    })                   

  })

  describe('pre save hook', () => {
    let account = new Account(minimum);
    it('it should generate createdAt', (done) => {
    	account.save(function(err, savedAccount){
    		expect(savedAccount.createdAt).to.exist;
    		done();
    	})      	
    })

    it('it should generate feedbackUpvotes', (done) => {
      account.save(function(err, savedAccount){
        expect(savedAccount.feedbackUpvotes).to.exist;
        done();
      })      	
    })

    it('it should generate heroLikes', (done) => {
      account.save(function(err, savedAccount){
        expect(savedAccount.heroLikes).to.exist;
        done();
      })        	
    }) 

    it('it should generate feedbackFollows', (done) => {
      account.save(function(err, savedAccount){
        expect(savedAccount.feedbackFollows).to.exist;
        done();
      })      	
    })  

    it('it should generate updatedAt', (done) => {
      let account = new Account(minimum);
      account.save(function(err, savedAccount){
        expect(savedAccount.updatedAt).to.not.exist;
        savedAccount.save(function(err, updatedAccount){
          expect(updatedAccount.updatedAt).to.exist;
          done();
        })  
      })        
    })                           
	
  })

  describe('.virtuals', () => {

    let account = new Account(minimum);

	  describe('fullName', () => {
	    it('it should generate firstName + lastName', (done) => {
	    	account.save(function(err, savedAccount){
	    		expect(savedAccount.fullName).to.equal("Michael Casey");
	    		done();
	    	})      	
	    })
	  })

	  describe('fullTitle null account title', () => {
	    it('it should generate Teammate', (done) => {
	    	account.save(function(err, savedAccount){
	    		expect(savedAccount.title).to.equal("Teammate");
	    		done();
	    	})      	
	    })
	  })

    describe('fullTitle non-null account title', () => {
      minimum.title = "SuperHero";
      let account = new Account(minimum);
      it('it should generate title', (done) => {
        account.save(function(err, savedAccount){
          expect(savedAccount.title).to.equal("SuperHero");
          done();
        })        
      })
    })    

  })


  describe('.index', () => {
    it('should not save account with same name and user', (done)=>{
      let account = new Account(minimum);
      account.saveAsync()
        .then((savedAccount)=>{
          let newAccount = new Account(minimum);
          return newAccount.saveAsync()
        })
        .then((savedAccount)=>{
          expect(savedAccount).to.not.exist;
          done();
        })
        .catch((e)=>{
          console.log(e);
          expect(e).to.exist;
          done();
        })
    })
  })


  describe('.methods', () => {

    let account = new Account(minimum);

	  describe('totalUpvotes', () => {
	    it('it should return app setting', (done) => {
				expect(account.allocatedUpvotes()).to.equal(appSettings.allocatedVotes);
				done();   	
	    })
	  })

    describe('removeOneHeroCount', () => {
      it('it should reduce hero count by 1', (done) => {
        let account = new Account(minimum);
        account.heroCount = 10
        account.removeOneHeroCount(function(){
          expect(account.heroCount).to.equal(9)
          done(); 
        })
      })
    })   

    describe('addOneHeroCount', () => {
      it('it should increase hero count by 1', (done) => {
        let account = new Account(minimum);
        account.heroCount = 10
        account.addOneHeroCount(function(){
          expect(account.heroCount).to.equal(11)
          done(); 
        })
      })
    })

    describe('remainingUpvotes', () => {
      it('it should return correct value', (done) => {
        let account = new Account(minimum);
        account.feedbackUpvotes = [1,2,3];
        expect(account.remainingUpvotes()).to.equal(appSettings.allocatedVotes - account.feedbackUpvotes.length);
        done();
      })
    })

    describe('removeFeedbackFollow', () => {
      it('it should generate correct value', (done) => {
        let account = new Account(minimum);
        account.feedbackFollows.push("57b5fd1b1cd1a37a3e8c3cb3");
        expect(account.feedbackFollows.length).to.equal(1);
        account.removeFeedbackFollow({_id: "57b5fd1b1cd1a37a3e8c3cb3"})
        expect(account.feedbackFollows.length).to.equal(0);
        done();
      })
      it('it should generate correct value', (done) => {
        let account = new Account(minimum);
        account.feedbackFollows.push("57b5fd1b1cd1a37a3e8c3cb3");
        expect(account.feedbackFollows.length).to.equal(1);
        account.removeFeedbackFollow()
        expect(account.feedbackFollows.length).to.equal(1);
        done();
      })
    })    

    describe('addHeroLike', () => {
      it('it should generate correct value', (done) => {
        let account = new Account(minimum);
        account.save(function(err, savedAccount){
          expect(savedAccount.heroLikes.length).to.equal(0);
          savedAccount.addHeroLike({_id: "57b5fd1b1cd1a37a3e8c3cb3"});
          expect(savedAccount.heroLikes.length).to.equal(1);
          done();
        })
      })
    })    

    describe('addFeedbackUpvote', () => {
      it('it should add one feedback id', (done) => {
        let account = new Account(minimum);
        account.addFeedbackUpvote({_id: "57b5fd1b1cd1a37a3e8c3cb3" })
        expect(account.feedbackUpvotes.length).to.equal(1);
        done();     
      })

      it('it should not add null feedback', (done) => {
        let account = new Account(minimum);
        account.addFeedbackUpvote()
        expect(account.feedbackUpvotes.length).to.equal(0);
        done();     
      })
    })

    describe('addFeedbackFollow', () => {
      it('it should add one feedback id', (done) => {
        let account = new Account(minimum);
        account.addFeedbackFollow({_id: "57b5fd1b1cd1a37a3e8c3cb3" })
        expect(account.feedbackFollows.length).to.equal(1);
        done();     
      })

      it('it should not add null feedback', (done) => {
        let account = new Account(minimum);
        account.addFeedbackFollow()
        expect(account.feedbackFollows.length).to.equal(0);
        done();     
      })
    })    

    describe('removeHeroLike', () => {
      it('it should return correct value', (done) => {
        let account = new Account(minimum);
        account.heroLikes = [];
        let hero = new Hero ({
          team: "57b5fd1b1cd1a37a3e8c3cb3",
          creatorAccount: "57b5fd1b1cd1a37a3e8c3cb3",
          heroAccount: "57b5fd1b1cd1a37a3e8c3cb3",
          content: "this",
          _id: "57b5fd1b1cd1a37a3e8c3cb9"
        })
        account.heroLikes.push("57b5fd1b1cd1a37a3e8c3cb9");
        expect(account.heroLikes.length).to.equal(1);
        account.removeHeroLike(hero);
        expect(account.heroLikes.length).to.equal(0);

        account.heroLikes.push("57b5fd1b1cd1a37a3e8c3cb4");
        account.removeHeroLike(hero);
        expect(account.heroLikes.length).to.equal(1);

        done();    
      })
    })                 

    describe('updateHeroCount', () => {
      it('it should return zero', (done) => {
        account.updateHeroCount();
        expect(account.heroCount).to.equal(0);
        done();     
      })

      it('it should return 1', (done) => {

        let account = new Account(minimum);
        account.save(function(err,savedAccount){
          let hero = new Hero ({
            team: "57b5fd1b1cd1a37a3e8c3cb3",
            creatorAccount: "57b5fd1b1cd1a37a3e8c3cb3",
            heroAccount: savedAccount,
            content: "this"
          })
          hero.save(function(err,savedHero){
            savedAccount.updateHeroCount(function(){
              expect(savedAccount.heroCount).to.equal(1)
              done();
            });
          });     
        })
      })    
    })

  })

})
