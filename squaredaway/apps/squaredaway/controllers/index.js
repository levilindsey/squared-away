var baseController = require('./base');
var View = require('../views/Base');
var templatePath = baseController.templatePath + '/layout';

var squaredAwayController = baseController.extend({
  name: 'squaredaway',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render(templatePath, squaredAwayController.content);
    });
  }
});

function getContent(callback) {
  squaredAwayController.content = {};
  callback();
}

module.exports = squaredAwayController;
