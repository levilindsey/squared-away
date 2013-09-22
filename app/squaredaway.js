// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config')();

var app = express();

var MongoClient = require('mongodb').MongoClient;
var Admin = require('./controllers/Admin');
var Home = require('./controllers/Home');

// All environments
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('squared-away-secret-176'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

MongoClient.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/fastdelivery', function(err, db) {
  if (err) {
    console.log('Sorry, there is no mongo db server running.');
  } else {
    var attachDB = function(req, res, next) {
      req.db = db;
      next();
    };

    // Add the routes for each of the controllers
    app.all('/admin*', attachDB, function(req, res, next) {
      Admin.run(req, res, next);
    });
    app.all('/', attachDB, function(req, res, next) {
      Home.run(req, res, next);
    });

    http.createServer(app).listen(config.port, function(){
      console.log('Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port);
      console.log('Express server listening on port ' + config.port);
    });
  }
});
