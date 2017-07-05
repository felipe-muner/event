var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '192.168.4.2',
  user     : 'budget',
  password : 'british@admin',
  database : 'tbscorp'
});

connection.connect();

connection.query('SELECT * from departamentos', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});

connection.end();
