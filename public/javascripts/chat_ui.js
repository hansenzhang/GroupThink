// create a socket that uses socket.io and is connected to the server
var socket = io.connect();

// handle 'submit' button
function processUserInput(chatApp, socket) {
    // get the message to send
    var message = $('#send-message').val();

    message = message.trim(); // Removes white space from beginning and end

    // if message is blank, don't send it
    if (message === "") {
        $('#send-message').val(null); // Resets input-field
        $('#send-message').focus();
        return;
    }

    // if the message starts with '/', assume that it is a system command
    // the normal case is that we have a non-system-command message
        // send the message to the Chat Server
        chatApp.sendMessage(group, message);
        // put the message in a div in the output window, and adjust scrolling
        $('#messages').append($('<div></div>').text(user.name + ': ' + message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    // clear the message input box
    $('#send-message').val('');
}

// Do this when the document is fully loaded, to configure the interface
$(document).ready(function() {
	// make a Chat object, for managing communication with the server
	var chatApp = new Chat(socket);

	// if we tried to change our /nick, then we'll get a nameResult message
	// back.  This handles the message
	socket.on('connect', function() {
    socket.emit('addUser', user, group);
		// create text for when the request succeeded
	});

	// whenever we get a non-nameResult message from the socket, we append it
	// to the message log
	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
    });

	// put the focus on the region where the user types a message
	$('#send-message').focus();

	// set the action for the click button
	$('#send-form').submit(function() {
		processUserInput(chatApp);
		return false;
	    });
    });
