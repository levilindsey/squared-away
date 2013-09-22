describe('Base controller', function() {
  var BaseController = require('../controllers/Base');
  var should = require('should');

  it('should have a method extend which returns a child instance', function(done) {
    BaseController.should.have.property('extend');
    var child = BaseController.extend({ name: 'child controller' });
    child.should.have.property('run');
    child.should.have.property('name');
    child.name.should.equal('child controller');
    done();
  });

  it('should be able to create different children', function(done) {
    var child1 = BaseController.extend({ name: 'child1', customProperty: 'value' });
    var child2 = BaseController.extend({ name: 'child2' });
    child1.name.should.not.equal(child2.name);
    child2.should.not.have.property('customProperty');
    done();
  });
});
