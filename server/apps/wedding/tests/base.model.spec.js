describe('Base model', function() {
  var Model = require('../models/Base');
  var should = require('should');

  var dbMockup = {};
  var model;

  beforeEach(function() {
    model = new Model(dbMockup);
  });

  it('should create a new model', function(done) {
    model.should.have.property('db');
    model.should.have.property('extend');
    done();
  });

  it('should be extendable', function(done) {
    var OtherTypeOfModel = model.extend({
      myCustomModelMethod: function() {}
    });
    var model2 = new OtherTypeOfModel(dbMockup);

    model2.should.have.property('db');
    model2.should.have.property('myCustomModelMethod');
    done();
  });
  
  it('extending should not modify the properties of the original Model', function(done) {
    var OtherTypeOfModel = model.extend({
      myCustomModelMethod: function() {}
    });

    model.should.not.have.property('myCustomModelMethod');
    done();
  });
});

