var baseController = require('./base');
var View = require('../views/Base');

var weddingController = baseController.extend({
  name: 'wedding',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render('wedding/wedding', weddingController.content);
    });
  }
});

function getContent(callback) {
  weddingController.content = {};
  callback();
}

module.exports = weddingController;
