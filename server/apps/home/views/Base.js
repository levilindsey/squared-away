var _ = require('underscore');

var BaseView = function(res, template) {
  this.res = res;
  this.template = template;
};

BaseView.prototype = {
  // Return a new extended View constructor with all of the properties of this
  // current base View constructor in addition to the given properties.
  extend: function(properties) {
    var Child = function(res, template) {
      BaseView.apply(this, [res, template]);
    };
    Child.prototype = {};
    Child.prototype.prototype = this;
    Child.prototype = _.extend(Child.prototype, properties);
    return Child;
  },

  // Send the page to the client.
  render: function(data) {
    if (this.res && this.template) {
      this.res.render(this.template, data);
    }
  }
};

module.exports = BaseView;
