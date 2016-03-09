// pull in socket.io
var socketio = require('socket.io');

var messageCtrl = require('./messageCtrl');

// we use this to assign unique names when new people join

// for name lookup: get a name from a socket's id
var rooms = {};
var usernames = {};

// the public method of this file starts listening for new socket requests
exports.listen = function(server) {
    // listen on the socket
    var io = socketio.listen(server);

    // when a new connection is created, run this code
    io.sockets.on('connection', function (socket) {

        socket.on('addUser', function (user, group) {
        //null check our socket variables

            if (!user || !group) {
              return;
            }
            socket.user = user;
            socket.group = group;

            socket.join(group.name);
            messageCtrl.getMessages(group._id, 0, 10, function(messageList) {
                for (var i = messageList.length-1; i >= 0 ; i--) {
                    socket.emit('message', {
                        text: messageList[i].userName + ': ' + messageList[i].text
                    });
                }
            });
            //socket.emit('message', { group: group, text : "you have joined " + group.name });
            //socket.broadcast.to(group.name).emit('message', { text: socket.user.name + " has joined."});
        });

	    // set a handler so that when this user sends a message, it gets
	    // broadcast to the whole room
	    socket.on('message', function(message) {
        //null check our socket variables
            if (!socket.user || !socket.group) {
              return;
            }
            socket.broadcast.to(message.group.name).emit('message', {
			    text: socket.user.name + ': ' + message.text
            });
            messageCtrl.addMessage(message.group, socket.user, message.text);

		});

	    // handle disconnection by deleting the name
        try {
            socket.on('disconnect', function () {
              if (!socket.group) {
                return;
              }
              socket.leave(socket.group.name);
            });
        } catch (ex) {
            console.log(ex);
        }
	});
};
