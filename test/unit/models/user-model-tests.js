'use strict';

/*
* Module Dependencies
*/
const chai = require('chai')
const expect = chai.expect
const helper = require('../../../app/helpers/helper')
const User = require('../../../app/models/user')

describe('## User Model', function () {
  const testUser = {
    email: 'mike105@aventr.com',
    password: '12345678'
  }
  const invalidEmail = 'test@';
  const invalidPassword = '123456';

  before((done) => {
    User.findOneAsync({
      email: testUser.email
    })
      .then((fetchedUser) => {
        if (fetchedUser) {
          return fetchedUser.removeAsync();
        }
        return Promise.resolve('User does not exists')
      })
      .then(() => {
        done();
      });
  });

  describe('required attributes', () => {
    it('should be invalid if email is empty', (done) => {
      const user = new User({
        password: testUser.password
      });
      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser).to.not.exist;
        })
        .catch((err) => {
          expect(err.errors.email).to.exist;
          done();
        });
    })

    it('should be invalid if password is empty', (done) => {
      const user = new User({
        email: testUser.email
      });
      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser).to.not.exist;
        })
        .catch((err) => {
          expect(err.errors.password).to.exist;
          done();
        });
    })      
      
    it('should be valid if required attributes are present', (done) => {
      let user = new User({
        email: testUser.email,
        password: testUser.password
      });

      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser.email).to.equal(testUser.email);
          return savedUser.removeAsync()
        })
        .then(() => {
          done()
        });
    })                   
  })

  describe('password validations', () => {
    it('should be invalid if length < 8', (done) => {
      let user = new User({
        email: testUser.email,
        password: invalidPassword
      });

      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser).to.not.exist;
        })
        .catch((err) => {
          expect(err.errors.password).to.exist;
          expect(err.errors.password.message).to.equal('Password must be more than 8 characters');
          done();
        });
    }) 

    it('should be valid if length >= 8', (done) => {
      const user = new User({
        email: testUser.email,
        password: testUser.password
      });

      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser.email).to.equal(testUser.email);
          return savedUser.removeAsync()
        })
        .then(() => {
          done()
        });
    })
 })

  describe('pre save hook', () => {
    it('should generate createdAt', (done) => {
      const user = new User({
        email: testUser.email,
        password: testUser.password
      });
      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser.email).to.equal(testUser.email);
          expect(savedUser.password).to.not.equal(testUser.password);
          expect(savedUser.createdAt).to.exist;
          return savedUser.removeAsync();
        })
        .then(() => {
          done();
        });
    })

    it('should update updatedAt', (done) => {
      const user = new User({
        email: testUser.email,
        password: testUser.password
      });
      let oldUpdatedAt;
      user.saveAsync()
        .then((savedUser) => {
          oldUpdatedAt = savedUser.updatedAt;
          return savedUser.saveAsync()
        })
        .then((savedUser) => {
          expect(savedUser.updatedAt).to.not.equal(oldUpdatedAt);
          return savedUser.removeAsync();
        })
        .then(() => {
          done();
        })
    })

    it('should return invalid email errors', (done) => {
      let user = new User({
        email: invalidEmail,
        password: testUser.password
      });

      user.saveAsync()
        .then((savedUser) => {
          expect(savedUser).to.not.exist;
        })
        .catch((e) => {
          expect(e.message).to.equal('Valid email required');
          done();
        });    
    })
  })

  describe('.methods', () =>{
    it('should compare password valid', (done) => {
      let user = new User({
        email: testUser.email,
        password: testUser.password
      })
      user.saveAsync()
        .then((savedUser) => {
          return savedUser.comparePassword(testUser.password)
        })
        .then((isMatch) => {
          expect(isMatch).to.be.true;
          return user.removeAsync();
        })
        .catch((e)=>{
          expect(e).to.not.exist;
        })
        .finally(done)
    })

    it('should compare password invalid', (done) => {
      let user = new User({
        email: testUser.email,
        password: testUser.password
      })
      user.saveAsync()
        .then((savedUser) => {
          return savedUser.comparePassword(invalidPassword)
        })
        .then((isMatch) => {
          expect(isMatch).to.be.false;
          return user.removeAsync();
        })
        .catch((e)=>{
          expect(e).to.not.exist;
        })
        .finally(done)
    })
  })
})
