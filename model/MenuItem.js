const conn = require(process.env.PWD + '/conn');

function MenuItem(){
  this.addProduct = function(req, res, next){
    delete req.body.EventProductID
    conn.acquire(function(err,con){
      con.query('INSERT INTO EventProduct SET ?', [req.body], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          next()
        }
      });
    });
  }
  this.getAllProduct = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'ep.EventProductID, ep.NameEnglish, ep.NamePort, ep.Price, epu.NameEnglish as NameUnitEngl, epu.NamePort as NameUnitPort, ep.Active '+
                'FROM '+
                  'EventProduct ep INNER JOIN EventProductUnit epu '+
                'ON ep.Unit = epu.EventProductUnitID', function(err, result) {
        console.log(this.sql);
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allProduct = result
          next()
        }
      });
    });
  }
  this.getAllUnit = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT EventProductUnitID, NameEnglish, NamePort FROM EventProductUnit WHERE Active = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allUnit = result
          next()
        }
      });
    });
  }
}

module.exports = new MenuItem()
