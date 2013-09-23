var baseController = require('./base');
var View = require('../views/Base');

var profileController = baseController.extend({
  name: 'profile',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render('profile', profileController.content);
    });
  }
});

function getContent(callback) {
  profileController.content = {};
  callback();
}

module.exports = profileController;
