const conn = require(process.env.PWD + '/conn');

function Departament(){
  this.all = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT iddepartamento, nomedepartamento FROM departamentos ORDER by nomedepartamento', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allDepartament = result
          next()
        }
      });
    });
  }
}

module.exports = new Departament()
