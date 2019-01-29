"use strict";


var
    openid = require('openid-client'),
	passport = require('passport'),
	util = require('util');

var User = require('./User').User;

var Passport = require('passport').Passport;

var OICStrategy = function(config) {
	this.name = 'passport-openid-connect';
	this.config = config || {};
	this.client = null;
	this.tokenSet = null;
	this.init()
		.then(() => {
			console.log("Initialization of OpenID Connect discovery process completed.");
		});
}
util.inherits(OICStrategy, passport.Strategy);




OICStrategy.prototype.init = function() {
	if (!this.config.issuerHost) {
		throw new Error("Could not find requried config options issuerHost in openid-passport strategy initalization");
	}
	return Promise.resolve().then(() => {
		return openid.Issuer.discover(this.config.issuerHost);
	})
		.then((issuer) => {
			this.client = new issuer.Client(this.config);
		})
		.catch((err) => {
			console.error("ERROR", err);
		})
}

OICStrategy.prototype.authenticate = function(req, opts) {
	if (opts.callback) {
		return this.callback(req, opts);
	}

	var authurl = this.client.authorizationUrl(this.config);
	this.redirect(authurl);
}

OICStrategy.prototype.getUserInfo = function() {
	return this.client.userinfo(this.tokenSet.access_token)
		.then((userinfo) => {
			this.userinfo = userinfo;
		});
}



OICStrategy.prototype.callback = function(req, opts) {
	return this.client.authorizationCallback(this.config.redirect_uri, req.query)
		.then((tokenSet) => {
			this.tokenSet = tokenSet;
			return this.getUserInfo();
		})
		.then((userinfo) => {
			var user = new User(this.userinfo);
			user.token = this.tokenSet;
			user.idtoken = this.tokenSet.claims;
			console.log("USer");
			console.log(user);
			this.success(user);
		})
		.catch((err) => {
			console.error("Error processing callback", err);
			this.fail(err);
			// console.error("Error processing callback", err);
			// res.status(500).send("Error: " + err.message)
		});


	console.log("Processing callback", req.query)
	console.log(opts)
	if (req.query.code) {
		console.log("We got a code" + req.query.code)
	}
	var user = new User({
		"id": "123",
		"name": "Andreas"
	})
	this.success(user)
}

// OICStrategy.prototype.requireAuthentication = function(req, res) {
// 	if (!this.user) {
// 		return this.authenticate(req, res)
// 	}
// 	return res.redirect(path)
// }

OICStrategy.serializeUser = function(user, cb) {
	cb(null, user.serialize());
}
OICStrategy.deserializeUser = function(packed, cb) {
	cb(null, User.unserialize(packed));
}



exports.Strategy = OICStrategy;
