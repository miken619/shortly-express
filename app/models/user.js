var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {

    

  }
});

module.exports = User;

