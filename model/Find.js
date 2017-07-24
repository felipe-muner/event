const conn = require(process.env.PWD + '/conn');
const fs = require('fs')

function Find(){
  this.makeFind = function(req, res, next){

  }
  this.getLastHundred = function(req, res, next){
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
                'ORDER BY EventCode DESC '+
                'LIMIT 100', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.lastHundredOccurrence = result
          next()
        }
      })
    })
  }

  this.searchEventByCode = function(req, res, next){
    conn.acquire(function(err,con){
      // console.log(req.body);
      con.query('SELECT '+
                  'e.EventID, '+
                  'e.Type, '+
                  'e.EventCode, '+
                  'e.CreateBy, '+
                  'e.ResponsibleByEvent, '+
                  'e.Name AS title, '+
                  'e.StartEvent AS start, '+
                  'e.EndEvent AS end, '+
                  'es.StatusName, '+
                  'e.NeedComputer, '+
                  'e.NeedDataShow, '+
                  'e.VideoFrom, '+
                  'e.VideoTo, '+
                  'e.Nparent, '+
                  'e.Npupil, '+
                  'e.Nstaff, '+
                  'e.Nvisitor, '+
                  'e.DepartureFrom, '+
                  'e.AmountPerson, '+
                  'e.TransportWaitAvenue, '+
                  'e.MeansOfTransport, '+
                  'e.LocationEvent, '+
                  'e.LeavingFromEvent, '+
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                'WHERE '+
                  'e.EventCode = ?', [req.body.EventCode],function(err, result) {
        con.release();
        console.log(this.sql);
        if(err){
          res.render('error', { error: err } );
        }else{
          // console.log(result);
          // console.log('fields from event');
          req.findEventByCode = result[0]
          next()
        }
      });
    });
  }

  this.getTemplateType = function(req, res, next){

    let typeTemplate = ('I' === req.findEventByCode.Type) ? 'internal.hbs' : 'external.hbs'
    req.findEventByCode.typeTemplate = ('I' === req.findEventByCode.Type) ? 'find/internal.hbs' : 'find/external.hbs'

    // console.log(typeTemplate)
    fs.readFile(process.env.PWD + '/views/find/' + typeTemplate, 'utf8', function (err,data) {
      if (err) {
        // console.log('entrei erro');
        return console.log(err);
      }
      // console.log('nao teve erro');
      // console.log(data);
      req.findEventByCode.template = data
      next()
    });
  }

}

module.exports = new Find()
