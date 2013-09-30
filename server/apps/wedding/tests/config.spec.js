describe('Configuration setup', function() {
  var should = require('should');
  var config;

  it('should load local configurations', function(done) {
    config = require('../config')();
    config.mode.should.equal('local');
    done();
  });

  it('should load staging configurations', function(done) {
    config = require('../config')('staging');
    config.mode.should.equal('staging');
    done();
  });

  it('should load production configurations', function(done) {
    config = require('../config')('production');
    config.mode.should.equal('production');
    done();
  });
});
