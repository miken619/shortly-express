var db = require('../config');




var sessions = db.Model.extend({
  tableName: 'sessions',
  hasTimestamps: true,

});

module.exports = sessions;