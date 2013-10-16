var _ = require('underscore');

var baseController = {
  name: 'base',
  templatePath: 'apps/chess/templates',
  extend: function(properties) {
    return _.extend({}, this, properties);
  },
  run: function(req, res, next) {
    console.error('Child controllers must override the base run function');
  }
};

module.exports = baseController;
