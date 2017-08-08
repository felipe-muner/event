const conn = require(process.env.PWD + '/conn');
const moment = require('moment')
const fs = require('fs');

function InternalEvent(){
  this.getAllSite = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT idunidade, unidade FROM unidades', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allSite = result
          next()
        }
      });
    });
  }
  this.getAllBuilding = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('Select BuildingID, Site_ID, Name from Building WHERE Status = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allBuilding = result
          next()
        }
      });
    });
  }
  this.getAllRoom = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('Select RoomID, Building_ID, Name, Status FROM Room Where Status = 1 AND CanEvent = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(req.allSite);
          req.allRoom = result
          next()
        }
      });
    });
  }

  // this.searchEvents = function(req, res, next){
  //   conn.acquire(function(err,con){
  //     con.query('SELECT EventID, Name, StartingDate, StartingTime, EndTime FROM Event WHERE YEAR(StartingDate) = ? AND MONTH(StartingDate) = ?', [req.body.currentYear, req.body.currentMonth],function(err, result) {
  //       con.release();
  //       if(err){
  //         res.render('error', { error: err } );
  //       }else{
  //         req.allEvents = result
  //         next()
  //       }
  //     });
  //   });
  // }

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
                  'Date(StartEvent) < ? AND '+
                  'e.Room_ID =  ?', ['I', req.body.firstDay, req.body.lastDay, req.body.roomID],function(err, result) {
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
                  'e.Budget_ID, '+
                  'orcamento.setor, '+
                  'orcamento.grupo, '+
                  'orcamento.conta, '+
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                  'left Join orcamento ON e.Budget_ID = orcamento.id '+
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

  this.getAllSiteBuildingRoom = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'u.idunidade, '+
                  'upper(u.unidade) as unidade, '+
                  'b.BuildingID, '+
                  'b.Name as NameBuilding, '+
                  'r.RoomID, '+
                  'r.Name as NameRoom '+
                'FROM '+
                  'Room AS r '+
                  'Inner Join Building AS b ON r.Building_ID = b.BuildingID '+
                  'Inner Join unidades AS u ON b.Site_ID = u.idunidade '+
                'WHERE '+
                  'r.Status = 1 '+
                'ORDER BY '+
                  'u.idunidade ASC, '+
                  'b.BuildingID ASC, '+
                  'r.RoomID ASC', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          // console.log(this.sql);
          req.getAllSiteBuildingRoom = result
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

    let StartEvent = moment(req.body.dateNewEvent + 'T' + req.body.startTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')
    let EndEvent = moment(req.body.dateNewEvent + 'T' + req.body.endTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')

    let event = {
      Type:'I',
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
      ResponsibleByEvent: parseInt(req.body.responsibleNewEvent) || parseInt(req.session.matricula),
      Departament_ID: req.body.iddepartamento || null
    }
    let approvedDirectly = req.directApproved.some((e) => e.Matricula_ID === req.session.matricula)
    if (approvedDirectly) event.EventStatus_ID = 2

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
      req.findEventByCode.template = data
      next()
    });
  }

}

module.exports = new InternalEvent()
