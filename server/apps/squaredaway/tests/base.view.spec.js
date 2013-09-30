describe('Base view', function() {
  var View = require('../views/Base');
  var should = require('should');

  it('create and render new view', function(done) {
    var responseMockup = {
      render: function(template, data) {
        data.myProperty.should.equal('value');
        template.should.equal('template-file');
        done();
      }
    };
    var v = new View(responseMockup, 'template-file');
    v.render({myProperty: 'value'});
  });

  it('should be extendable', function(done) {
    var v = new View();
    var OtherView = v.extend({
      myCustomViewMethod: function() {},
      render: function(data) {
        data.prop.should.equal('yes');
        done();
      }
    });
    var otherViewInstance = new OtherView();
    otherViewInstance.should.have.property('myCustomViewMethod');
    otherViewInstance.render({prop: 'yes'});
  });

  it('extending should not modify the properties of the original View', function(done) {
    var v = new View();
    var OtherView = v.extend({
      myCustomViewMethod: function() {}
    });
    v.should.not.have.property('myCustomViewMethod');
    done();
  });
});
