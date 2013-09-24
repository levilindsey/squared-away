var baseController = require('./base');
var View = require('../views/Base');

var homeController = baseController.extend({
  name: 'home',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render('home', homeController.content);
    });
  }
});

function getContent(callback) {
  homeController.content = {};
  callback();
}

module.exports = homeController;
