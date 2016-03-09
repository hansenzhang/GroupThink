var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var util = require('util');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');

var database = require('./middleware/database.js');

var db_server = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/heroku_app17976629';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }))

// Setup middleware
mongoose.connect(db_server);

require('./middleware/passport')(passport); //configure passport

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({ secret: 'thisisatest', saveUninitialized : true, resave : true } ));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// Load routes
var routes = require('./routes/index')(passport, app);


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db_server;
    next();
});

//app.use('/', routes);



//app.post('/uploads', function(req,res){
     //    console.log(req.body);
      //   })


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

