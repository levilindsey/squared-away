var BaseController = require('./Base');
var View = require('../views/Base');
var Model = require('../models/ContentModel');
var crypto = require('crypto');
var fs = require('fs');

var model = new Model();

var AdminController = BaseController.extend({
  name: 'Admin',
  username: 'admin',
  password: 'admin',

  // Send the page to the client.
  run: function(req, res, next) {
    var self = this;
    if (self.authorize(req)) {
      model.setDB(req.db);
      req.session.fastdelivery = true;
      req.session.save();
      var v = new View(res, 'admin');
      self.del(req, function() {
        self.form(req, res, function(formMarkup) {
          self.list(function(listMarkup) {
            v.render({
              title: 'Administration',
              content: 'Welcome to the control panel',
              list: listMarkup,
              form: formMarkup
            });
          });
        });
      });
    } else {
      var v = new View(res, 'admin-login');
      v.render({
        title: 'Please login'
      });
    }
  },

  // Check whether the client is logged in as an administrator.
  authorize: function(req) {
    return (
      // Are we already in a session?
      req.session &&
      req.session.fastdelivery &&
      req.session.fastdelivery === true
    ) || (
      // Are we successfully starting a session?
      req.body &&
      req.body.username === this.username &&
      req.body.password === this.password
    );
  },

  // Fetch the data and then populate an HTML table with the data.
  list: function(callback) {
    model.getList(function(err, records) {
      var markup = '<table>';
      // The header
      markup += '\
        <tr>\
          <td><strong>Type</strong></td>\
          <td><strong>Title</strong></td>\
          <td><strong>Picture</strong></td>\
          <td><strong>Actions</strong></td>\
        </tr>\
      ';
      // Each of the data records gets its own row
      for (var i = 0; record = records[i]; ++i) {
        markup += '\
          <tr>\
            <td>' + record.type + '</td>\
            <td>' + record.title + '</td>\
            <td><img class="list-picture" src="' + record.picture + '" /></td>\
            <td>\
              <a href="/admin?action=delete&id=' + record.id + '">Delete</a>&nbsp;&nbsp;\
              <a href="/admin?action=edit&id=' + record.id + '">Edit</a>\
            </td>\
          </tr>\
        ';
      }
      markup += '</table>';
      callback(markup);
    });
  },

  // Show and check the form.
  form: function(req, res, callback) {
    var returnTheForm = function() {
      if (req.query && req.query.action === 'edit' && req.query.id) {
        model.getList(function(err, records) {
          if (records.length > 0) {
            var record = records[0];
            res.render('admin-record', {
              id: record.id,
              text: record.text,
              title: record.title,
              type: '<option value="' + record.type + '">' + record.type + '</option>',
              picture: record.picture,
              pictureTag: record.picture !== '' ? '<img class="list-picture" src="' + record.picture + '" />' : ''
            }, function(err, html) {
              callback(html);
            });
          } else {
            res.render('admin-record', {}, function(err, html) {
              callback(html);
            });
          }
        }, { id: req.query.id });
      } else {
        res.render('admin-record', {}, function(err, html) {
          callback(html);
        });
      }
    };

    if (req.body && req.body.formsubmitted === 'yes') {
      var data = {
        title: req.body.title,
        text: req.body.text,
        type: req.body.type,
        picture: this.handleFileUpload(req),
        id: req.body.id
      };

      model[req.body.id !== '' ? 'update' : 'insert'](data, function(err, objects) {
        returnTheForm();
      });
    } else {
      returnTheForm();
    }
  },

  // If the request contains a delete action and a record id, then delete that
  // record.
  del: function(req, callback) {
    if (req.query && req.query.action === 'delete' && req.query.id) {
      model.remove(req.query.id, callback);
    } else {
      callback();
    }
  },

  // TODO: get rid of this functionality
  handleFileUpload: function(req) {
    if (!req.files || !req.files.picture || !req.files.picture.name) {
      return req.body.currentPicture || '';
    }
    var data = fs.readFileSync(req.files.picture.path);
    var fileName = req.files.picture.name;
    var uid = crypto.randomBytes(10).toString(16);
    var dir = __dirname + '/../public/uploads/' + uid;
    fs.mkdirSync(dir, '0777');
    fs.writeFileSync(dir + '/' + fileName, data);
    return '/uploads/' + uid + '/' + fileName;
  }
});

module.exports = AdminController;
