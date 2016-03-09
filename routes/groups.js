var group = require('../middleware/group');
var user = require('../middleware/user');

// Group routes
var express = require('express');
var router = express.Router();

//define the home page route
router.get('/', function(req, res) {
  user.getAll(req.user.id, function(users) {
//  console.log(users);
    group.getFromId(req.user.groups, function(groups) {
//      console.log(groups);
      req.user.group_obj = groups;
      console.log(req.user.group_obj);
      res.render('index', { groups : groups, users: users });
    });
  });
});

router.post('/', function(req, res) {
  // Add current user to list of users
  var temp = req.body.users;
  if (temp) { // Add current user's ID to user list
      if (!(temp instanceof Array)) { // Castes temp as array if temp necessary, i.e. only one user was selected
          temp = [temp];
      }
      temp.unshift(req.user.id);
  }
  else
    temp = req.user.id;
  var newGroup = group.addGroup(temp, req.body.name, req.body.description);
  res.redirect('groups/' +  newGroup.id);
});

//define the about route
router.get('/:id', function(req, res) {
  group.getFromId(req.user.groups, function(groups) {
    user.getAll(req.user.id, function(users) {
      group.find(req.params.id, function(group) {
        console.log(groups);
        res.render('group', {user: req.user, users: users, group: group, groups: groups});
      });
    });
  });
});

module.exports = router;
