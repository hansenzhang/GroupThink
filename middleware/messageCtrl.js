/**
 * Created by tmccleerey on 4/3/15.
 */

var Group = require('../models/group');
var groupCtrl = require('../middleware/group');

var Message = require('../models/message');

var User = require('../models/user');
var userCtrl = require('../middleware/user');

var ObjectId = require('mongoose').Types.ObjectId;

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('mYRxdJymlGX6PpZmFFAfRg');

var fs = require('fs');

var socketio = require('socket.io');

var email_provider = {
    sendEmail: function (message, group, users) {

        //Send email to everyone in group except user who posted the message
        for (var i = 0; i < users.length; i++) {

            var user = users[i];
            var email = {
                //        "html": "<p>Example HTML content</p>",
                "text": message.userName + ': ' + message.text,
                "subject": "GroupThink: Update from your group " + group.name + " (" + group._id + ")",
                "from_email": "groupthink.cse398@gmail.com",
                "from_name": "GroupThink",
                "to": [
                    {
                        "email": user.email,
                        "name": user.name,
                        "type": "to"
                    }
                ],
                "headers": {
                    "Reply-To": "groupthink.cse398@gmail.com"
                },
                "important": false,
                "merge_language": "mailchimp",
                "global_merge_vars": [
                    {
                        "name": "merge1",
                        "content": "merge1 content"
                    }
                ],
                "merge_vars": [
                    {
                        "rcpt": "recipient.email@example.com",
                        "vars": [
                            {
                                "name": "merge2",
                                "content": "merge2 content"
                            }
                        ]
                    }
                ]
                //        "tags": [
                //            "password-resets"
                //        ]
            };
            var async = false;
            var ip_pool = "Main Pool";
            mandrill_client.messages.send({"message": email, "async": async, "ip_pool": ip_pool}, function (result) {
//                console.log(result);
                /*
                 [{
                 "email": "recipient.email@example.com",
                 "status": "sent",
                 "reject_reason": "hard-bounce",
                 "_id": "abc123abc123abc123abc123abc123"
                 }]
                 */
            }, function (e) {
                // Mandrill returns the error as an object with name and message keys
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
            });
        }

    },

    handleIncomingEmail: function (req, server) {

//        var io = socketio.listen(server);
//        io.sockets.in("Awesome Group").emit('message', {
//			    text: 'Tanner McCleerey' + ': ' + 'Hello World'
//        });

        var body = req.body;
        var subjectArray = [];

        process.env.TMPDIR = '.';

        // Handle attachments
        if (body.Attachments !== null && body.Attachments instanceof Array) {
            var re = /(?:\.([^.]+))?$/;
            for (var i = 0; i < body.Attachments.length; i++) {
                var name = body.Attachments[i].Name;
                var fileType = name.substr(name.length-3);
                var dest = __dirname;
                var basepath = dest.substring(0, dest.lastIndexOf("/"));

                dest = basepath + "/public/uploads/" + fileType + "/" + name;
                console.log("Writing file to " + dest);
                fs.writeFile(dest, body.Attachments[i].Content, 'base64', function(err) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                });
            }
        }

        // Handle messages
        // First, get user
        if (!body.From  || body.From === "") {
            return;
        }

        // Else
        userCtrl.getFromEmail(body.From, function (userArray) {
            if (userArray.length === 0) {
                return;
            }
            // Else

            var user = userArray[0];
            if (body.Subject) {
                subjectArray = body.Subject.split(/[()]+/);
            }
            if (subjectArray.length >= 3) {
                var groupId = subjectArray[subjectArray.length - 2];
                var message = body.StrippedTextReply.trim();
                console.log("groupId is " + groupId);
                if (message !== "") {
                    // GroupId matches MongoDB object ID format, and email isn't blank, so get group
                    groupCtrl.getFromId(groupId, function (groupArray) {

                        if (groupArray.length !== 0) {
                            var group = groupArray[0];
                            // Broadcast message to groups socket

                            // For right now, just write it to the database
                            message_ctrl.addMessage(group, user, message);

                            /*io.sockets.in(group.name).emit('message', {
                                    text: user.name + ': ' + message
                            })*/;
                            //                            var io = socketio.listen(server);

                            //                            var chatApp = new Chat(socket);
                            //                            socket.emit('addUser', user, group);
                            // create text for when the request succeeded
                            //                            chatApp.sendMessage(group, message);
                        }
                    });
                }
            }
        });

    }
};

var message_ctrl = {

    addMessage: function(group, user, messageContent) {

        var newMessage = new Message();
        newMessage.text = messageContent;
        newMessage.userName = user.name;
        newMessage.group = group._id;
        newMessage.user = user._id;

        newMessage.save(function(err, message) {

            if (err)
                throw err;

//            console.log(message);

            var messageId = [message._id];

            // Add message Id to message array for the group
            groupCtrl.addMessage(group._id, messageId, function(group) {
                //console.log("Successfully updated Group.");
            });

            // Send email update to every member of the group except for member who sent the message
            User.find({_id: { $in: group.users, $ne: user._id}}).exec(function(err, currentUsers) {
                    email_provider.sendEmail(message, group, currentUsers);
            });

        });

    },

    getMessages: function(groupId, offset, limit, callback) {

        var messageArray = null;

        Message.find({group: groupId}).sort({'_id': -1}).limit(limit).skip(offset).exec(function(err, messages) {
            if (err) {
                throw err;
            }
            callback(messages);
        });


    }
};

module.exports = message_ctrl;
module.exports.email_provider = email_provider;




