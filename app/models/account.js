'use strict';

/*
*	Module Dependencies
*/
const mongoose = require('mongoose');
const User = require('../models/user');
const Hero = require('../models/hero');
const Team = require('../models/team');
const accountSettings = require('../../config/app-settings/account')

let AccountSchema = new mongoose.Schema({
	team: { 
		type: mongoose.Schema.ObjectId, 
		ref: 'Team', 
		required: true
	},
	teamOrganization: { 
		type: mongoose.Schema.ObjectId, 
		ref: 'Team'
	},
	user: { 
		type: mongoose.Schema.ObjectId, 
		ref: 'User',
		required: true 
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	title: {
		type: String,
		default: "Teammate"
	},
	createdAt: Date,
	updatedAt: Date,
	heroCount: {
		type: Number,
		default: 0
	},
	heroLikes: [{type: mongoose.Schema.ObjectId, ref: 'Hero' }],
	feedbackUpvotes: [{type: mongoose.Schema.ObjectId, ref: 'Feedback' }],
	feedbackFollows: [{type: mongoose.Schema.ObjectId, ref: 'Feedback' }]
});

AccountSchema.index({ user: 1, team: 1 }, { unique: true });

AccountSchema.pre('save', function (next) {
  var account = this;
  if(account.isNew){
  	account.createdAt = new Date();
  	account.heroLikes = [];
  	account.feedbackUpvotes = [];
  	account.feedbackFollows = [];
	  next()
  }else{
  	account.updatedAt = new Date();
  	next();
  }
});

AccountSchema.methods.addFeedbackUpvote = function(feedback) {
	var account = this;
	if(feedback && feedback._id){
		account.feedbackUpvotes.push(feedback._id);
	}
};

AccountSchema.methods.addFeedbackFollow = function(feedback) {
	var account = this;
	if(feedback && feedback._id){
		account.feedbackFollows.push(feedback._id);
	}
};

AccountSchema.methods.removeFeedbackFollow = function(feedback) {
	var account = this;

	if(feedback && feedback._id){
		for(i = 0; i < account.feedbackFollows.length; i++){
			if(account.feedbackFollows[i].toString() == feedback._id.toString()){
				account.feedbackFollows.splice(i,1);
			}
		}
	}

};	

AccountSchema.methods.addHeroLike = function(hero) {
	var account = this;
	if(hero && hero._id){
		account.heroLikes.push(hero._id);
	}
};

AccountSchema.methods.removeHeroLike = function(hero) {
	var account = this;
	if(hero && hero._id){
		for(i = 0; i < account.heroLikes.length; i++){
			if(account.heroLikes[i].toString() == hero._id.toString()){
				account.heroLikes.splice(i,1);
			}
		}
	}
};

AccountSchema.methods.remainingUpvotes = function(){
	var account = this;
	return account.allocatedUpvotes() - account.feedbackUpvotes.length || 0;
}

AccountSchema.methods.addOneHeroCount = function(callBack){
	var account = this;
	account.heroCount++
	account.save(function(err,account){
		callBack();
	})
}

AccountSchema.methods.removeOneHeroCount = function(callBack){
	var account = this;
	account.heroCount--
	account.save(function(err,account){
		callBack();
	})
}

AccountSchema.methods.updateHeroCount = function(callBack){
	var account = this;
	Hero.count({'heroAccount':account._id}, function(err, count){
		if (count){
			account.heroCount = count;
			account.save(function(err,account){
				callBack();
			})
		}
	})
}

AccountSchema.methods.allocatedUpvotes = function(){
	return accountSettings.allocatedVotes;
}

AccountSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

AccountSchema.virtual('fullTitle').get(function () {
  return this.title || "Teammate";
});	

module.exports = mongoose.model('Account', AccountSchema);	





