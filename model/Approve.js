const conn = require(process.env.PWD + '/conn');

function Approve(){

  this.getEventToApprove = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'e.EventCode, '+
                  'e.Type, '+
                  'e.CreateBy, '+
                  'e.ResponsibleByEvent, '+
                  'e.Name AS title, '+
                  'e.StartEvent AS start, '+
                  'e.EndEvent AS end, '+
                  'es.StatusName, '+
                  'e.DepartureFrom, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                'WHERE '+
                  'e.EventStatus_ID = 1', [], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allEventToApprove = result
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
          req.allEventAvaliados = result
          next()
        }
      });
    });
  }
}

module.exports = new Approve()
