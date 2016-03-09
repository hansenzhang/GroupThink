var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var config = require('./config');
var fs = require('fs');
var request = require('request');
var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

module.exports = function(passport) {

    // Needed by passport to serialize and deserialize
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Auth with google
    passport.use(new GoogleStrategy({
        clientID        : config.auth_env.clientID,
        clientSecret    : config.auth_env.clientSecret,
        callbackURL     : config.auth_env.callbackURL
    },
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            // try to find the user based on their google id
            User.findOne({ 'google_id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // user found!
                    return done(null, user);
                }
                var email = profile.emails[0].value;
                var newUser = new User();

                // capture fields
                newUser.google_id = profile.id;
                newUser.token = token;
                newUser.name  = profile.displayName;                    newUser.email = email;

                var image_url = profile._json['picture'];
                var basepath = __dirname.substring(0, __dirname.lastIndexOf("/"));
                var filepath = basepath + '/public/images/profile/' + profile.id + '.png';
                download(image_url, filepath, function () {
                    console.log('Saved picture ' + filepath);
                });

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                    });
            });
        });

    }));

};
