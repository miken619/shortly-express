var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function(obj) {
    
    console.log(obj);
    //console.log(db.knex.schema.hasTable('users'), 'table name');
    //console.log(db.get('tableName'));
  }
});

module.exports = User;

// var db = require('../config');
// var Click = require('./click');
// var crypto = require('crypto');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   clicks: function() {
//     return this.hasMany(Click);
//   },
//   initialize: function() {
    
//     this.on('creating', function(model, attrs, options) {
//       console.log('link.js on creating');
//       var shasum = crypto.createHash('sha1');
//       console.log(shasum);
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });