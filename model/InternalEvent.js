const conn = require(process.env.PWD + '/conn');
const moment = require('moment')

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
      con.query('SELECT EventID, EventStatus_ID, EventCode, Name as title, StartEvent as start, EndEvent as end FROM Event '+
      'WHERE Date(StartEvent) >= ? AND Date(StartEvent) < ? AND '+
      'Room_ID = ?', [req.body.firstDay, req.body.lastDay, req.body.roomID],function(err, result) {
        con.release();
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
    console.log(req.session);

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
}

module.exports = new InternalEvent()
