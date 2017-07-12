const conn = require(process.env.PWD + '/conn');

function Approve(){
  this.all = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT , nomedepartamento FROM departamentos ORDER by nomedepartamento', function(err, result) {
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
  this.aproveEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE Event SET EventStatus_ID = ?, ApprovedAt = NOW(), ApprovedBy = ? WHERE EventCode = ?', [,], function(err, result) {
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

module.exports = new Approve()
