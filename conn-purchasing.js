var mysql = require('mysql');

function Connection() {
  this.pool = null;

  this.init = function() {
    this.pool = mysql.createPool({
      connectionLimit: process.env.PURCHASING_DB_POOL,
      host: process.env.PURCHASING_DB_HOST,
      user: process.env.PURCHASING_DB_USER,
      password: process.env.PURCHASING_DB_PASS,
      database: process.env.PURCHASING_DB_BASE,
      dateStrings: 'date'
    });
  };

  this.acquire = function(callback) {
    this.pool.getConnection(function(err, connection) {
      callback(err, connection);
    });
  };
}

module.exports = new Connection();
