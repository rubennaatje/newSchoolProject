var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var memcached = require('memcached');
var MemcachedStore = require('connect-memcached')(session);


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup PROXIMO_URL
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'bowercomponents')));
/*app.use(session({
  secret  : 'MinionLovers'
  , key     : 'test'
  , proxy   : 'true'
  , store   : new MemcachedStore({
    hosts: ['127.0.0.1:11211'],
    secret: '123, easy as ABC. ABC, easy as 123' // Optionally use transparent encryption for memcached session data
  })
  ,resave: true
  ,saveUninitialized: true
}));*/
app.use(session({secret: '1234567890QWERTY',resave: true,saveUninitialized: true}));
/*
 cd c:/users/ruben/workspace/memcached

 memcached -d run

 In admin !XD
 */


app.use('/', routes);
app.use('/users', users);

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
