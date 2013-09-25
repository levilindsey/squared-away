// The apps stored on this server
var apps = [
  {
    name: 'squaredaway'
  },
  {
    name: 'wedding'
  }
];

// Module dependencies
var express = require('express');
var stylus = require('stylus');
var mongodb = require('mongodb');
var http = require('http');
var config = require('./config')();
var homeController = require('./controllers/home');
var profileController = require('./controllers/profile');
var squaredAwayController = require('./controllers/squaredAway');
var weddingController = require('./controllers/wedding');
var pageMissingController = require('./controllers/pageMissing');

var app = express();
var MongoClient = mongodb.MongoClient;

// Set some settings to use with express
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

// Use these middleware functions
app.use(express.favicon());// TODO: how to switch favicons depending on which branch of the site is being visited?
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('jackie-and-levi-secret-176'));// TODO: use an actual secret string here; retrieve this somehow from an external file which is not uploaded to GitHub?
app.use(express.session());
setupStaticFiles();
app.use(app.router);

// development only
if (app.get('env') === process.env.NODE_ENV) {
  app.use(express.errorHandler());
}

// Assign controllers for each of the relevent routes
app.get('/', function(req, res, next) {
  homeController.run(req, res, next);
});
app.get(/^\/jackie(?:\/.*)?$/, function(req, res, next) {
  profileController.run(req, res, next, 'jackie');
});
app.get(/^\/levi(?:\/.*)?$/, function(req, res, next) {
  profileController.run(req, res, next, 'levi');
});
app.get(/^\/squaredaway(?:\/.*)?$/, function(req, res, next) {
  squaredAwayController.run(req, res, next);
});
app.get(/^\/wedding(?:\/.*)?$/, function(req, res, next) {
  weddingController.run(req, res, next);
});
app.all('*', function(req, res, next) {
  pageMissingController.run(req, res, next);
});

function start() {
  http.createServer(app).listen(config.port, function(){
    console.log('Express server listening on port ' + config.port);
  });
}

function setupStaticFiles() {
  app.use(stylus.middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));

  app.use(stylus.middleware(__dirname + '/public/home'));
  app.use(express.static(__dirname + '/public/home'));
//  for (var i = 0; i < apps.length; ++i) {
//    app.use(stylus.middleware(__dirname + '/public'));
//    app.use(express.static(__dirname + '/public'));
//  }
}

module.exports.start = start;
