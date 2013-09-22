var BaseModel = require('./Base');
var crypto = require('crypto');

var model = new BaseModel();

var ContentModel = model.extend({
  insert: function(data, callback) {
    data.id = crypto.randomBytes(20).toString(16);
    this.collection().insert(data, {}, callback || function() {});
  },
  update: function(data, callback) {
    this.collection().update({ id: data.id }, data, {}, callback || function() {});
  },
  getList: function(callback, query) {
    this.collection().find(query || {}).toArray(callback);
  },
  remove: function(id, callback) {
    this.collection().findAndModify({ id: id }, [], {}, { remove: true }, callback);
  }
});

module.exports = ContentModel;
