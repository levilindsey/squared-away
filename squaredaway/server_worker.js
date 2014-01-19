// Module dependencies
var express = require('express');
//var MongoStore = require('connect-mongo')(express);
var stylus = require('stylus');
var MongoClient = require('mongodb').MongoClient;
var domain = require('domain');
var http = require('http');
var homeController = require('./apps/home/controllers/index');
var profileController = require('./apps/home/controllers/profile');
var pageMissingController = require('./apps/home/controllers/pagemissing');

// Connect with each of the apps
var squaredAwayController = require('./apps/squaredaway/controllers/index');
var weddingController = require('./apps/wedding/controllers/index');
var chessController = require('./apps/chess/controllers/index');
var APPS = [
  'squaredaway',
  'wedding',
  'chess'
];

var app = express();

var config;
var server;
var cluster;

setUpMiddleware();
setUpRoutes();

function start(cluster, config) {
  this.cluster = cluster;
  this.config = config;
  this.server = http.createServer(app);

  this.server.listen(config.port, function() {
    console.log('Express server listening on port ' + config.port);
  });
}

function setUpMiddleware() {
  // Set some settings to use with express
  app.set('views', __dirname);
  app.set('view engine', 'jade');

  // Use these middleware functions
  app.use(function(req, res, next) {
    // Use domains to coherently handle errors
    var d = domain.create();
    d.on('error', function(er) {
      console.error('domain error: on REQUEST', er.stack);

      try {
        var killTimer = setTimeout(function() {
          process.exit(1);
        }, 30000);
        killTimer.unref();

        // Stop receiving new requests
        server.close();

        if (cluster) {
          // Trigger a new working being forked
          cluster.worker.disconnect();
        }

        // Try to respond to the client with an error
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Whoops! Sorry, our code broke!\n');
      } catch (er2) {
        console.error('Error sending 500', er2.stack);
      }
    });
    d.add(req);
    d.add(res);
    d.run(next);
  });
  app.use(express.favicon());// TODO: how to switch favicons depending on which branch of the site is being visited?
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  //app.use(express.cookieParser('jackie-and-levi-secret-176'));// TODO: use an actual secret string here; retrieve this somehow from an external file which is not uploaded to GitHub?
  //app.use(express.session());
  setUpStaticFiles();
  app.use(app.router);

  // development only
  if (app.get('env') === process.env.NODE_ENV) {
    app.use(express.errorHandler());
  }  
}

function setUpStaticFiles() {
  // Set up the home/general site files
  var mountPath;
  var staticPath = __dirname + '/apps/home/public';
  app.use(stylus.middleware(staticPath));
  app.use(express.static(staticPath));

  // Set up each of the apps' specific files
  for (var i = 0; i < APPS.length; ++i) {
    mountPath = '/' + APPS[i];
    staticPath = __dirname + '/apps/' + APPS[i] + '/public';
    app.use(mountPath, stylus.middleware(staticPath));
    app.use(mountPath, express.static(staticPath));
  }
}

function setUpRoutes() {
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
  app.get(/^\/chess(?:\/.*)?$/, function(req, res, next) {
    chessController.run(req, res, next);
  });
  app.all('*', function(req, res, next) {
    pageMissingController.run(req, res, next);
  });
}

module.exports.start = start;
