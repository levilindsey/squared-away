describe('MongoDB', function() {
  var should = require('should');

  it('is there a server running', function(done) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb://127.0.0.1:27017/fastdelivery', function(err, db) {
      should.not.exist(err);
      done();
    });
  });
});
