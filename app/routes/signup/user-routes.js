'use strict';

/*
* Module Dependencies
*/
const userCtrl = require('../../controllers/user-ctrl')
const userParams = require('../../helpers/user-params')

module.exports = function(app) {
  app.get('/checkuserstatus', userParams.checkUserStatus, userCtrl.checkUserStatus);
  app.post('/createuser', userParams.createUser, userCtrl.createUser);
}