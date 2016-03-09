// app/models/user.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = Schema({
        name         : String,
        email        : String,
        google_id    : String,
        token        : String,
        groups       : [Schema.Types.ObjectId]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
