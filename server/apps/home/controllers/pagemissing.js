var baseController = require('./base');
var View = require('../views/Base');
var templatePath = baseController.templatePath + '/pagemissing';

var pageMissingController = baseController.extend({
  name: 'pagemissing',
  content: null,
  run: function(req, res, next) {
    var pageName = req.host + req.path;
    getContent(pageName, function sendContent() {
      res.statusCode = 404;
      res.render(templatePath, pageMissingController.content);
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
