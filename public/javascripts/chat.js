// our Chat object has one field: a socket
var Chat = function(socket) {
    this.socket = socket;
};

// the UI routes us here when the submit button is pressed and the text didn't
// start with '/'.  We take the message, turn it into JSON, and send it on
// the socket
Chat.prototype.sendMessage = function(group, text) {
    var message = {
        text: text,
        group: group
    };
    this.socket.emit('message', message);
};

// the UI routes us here when the submit button is pressed and the text did
// start with '/'.
Chat.prototype.processCommand = function(command) {
    // split the message, figure out what the command (first word) is
    var words = command.split(' ');
    var command = words[0].substring(1, words[0].length).toLowerCase();

    switch (command) {
	// if it's a nickname change, send the desired nickname, return false
	// to indicate that there will be no output
    case 'nick':
        words.shift();
        var name = words.join(' ');
        this.socket.emit('nameAttempt', name);
        return false;
	// otherwise, it's an unknown request, so return some text to display
    default:
	return 'Unrecognized command.';
    };
};
