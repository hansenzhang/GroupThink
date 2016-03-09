// app/models/user.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our group model
var messageSchema = Schema({
        text     : String,
        userName : String,
        user       : Schema.Types.ObjectId,
        group       : Schema.Types.ObjectId,
        createdAt   : {type: Date}
});

messageSchema.pre('save', function(next){
  now = new Date();
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

// create the model for groups and expose it to our app
module.exports = mongoose.model('Message', messageSchema);