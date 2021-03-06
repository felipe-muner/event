const conn = require(process.env.PWD + '/conn');
const moment = require('moment')
const fs = require('fs');
const Util = require(process.env.PWD + '/util/Util')

function ExternalEvent(){

  this.searchEventTwoDate = function(req, res, next){
    delete req.session.findFilters
    delete req.session.finishFilters

    let firstDay = req.body.firstDay ? req.body.firstDay : req.session.externalFilters && req.session.externalFilters.firstDay ? req.session.externalFilters.firstDay : moment().format('YYYY-MM-DD')
    let lastDay = req.body.lastDay ? req.body.lastDay : req.session.externalFilters && req.session.externalFilters.lastDay ? req.session.externalFilters.lastDay : moment().format('YYYY-MM-DD')

    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'e.EventID, '+
                  'e.EventCode, '+
                  'e.CreateBy, '+
                  'e.ResponsibleByEvent, '+
                  'e.Name AS title, '+
                  'e.StartEvent AS start, '+
                  'e.EndEvent AS end, '+
                  'e.EventStatus_ID, '+
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
                  'e.Type = ? AND '+
                  'Date(StartEvent) >= ? AND '+
                  'Date(EndEvent) <= ? '+
                  'ORDER BY EventCode DESC', ['E', firstDay, lastDay],function(err, result) {
        con.release();
        if(err){
          console.log(this.sql);
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.allEvents = result
          next()
        }
      });
    });
  }

  this.filterEvents = function(req, res, next) {
    let filters = req.originalUrl === '/external-event/searchFiltered' ? req.body : req.session.externalFilters
    if(req.originalUrl === '/external-event/searchFiltered') req.session.externalFilters = req.body

    if(filters && Object.keys(filters).length > 0) {
      if(filters.ResponsibleOrCreator) filters.ResponsibleOrCreator = Util.stringParseArray(filters.ResponsibleOrCreator).map(e => parseInt(e))
      if(filters.Status) filters.Status = Util.stringParseArray(filters.Status).map(e => parseInt(e))
      if(filters.Location) filters.Location = Util.stringParseArray(filters.Location).map(e => e.toUpperCase())

      if(filters.EventCode) req.allEvents = req.allEvents.filter(e => e.EventCode === parseInt(filters.EventCode))
      if(filters.EventName) req.allEvents = req.allEvents.filter(e => e.title.toUpperCase().includes(filters.EventName.toUpperCase()))
      if(filters.ResponsibleOrCreator) req.allEvents = req.allEvents.filter(e => filters.ResponsibleOrCreator.includes(e.CreateBy) || filters.ResponsibleOrCreator.includes(e.ResponsibleByEvent))

      req.allEvents = req.allEvents.filter(e => filters.Status.includes(e.EventStatus_ID))
                                  .filter(e => filters.Location.includes(e.DepartureFrom.toUpperCase()))
    }

    let externalFilters = req.session.externalFilters ? req.session.externalFilters : {}
    req.session.backupExternalFilters = req.session.externalFilters ? req.session.externalFilters : {}
    delete req.session.externalFilters

    next()
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
    console.log(req.body)
    conn.acquire(function(err,con){
      con.query('SELECT EventID, EventCode FROM event WHERE YEAR(StartEvent) = YEAR(?) order by EventId desc limit 1', [req.body.StartEvent], function(err, result) {
        console.log('______________________________');
        console.log(this.sql);
        con.release();
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          let eventCode = '';
          (result.length === 0) ? eventCode = parseInt(moment(req.body.StartEvent).year() + '0001') : eventCode = result[0].EventCode + 1
          req.nextEventCode = eventCode
          next()
        }
      })
    })
  }

  this.createEvent = function(req, res, next){
    console.log('vou criar');
    console.log(req.session);

    let StartEvent = moment(req.body.dateNewEvent + 'T' + req.body.startTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')
    let EndEvent = moment(req.body.dateNewEvent + 'T' + req.body.endTimeNewEvent).format('YYYY-MM-DD HH:mm:ss')

    let event = {
      Type:'E',
      EventCode: req.nextEventCode,
      StartEvent: req.body.StartEvent,
      EndEvent: req.body.EndEvent,
      Name: req.body.nameNewEvent,
      DepartureFrom: req.body.departureFrom,
      AmountPerson: req.body.qtdPerson,
      TransportWaitAvenue: req.body.transportWaitVenue,
      MeansOfTransport: req.body.meansOfTransport || null,
      AdditionalInformation: req.body.additionalInformation || null,
      Nparent: parseInt(req.body.qtdParentNewEvent) || null,
      Npupil: parseInt(req.body.qtdPupilNewEvent) || null,
      Nstaff: parseInt(req.body.qtdStaffNewEvent) || null,
      Nvisitor: parseInt(req.body.qtdVisitorNewEvent) || null,
      Budget_ID: parseInt(req.body.id_budget) || null,
      CreateBy: req.session.matricula,
      ResponsibleByEvent: parseInt(req.body.responsibleNewEvent) || parseInt(req.session.matricula),
      Departament_ID: req.body.iddepartamento || null,
      LocationEvent: req.body.locationEvent,
      LeavingFromEvent: req.body.LeavingFromEvent || null
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
      // console.log(req.findEventByCode);
      req.findEventByCode.template = data
      next()
    });
  }

}

module.exports = new ExternalEvent()
