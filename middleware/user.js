var User = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  getAll: function(id, callback) {
    User.find({ _id : {$ne: ObjectId(id) }}, function(err, users) {
      callback(users);
    })
  },
  // deprecated
  addGroup: function(id, group_id, callback) {
    User.findByIdAndUpdate(id, { $addToSet: { groups: group_id }}, function (err, user) {
      if (err)
        throw err;
      callback(user);
    });
  },
  // More efficient way to do it
  addAllGroup: function(ids, group_id, callback) {
    User.update({ _id: { $in: ids}},
                { $addToSet: { groups: group_id }},
                { multi: true }, function (err, user) {
      if (err)
        throw err;
      callback(user);
    });
  },
  getFromEmail: function(userEmails, callback) {
      if (!(userEmails instanceof Array)) {
        userEmails = [userEmails];
      }
      User.find({'email': {$in: userEmails}}, function(err, userArray) {
          if (err)
                throw err;
          callback(userArray);
      })
  }

};
