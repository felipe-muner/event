const conn = require(process.env.PWD + '/conn');
const moment = require('moment')
const fs = require('fs');

function ExternalEvent(){

  this.searchEventTwoDate = function(req, res, next){
    conn.acquire(function(err,con){
      // console.log(req.body);
      con.query('SELECT '+
                  'e.EventID, '+
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
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                'WHERE '+
                  'e.Type = ? AND '+
                  'Date(StartEvent) >= ? AND '+
                  'Date(StartEvent) < ?', ['E', req.body.firstDay, req.body.lastDay],function(err, result) {
        con.release();
        console.log(this.sql);
        if(err){
          res.render('error', { error: err } );
        }else{
          // console.log(this.sql);
          req.allEvents = result
          next()
        }
      });
    });
  }

  this.searchEventByCode = function(req, res, next){
    conn.acquire(function(err,con){
      // console.log(req.body);
      con.query('SELECT '+
                  'e.EventID, '+
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
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                'WHERE '+
                  'e.EventCode = ?', [req.body.EventCode || req.query.EventCode],function(err, result) {
        con.release();
        console.log(this.sql);
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(result);
          console.log('fields from event');
          req.findEventByCode = result[0]
          next()
        }
      });
    });
  }

  this.getLastEvent = function(req, res, next){
    console.log(req.body);
    conn.acquire(function(err,con){
      con.query('SELECT EventID, EventCode FROM event WHERE YEAR(StartEvent) = YEAR(?) order by eventId desc limit 1', [req.body.dateNewEvent], function(err, result) {
        // console.log('______________________________');
        // console.log(this.sql);
        con.release();
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          let eventCode = '';
          (result.length === 0) ? eventCode = parseInt(moment(req.body.dateNewEvent).year() + '0001') : eventCode = result[0].EventCode + 1
          req.nextEventCode = eventCode
          next()
        }
      });
    });
  }

  this.createEvent = function(req, res, next){
    console.log('vou criar');
    console.log(req.session);

    let StartEvent = moment(req.body.dateNewEvent + 'T' + req.body.startTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')
    let EndEvent = moment(req.body.dateNewEvent + 'T' + req.body.endTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')

    let event = {
      Type:'E',
      EventCode:req.nextEventCode,
      StartEvent,
      EndEvent,
      Room_ID: req.body.roomIDNewEvent,
      Name: req.body.nameNewEvent,
      NeedComputer: req.body.needcomputer || null,
      NeedDataShow: req.body.needDataShow || null,
      VideoFrom: req.body.videoFrom || null,
      VideoTo: req.body.videoTo || null,
      AdditionalInformation: req.body.additionalInformation || null,
      Nparent: parseInt(req.body.qtdParentNewEvent) || null,
      Npupil: parseInt(req.body.qtdPupilNewEvent) || null,
      Nstaff: parseInt(req.body.qtdStaffNewEvent) || null,
      Nvisitor: parseInt(req.body.qtdVisitorNewEvent) || null,
      Budget_ID: parseInt(req.body.id_budget) || null,
      CreateBy: req.session.matricula,
      ResponsibleByEvent: parseInt(req.body.responsibleNewEvent) || null
    }
    // for(var propName in EndEvent) console.log(propName + ' ------- Valor:' +  EndEvent[propName])
    // moment($('#dateNewEvent').val() + 'T' + $('#startTimeNewEvent').val())
    conn.acquire(function(err,con){
      con.query('INSERT INTO Event SET ?', [event], function(err, result) {
        console.log(this.sql);
        con.release();
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          console.log(this.sql);
          req.resultCreated = result
          next()
        }
      });
    });
  }

  this.getTemplateMoreInfo = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/internal-event/show-more-info-internal.hbs', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      // console.log(req.findEventByCode);
      req.findEventByCode.template = data
      next()
    });
  }

}

module.exports = new ExternalEvent()
