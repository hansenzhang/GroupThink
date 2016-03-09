var express = require('express');
var router = express.Router();
var groups = require('./groups');
var uploads = require('../public/javascripts/upload.js');
var message_ctrl = require('../middleware/messageCtrl.js');
var email_provider = message_ctrl.email_provider;
var ObjectId = require('mongoose').Types.ObjectId;

var fs = require('fs');
var path = require('path');

var group = require('../middleware/group');
var user = require('../middleware/user');

/* GET home page. */
module.exports = function(passport, app) {
    router.get('/', checkAuth, function (req, res, next) {
        user.getAll(req.user.id, function(users) {
            group.getFromId(req.user.groups, function(groups) {
                console.log(groups);
                if (groups !== undefined && groups.length > 0) {
                    req.user.group_obj = groups;
                    console.log(groups[0]);
                    res.redirect(groups[0]._id );
                } else {
                    res.render('group' , { user: req.user, users: users , group: '', groups: ''})
                }
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
        else {
            temp = req.user.id;
        }
        var newGroup = group.addGroup(temp, req.body.name, req.body.description);
        res.redirect(newGroup.id);
    });

    router.get('/login', function (req, res) {
        if (req.user) {
            res.redirect('/');
        }
        else {
            res.render('login');
        }
    });

    // Profile
    router.get('/profile', checkAuth, function (req, res) {
        group.getFromId(req.user.groups, function(groups) {
            user.getAll(req.user.id, function(users) {
                    res.render('profile', {user: req.user, users: users, groups: groups});
            });
        });
    });

    //Testing using Hello World
    router.get('/helloworld', function (req, res) {
        res.render('helloworld', { title: 'Hello, World!' })
    });

    // Upload
    router.get('/upload', function (req, res) {
        res.render('upload', { title: 'Upload' })
        //upload.doFormDemo(request, response);
    });

    router.post('/upload', function (req, res) {
        // Add current user to list of users
        uploads.doFormDemo(req, res);
        //res.redirect('groups/' +  newGroup.id);
    });


    //file info
    //upload tree
    router.get('/api/tree', function(req, res) {
               var _p;
               if (req.query.id == 1) {
               _p = path.resolve(__dirname, '..', 'public/uploads');
               processReq(_p, res);

               } else {
               if (req.query.id) {
               _p = req.query.id;
               processReq(_p, res);
               } else {
               res.json(['No valid data found here']);
               }
               }
               });

    //getting files
    // Serve a Resource
    router.get('/api/resource', function(req, res) {
               res.send(fs.readFileSync(req.query.resource, 'UTF-8'));
               });

    function processReq(_p, res) {
        var resp = [];
        fs.readdir(_p, function(err, list) {
                   for (var i = list.length - 1; i >= 0; i--) {
                   resp.push(processNode(_p, list[i]));
                   }
                   res.json(resp);
                   });
    }

    function processNode(_p, f) {
        var s = fs.statSync(path.join(_p, f));
        return {
            "id": path.join(_p, f),
            "text": f,
            "icon" : s.isDirectory() ? 'jstree-custom-folder' : 'jstree-custom-file',
            "state": {
                "opened": false,
                "disabled": false,
                "selected": false
            },
            "li_attr": {
                "base": path.join(_p, f),
                "isLeaf": !s.isDirectory()
            },
            "children": s.isDirectory()
        };
    }

    // Receiving Email
    router.post('/email', function(req, res) {
        email_provider.handleIncomingEmail(req, app.server);
        res.writeHead(200);
        res.end();
    });

    // Logout
    router.get('/logout', checkAuth, function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // Authentication callback
    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }));

    //app.use('/upload', uploads);
    //defien each group route
    router.get('/:id', checkAuth, function(req, res, next) {
        if (ObjectId.isValid(req.params.id)) {
        console.log('paramid is ' + req.params.id);
        group.getFromId(req.user.groups, function(groups) {
            user.getAll(req.user.id, function(users) {
                group.find(req.params.id, function(group) {
                    res.render('group', {user: req.user, users: users, group: group, groups: groups});
                });
            });
        });
        }
        else {
            return next(new Error('Id: ' + req.params.id + 'Not found'));
        }
    });
    app.use('/', router);
};

function checkAuth(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/login');
}
