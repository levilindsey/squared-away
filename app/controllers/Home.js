var BaseController = require('./Base');
var View = require('../views/Base');
var Model = require('../models/ContentModel');

var model = new Model();

var HomeController = BaseController.extend({
  name: 'Home',
  content: null,
  run: function(req, res, next) {
    model.setDB(req.db);
    var self = this;
    this.getContent(function() {
      var v = new View(res, 'home');
      v.render(self.content);
    });
  },
  getContent: function(callback) {
    var self = this;
    this.content = {};
    model.getList(function(err, records) {
      if (records.length > 0) {
        self.content.bannerTitle = records[0].title;
        self.content.bannerText = records[0].text;
      }
      callback();
    }, { type: 'home' });
  }
});

module.exports = HomeController;
