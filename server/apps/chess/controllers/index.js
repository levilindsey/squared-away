var baseController = require('./base');
var View = require('../views/Base');
var templatePath = baseController.templatePath + '/chess';

var chessController = baseController.extend({
  name: 'chess',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render(templatePath, chessController.content);
    });
  }
});

function getContent(callback) {
  chessController.content = {};
  callback();
}

module.exports = chessController;
