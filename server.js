'use strict';

/*
* Dependencies 
*/
require('dotenv').config();
var express  = require('express');
var app      = express();                               
const Promise = require('bluebird')
var mongoose = require('mongoose');                                
var database = require('./config/database');            
var morgan = require('morgan');             
var passport = require('passport');
var bodyParser = require('body-parser');    
var methodOverride = require('method-override'); 

/*
* Configuration
*/
mongoose.Promise = Promise
Promise.promisifyAll(mongoose);
Promise.config({
  cancellation: true
});
var port  = process.env.PORT || 8080;     
app.set('jsonWebTokenSecret', process.env.JWT_SECRET);                 
require('./config/security.js')(app);                           
app.use(passport.initialize());                                
app.use(express.static(__dirname + '/public'));                 
app.use(morgan('dev'));                                         
app.use(bodyParser.urlencoded({'extended':'true'}));           
app.use(bodyParser.json());                                     
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

/*
* Routes
*/
require('./app/routes/authentication/authentication-routes.js')(app);
require('./app/routes/signup/invitation-routes.js')(app);
require('./app/routes/signup/user-routes.js')(app);
require('./app/routes/middleware.js')(app);    
require('./app/routes/api/team/team-routes.js')(app);
require('./app/routes/api/account/account-routes.js')(app);
require('./app/routes/api/feedback/feedback-routes.js')(app);

// health check API
app.get('/', function(req, res) {
  res.json({ message: 'Welcome to the Dark Side!' });
});

app.use(function (err, req, res, next) {
  return res.status(err.status || 500).json({
    title: err.title,
    message: err.message,
    success: false,
    stack: err.stack
  })
});

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  var configUrl; 
  if(process.env.NODE_ENV == "testing"){
    configUrl = process.env.DATABASE_TESTING;
  }else{
    configUrl = process.env.DATABASE_STAGING;  
  }
  return mongoose.connect(configUrl, options).connection;
}

module.exports = {
  app: app
}