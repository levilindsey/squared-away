var baseController = require('./base');
var View = require('../views/Base');

var pageMissingController = baseController.extend({
  name: 'pageMissing',
  content: null,
  run: function(req, res, next) {
    getContent(function sendContent() {
      res.render('pageMissing', pageMissingController.content);
    });
  }
});

function getContent(callback) {
  pageMissingController.content = {};
  callback();
}

module.exports = pageMissingController;
