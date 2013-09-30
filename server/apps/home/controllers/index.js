var baseController = require('./base');
var View = require('../views/Base');
var templatePath = baseController.templatePath + '/home';

var homeController = baseController.extend({
  name: 'home',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render(templatePath, homeController.content);
    });
  }
});

function getContent(callback) {
  homeController.content = {};
  callback();
}

module.exports = homeController;
