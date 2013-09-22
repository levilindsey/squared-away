var _ = require('underscore');

var BaseController = {
  name: 'base',
  extend: function(properties) {
    return _.extend({}, this, properties);
  },
  run: function(req, res, next) {
    // Each child controller should implement its own run function
  }
};

module.exports = BaseController;
