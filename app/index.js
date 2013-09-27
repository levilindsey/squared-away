var config = require('./config')();
var server_worker = require('./server_worker');

var timeouts = [];

if (config.nodejitsu) {
  // Nodejitsu automatically handles clustering and persistence for me

  server_worker.start(null, config);
} else {
  // Handle clustering and persistence manually
// TODO: handle persistence with the forever package
  var cluster = require('cluster');
  var numCPUs = require('os').cpus().length;

  if (cluster.isMaster) {
    setUpEventHandlers();

    // Fork workers
    for (var i = 0; i < numCPUs; ++i) {
      cluster.fork();
    }
  } else {
    server_worker.start(cluster, config);
  }
}

function setUpEventHandlers() {
  cluster.on('fork', function(worker) {
    console.log('fork: worker=' + worker.process.pid);
    timeouts[worker.id] = setTimeout(function() {
      console.error('timeout before listening: worker=' + worker.process.pid);
    }, 2000);
  });

  cluster.on('listening', function(worker, address) {
    clearTimeout(timeouts[worker.id]);
    console.log('listening: worker=' + worker.process.pid);
  });

  cluster.on('exit', function(worker, code, signal) {
    clearTimeout(timeouts[worker.id]);
    console.error('exit: worker=' + worker.process.pid + 
      ': exitCode=' + worker.process.exitCode + 
      '; code=' + code + 
      '; signal=' + signal);
    cluster.fork();
  });

  cluster.on('disconnect', function(worker) {
    console.error('disconnect: worker=' + worker.process.pid);
  });
}
