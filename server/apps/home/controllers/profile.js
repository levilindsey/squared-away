var baseController = require('./base');
var View = require('../views/Base');
var templatePath = baseController.templatePath + '/profile/';

var profileController = baseController.extend({
  name: 'profile',
  content: null,
  run: function(req, res, next, person) {
    getContent(function sendContent() {
      var template;
      var dirs = req.path.split('/');

      if (dirs[2] === '' || dirs.length === 2) {
        template = templatePath + person + 'About';
      } else {
        switch (dirs[2]) {
        case 'about':
          template = templatePath + person + 'About';
          break;
        case 'projects':
          template = templatePath + person + 'Projects';
          break;
        case 'resume':
          template = templatePath + person + 'Resume';
          break;
        case 'follow':
          template = templatePath + person + 'Follow';
          break;
        default:
          next();
          return;
        }
      }

      res.render(template, profileController.content);
    });
  }
});

function getContent(callback) {
  profileController.content = {};
  callback();
}

module.exports = profileController;
