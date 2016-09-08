'use strict';

/*
* Module Dependencies
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const validator = require('validator');
const Promise = require('bluebird');

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  emailConfirmedAt: Date,
  emailConfirmationUrl: String,
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return validator.isByteLength(v, {min: 8})
      },
      message: 'Password must be more than 8 characters'
    }
  }
});

UserSchema.pre('save', function (next) {
  var user = this;
  user.updatedAt = new Date();
  if (this.isModified('password') || this.isNew) {
    user.createdAt = new Date();
    generateSalt(user)
      .then(function (hash) {
        user.password = hash;
        return validateEmail(user.email)
      })
      .then(function () {
        next();
      })
      .catch(function (err) {
        next(err);
      })
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = function (originalPassword) {
  const savedPassword = this.password;
  return new Promise(function (resolve, reject) {
    bcrypt.compare(originalPassword, savedPassword, function (err, isMatch) {
      if (err) {
        return reject(err);
      }
      return resolve(isMatch)
    });
  });
};

function validateEmail (email) {
  return new Promise(function (resolve, reject) {
    if (email) {
      if (!validator.isEmail(email)) {
        var error = new Error('Valid email required');
        return reject(error);
      } else {
        return resolve();
      }
    } else {
      return reject(new Error('email is required'));
    }
  });
}

function generateSalt (user) {
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return reject(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return reject(err);
        }
        return resolve(hash);
      });
    });
  })
}

module.exports = mongoose.model('User', UserSchema);