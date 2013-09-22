var _ = require('underscore');

var BaseModel = function(db) {
  this.db = db;
};

BaseModel.prototype = {
  // Return a new extended Model constructor with all of the properties of this
  // current base Model constructor in addition to the given properties.
  extend: function(properties) {
    var Child = function(db) {
      BaseModel.apply(this, [db]);
    };
    Child.prototype = {};
    Child.prototype.prototype = this;
    Child.prototype = _.extend(Child.prototype, properties);
    return Child;
  },

  // Set a new database for this Model.
  setDB: function(db) {
    this.db = db;
  },

  // Return the data for this Model.
  collection: function() {
    if (this._collection) {
      return this._collection;
    }
    this._collection = this.db.collection('fastdelivery-content');
    return this._collection;
  }
};

module.exports = BaseModel;
