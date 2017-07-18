const conn = require(process.env.PWD + '/conn');

function Transport(){
  this.all = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT EventTransportID, TypeVehicleEnglish, TypeVehiclePort, AmountSeat FROM EventTransport ORDER by EventTransportID', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allMeansOfTransport = result
          next()
        }
      });
    });
  }
}

module.exports = new Transport()
