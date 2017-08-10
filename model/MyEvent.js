const conn = require(process.env.PWD + '/conn');

function MyEvent(){
  this.getMyEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'e.EventCode, '+
                  'e.EventStatus_ID, '+
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
                  'e.CreateBy = ? OR e.ResponsibleByEvent = ? ORDER BY e.EventCode DESC', [req.session.matricula, req.session.matricula], function(err, result) {
        con.release();
        // console.log(this.sql);
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          // console.log(result)
          req.allMyEvent = result
          next()
        }
      })
    })
  }

  this.cancelEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE Event SET EventStatus_ID=4, ReasonCanceled=?, CanceledByMatricula_ID=?, CanceledAt = NOW() WHERE EventCode = ?', [req.body.ReasonCanceled, req.session.matricula, req.body.EventCode], function(err, result) {
        con.release();
        // console.log(this.sql);
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          // console.log(result)
          req.allMyEvent = result
          next()
        }
      })
    })
  }
}

module.exports = new MyEvent()
