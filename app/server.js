// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config')();
var MongoClient = require('mongodb').MongoClient;
var Admin = require('./controllers/Admin');
var Home = require('./controllers/Home');

var app = express();

// Set some settings to use with express
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

// Use these middleware functions
app.use(express.favicon('public/images/favicon.ico'));// TODO: how to switch favicons depending on which branch of the site is being visited
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('squared-away-secret-176'));// TODO: use an actual secret string here; retrieve this somehow from an external file which is NOT uploaded to GitHub??
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if (app.get('env') === process.env.NODE_ENV)) {
  app.use(express.errorHandler());
}

function start(route) {
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
      app.all('*', function(req, res, next) {
        res.end('404');// TODO: handle this in a separate controller; also, give it some more content
      });

      http.createServer(app).listen(config.port, function(){
        console.log('Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port);
        console.log('Express server listening on port ' + config.port);
      });
    }
  });
}

module.exports.start = start;
