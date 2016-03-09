process.env.TMPDIR = '.';
// use formidable to handle form data
http = require('http'),
util = require('util');
// get the join function from the path module
var join = require('path').join;
// we also need the filesystem
var fs = require('fs');
var formidable = require('formidable');
var mkdirp = require('mkdirp');

// we also need querystring, to handle parsing the request
//var querystring = require('querystring');

// path to the template we're using
var template = './templates/formdemo.ejs';


// on any GET, just show the form, and on any POST, try to add to the
// collection
module.exports.doFormDemo = function(request, response) {
    switch (request.method) {
        case 'GET':
            show(response);
            break;
        case 'POST':
            // add(request, response);
            handle_upload(request, response);
           
            break;
        default:
            bad_request(response);
    }
}

// our collection of item/due-date pairs
var collection = [];

// we show the collection by rendering the template, passing in the whole
// collection
function show(response) {
    fs.readFile(template, function(err, data) {
                var output = ejs.render(data.toString(), {items : collection});
                response.setHeader('Content-type', 'text/html');
                response.end(output);
                });
};

// on a bad request, print an error
function bad_request(response) {
    console.log("");
    response.statusCode = 400;
    response.setHeader('Content-Type:', 'text/plain');
    response.end('Bad Request');
}

// handle a post:
function add(request, response) {
    // we asynchronously get all of the data from the request's query string
    var qs = '';
    request.setEncoding('utf8');
    request.on('data', function(chunk) { qs += chunk; });
    // when we have the whole query string, parse it and push its fields into
    // the collection
    request.on('end', function() {
               var obj = querystring.parse(qs);
               collection.push({item: obj.item, due: obj.due});
               // finish by showing the page, with the new data
               show(response);
               });

}


// handle a form submission (POST)
//uploads locally without storing
function handle_upload(request, response) {
    // check if we are working with form data from a multipart form
    var type = request.headers['content-type'] || '';
    var bad_type = (0 != type.indexOf('multipart/form-data'));
    if (bad_type) {
        bad_request(request, response);
        return;
    }


    // get the form
    var form = new formidable.IncomingForm(),
    files = [],
    fields = [];
    // when the form is done being parsed, formidable calls this
    form.parse(request, function(err, fields, files) {
        // move the file to the desired location
        console.log("attempting rename from " + path + " to " + fname);
        fs.rename(path, fname, function (err) {
            if (err) {
                  console.log("error:"+err);
                response.end('error!');
            }
            else {
                console.log("upload complete");
                response.redirect('/upload');
            }
        });
    });

    form.on('field', function(field, value) {
        console.log(field, value);
        fields.push([field, value]);
    });

    // the output name
    var fname = false;
    // the path where the file is temporarily stored
    var path = false;
    // this is for storing the extra field from the HTML form
    var name = "";

    // when any form field is parsed, formidable calls this
    form.on('field', function(field, value) {

    // 'name' is the /name/ of the HTML /input/
        if (field === 'name') {
            name = value;
    }



    });

    // when any file is parsed, formidable calls this
    form.on('file', function(name, file) {

        if (name === 'file') { // 'file' is the /name/ of the HTML /input/
            // During development, it's nice to see file
            // console.log(file);

            // get the path where the file was saved... it'll be some temp
            // location
            path = file['path'];
            // console.log("path: "+path);
            // create the desired path for the file.  Note that we preserve
            // the original file name, which we get from file['name'], but we
            // append it with a timestamp
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!

            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            var today = mm + "-" + dd + "-" + yyyy;
            var filetype = file['name'].split('.').pop();
            var dir = __dirname + '/../uploads/' + filetype;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            //}
            console.log("uploading...");
            fname = join(__dirname, '../uploads/' + filetype + '/' + file['name']);
            console.log("uploading done...");
        }
    });}

/*
 getFiles('/Users/jenniferbarry/Documents/School/Lehigh/Spring2015/EES004/Topic5');
function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            console.log(name);
        }
    }
    return files_;
}

*/
