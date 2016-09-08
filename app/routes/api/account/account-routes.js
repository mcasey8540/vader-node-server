'use strict';

/*
* Module Dependencies
*/
const S3_BUCKET = process.env.S3_BUCKETNAME;
const AWS = require('aws-sdk');
const accountCtrl = require('../../../controllers/account-ctrl');
const accountParams = require('../../../helpers/account-params');

module.exports = function(app){
	app.post('/api/account/create', accountParams.createAccount, accountCtrl.createAccount);
	app.post('/api/account/edit', accountParams.editAccount, accountCtrl.editAccount);
	app.get('/api/user/accounts', accountCtrl.fetchAccounts)
};

