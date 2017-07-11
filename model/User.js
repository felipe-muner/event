const conn = require(process.env.PWD + '/conn');

function User(){
  this.allActive = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT * FROM usuarios WHERE ativo = 1 ORDER BY nomeusuario', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allActiveUser = result
          next()
        }
      });
    });
  }
}

module.exports = new User()
