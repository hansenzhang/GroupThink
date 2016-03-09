// create an HTTP object, for responding to requests
var http = require('http');

// create the objects we'll need for doing our improved file routing
var fs = require('fs');
var parse = require('url').parse;
var join = require('path').join;
var root = __dirname + "/public/"; // relative to this script
// an object we wrote
var bye = require('./bye');

// our html file upload demo
var fileupload = require('./fileupload');


// server will run the given function on every request
var server = http.createServer(function (request, response) {
	// handle the "/" resource by calling do_main()
	if (request.url === '/') {
	    do_main(request, response);
	}
	// handle the "/hello" resource by calling do_hello()
	else if (request.url === '/hello') {
	    do_hello(request, response);
	}
	// handle /bye from another file
	else if (request.url === '/bye') {
	    bye.bye(request, response);
	}

	// HTML file upload route, for after the form is submitted
	else if (request.url === '/fileupload') {
	    fileupload.doFileUpload(request, response);
	}

	// handle requests for everything else
	else {
	    do_fileRequest(request, response);
	}
    });
// instruct the server to run on port 9000
server.listen(9000);

// status message, so we know the server is running
console.log('Chat server running at http://localhost:9000');

// our main route is just a text file that gives a welcome message
function do_main(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Welcome to my Node.js website.  Only the "hello" route is supported right now.\n');
}

// our hello route should be familiar...
function do_hello(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
}

// on any file request, parse the request, transform it into a file path, and
// serve the file
function do_fileRequest(request, response) {
    var url = parse(request.url);
    var path = join(root, url.pathname);
    var stream = fs.createReadStream(path);
    stream.pipe(response);
    stream.on('error', function(err) {
	    do_error(request, response);
	});
}

// on any error, print a 404 message, and give the name of the resource that
// was not found:
function do_error(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('404: ' + request.url + ' not found\n');
}

// set up our chat server, connect it to the server
var chatServer = require('./chatserver');
chatServer.listen(server);