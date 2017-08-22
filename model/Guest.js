const conn = require(process.env.PWD + '/conn');

function Guest(){
  this.bulkGuestEvent = function(req, res, next){
    if(JSON.parse(req.body.guests).length === 0){
       next()
    }else {
      let bulkQuery = JSON.parse(req.body.guests).map(function(e){
        let item = []
        new Array().push.call(item, req.nextEventCode, e.type, e.name)
        return item
      })
      conn.acquire(function(err,con){
        con.query('INSERT INTO EventGuest(Event_ID, Type, NameGuest) VALUES ?', [bulkQuery], function(err, result) {
          con.release();
          if(err){
            res.render('error', { error: err } );
          }else{
            // console.log('gravei os convidados no guest');
            // console.log(result);
            next()
          }
        });
      });
    }
  }

  this.guestOfEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT Type, NameGuest FROM EventGuest WHERE Event_ID = ?', [req.findEventByCode.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          // console.log('fields from guest');
          req.findEventByCode.guests = result
          // console.log(req.findEventByCode.guests);
          next()
        }
      })
    })
  }

  this.clearGuest = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('DELETE FROM EventGuest WHERE Event_ID = ?', [req.nextEventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          next()
        }
      })
    })
  }
}

module.exports = new Guest()
