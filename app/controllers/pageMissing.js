var baseController = require('./base');
var View = require('../views/Base');

var pageMissingController = baseController.extend({
  name: 'pageMissing',
  content: null,
  run: function(req, res, next) {
    var pageName = req.host + req.path;
    getContent(pageName, function sendContent() {
      res.statusCode = 404;
      res.render('pageMissing', pageMissingController.content);
    });
  }
});

function getContent(pageName, callback) {
  pageMissingController.content = {};
  pageMissingController.content.status = 404;
  pageMissingController.content.pageName = pageName;
  callback();
}

module.exports = pageMissingController;
