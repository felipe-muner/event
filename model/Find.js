const conn = require(process.env.PWD + '/conn');
const fs = require('fs')
const moment = require('moment')

function Find(){
  this.testaFunc = function(){
    console.log('testaFunc')
  }
  this.makeFind = function(req, res, next){
    conn.acquire(function(err,con){

      console.log('___listorom')
      let listRoom = []
      if ('string' === typeof req.body.listRoom && '' !== req.body.listRoom){
        listRoom.push(req.body.listRoom)
      }else{
        listRoom = req.body.listRoom
      }
      console.log(req.body)
      console.log(listRoom)
      console.log('___listorom')

      let whereEventCode = ('' !== req.body.EventCode) ? 'e.EventCode = '+ req.body.EventCode +' ' : ''
      // console.log(whereEventCode)
      let whereType = 'e.Type IN ('+ req.body.Type +')'
      // console.log(whereType)
      let whereEventName = ('' !== req.body.EventName) ? 'e.Name LIKE \'%'+ req.body.EventName + '%\'' : ''
      // console.log(whereEventName)
      let whereOwner = (!!req.body.ResponsibleOrCreator) ? '(e.CreateBy IN('+ req.body.ResponsibleOrCreator +') OR e.ResponsibleByEvent IN('+ req.body.ResponsibleOrCreator+'))' : ''
      // console.log(whereOwner)
      let whereStatusName = (!!req.body.StatusName) ? 'e.EventStatus_ID IN('+ req.body.StatusName +')' : ''
      // console.log(whereStatusName)
      let whereRangeDate = (!!req.body.StartTime) ? 'CAST(StartEvent AS DATE) between \''+ req.body.StartTime +'\' and \''+ req.body.EndTime + '\'' : ''

      let whereRoomSelect = (!!listRoom) ? 'e.Room_ID IN ('+ listRoom.join(', ') +')' : ''
      console.log('___room selected' + whereRoomSelect)

      let whereClause = 'WHERE '
      if('' !== whereEventCode){
        whereClause = whereClause += whereEventCode
      }else{
        whereClause = whereClause += whereType + ' '
        if(whereEventName !== '') whereClause = whereClause += ' AND ' + whereEventName + ' '
        if(whereOwner !== '') whereClause = whereClause += ' AND ' + whereOwner + ' '
        if(whereStatusName !== '') whereClause = whereClause += ' AND ' + whereStatusName + ' '
        if(whereRangeDate !== '') whereClause = whereClause += ' AND ' + whereRangeDate + ' '
        if(whereRoomSelect !== '') whereClause = whereClause += ' AND ' + whereRoomSelect + ' '
      }

      whereClause = (whereClause === 'WHERE ') ? '' : whereClause

      let query = 'SELECT '+
                  'e.EventCode, '+
                  'e.Type, '+
                  'unidades.unidade, '+
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
                  'Left Join Room ON e.Room_ID = Room.RoomID '+
               		'Left Join Building ON Room.Building_ID = Building.BuildingID '+
            		  'Left Join unidades ON Building.Site_ID = unidades.idunidade '+
                  whereClause +
                'ORDER BY EventID ASC'

      con.query(query, function(err, result) {
        con.release();
        if(err){
          console.log(this.sql);
          console.log(err);
          res.render('error', { error: err } );
        }else{
          console.log(this.sql)
          req.makeFind = result
          next()
        }
      })
    })
  }
  this.getLastHundred = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'e.EventCode, '+
                  'e.Type, '+
                  'unidades.unidade, '+
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
                  'Left Join Room ON e.Room_ID = Room.RoomID '+
               		'Left Join Building ON Room.Building_ID = Building.BuildingID '+
            		  'Left Join unidades ON Building.Site_ID = unidades.idunidade '+
                'ORDER BY EventCode DESC', function(err, result) {
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
                  'u1.email as EmailCreateBy, '+
                  'u1.id_site as UnitCreateBy, '+
                  'e.ResponsibleByEvent, '+
                  'u2.email as EmailResponsibleBy, '+
                  'u2.id_site as UnitResponsibleBy, '+
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
                  'e.Departament_ID, '+
                  'departamentos.nomedepartamento, '+
                  'e.Budget_ID, '+
                  'e.DepartureFrom, '+
                  'e.AmountPerson, '+
                  'e.MeansOfTransport, '+
                  'e.TransportWaitAvenue, '+
                  'e.LocationEvent, '+
                  'e.LeavingFromEvent, '+
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName, '+
                  'EventTransport.TypeVehicleEnglish, '+
                  'EventTransport.TypeVehiclePort, '+
                  'EventTransport.AmountSeat, '+
                  'orcamento.setor,'+
                  'orcamento.conta, '+
                  'orcamento.grupo, '+
                  'e.ReasonCanceled, '+
                  'e.CanceledByMatricula_ID, '+
                  'e.FinishedByMatricula_ID, '+
                  'u3.nomeusuario AS CanceledByName, '+
                  'r.RoomID, '+
                  'r.Name as RoomName '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                  'Left Join usuarios AS u3 ON u3.matricula = e.CanceledByMatricula_ID '+
                  'Left Join EventTransport ON e.MeansOfTransport = EventTransport.EventTransportID '+
                  'Left Join orcamento ON e.Budget_ID = orcamento.id '+
                  'Left Join departamentos ON e.Departament_ID = departamentos.iddepartamento '+
                  'Left Join Room as r ON e.Room_ID = r.RoomID '+
                'WHERE '+
                  'e.EventCode = ?', [parseInt(req.body.EventCode) || parseInt(req.nextEventCode) || parseInt(req.query.EventCode)],function(err, result) {
        con.release();
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          req.findEventByCode = result[0]
          next()
        }
      })
    })
  }

  this.myEvents = function(req, res, next){
    conn.acquire(function(err,con){
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
                  'e.LocationEvent, '+
                  'e.LeavingFromEvent, '+
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName, '+
                  'EventTransport.TypeVehicleEnglish, '+
                  'EventTransport.TypeVehiclePort, '+
                  'EventTransport.AmountSeat, '+
                  'orcamento.setor,'+
                  'orcamento.conta, '+
                  'orcamento.grupo '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                  'Left Join EventTransport ON e.MeansOfTransport = EventTransport.EventTransportID '+
                  'Left Join orcamento ON e.Budget_ID = orcamento.id '+
                'WHERE '+
                  'e.CreateBy = ? OR e.ResponsibleByEvent = ? '+
                  'ORDER BY e.EventCode DESC LIMIT 100', [parseInt(req.session.matricula),parseInt(req.session.matricula)],function(err, result) {
        con.release();
        console.log('_________PARAAA');
        // console.log(req.body);
        // console.log(this.sql);
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(result)
          // console.log('fields from event');
          req.myEvents = result
          next()
        }
      })
    })
  }

  this.myInternalEvents = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'e.EventID, '+
                  'e.Type, '+
                  'e.EventCode, '+
                  'e.Room_ID, '+
                  'r.RoomID, '+
                  'r.Name as RoomName, '+
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
                  'e.LocationEvent, '+
                  'e.LeavingFromEvent, '+
                  'e.AdditionalInformation, '+
                  'u2.nomeusuario AS ResponsibleByName, '+
                  'u1.nomeusuario AS CreatedByName, '+
                  'EventTransport.TypeVehicleEnglish, '+
                  'EventTransport.TypeVehiclePort, '+
                  'EventTransport.AmountSeat, '+
                  'orcamento.setor,'+
                  'orcamento.conta, '+
                  'orcamento.grupo '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                  'Left Join EventTransport ON e.MeansOfTransport = EventTransport.EventTransportID '+
                  'Left Join orcamento ON e.Budget_ID = orcamento.id '+
                  'Left Join Room as r ON e.Room_ID = r.RoomID '+
                'WHERE '+
                  'e.Type = ? AND '+
                  '(e.CreateBy = ? OR e.ResponsibleByEvent = ?) '+
                  'ORDER BY e.EventCode DESC LIMIT 100', ['I', parseInt(req.session.matricula), parseInt(req.session.matricula)],function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } )
        }else{
          console.log('_____INTERNAL____PARAAA')
          console.log(result)
          console.log('_____INTERNAL____PARAAA')
          req.myInternalEvents = result
          next()
        }
      })
    })
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

  this.getRecipientsEmail = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'u.email, '+
                  'u.matricula, '+
                  'u.id_site, '+
                  'uca.id_perfil_sistema, '+
                  'u.idusuario '+
                  'FROM '+
                  'usuarios AS u '+
                  'Inner Join usuario_controle_acesso AS uca ON u.idusuario = uca.id_usuario '+
                  'WHERE '+
                  'u.ativo =  1 AND '+
                  'uca.id_sistema = 7 AND '+
                  'uca.id_perfil_sistema <> 20 AND '+
                  '(u.id_site = ? OR u.id_site = ?)', [req.findEventByCode.UnitCreateBy , req.findEventByCode.UnitResponsibleBy], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('___qUERY EMAIL')
          console.log(this.sql)
          console.log('___qUERY EMAIL')
          req.findEventByCode.RecipientsEmail = result
          next()
        }
      })
    })
  }

  this.clearEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE Event set '+
                  'EventStatus_ID = NULL,'+
                  'Type = NULL,'+
                  'Room_ID = NULL,'+
                  'Name = NULL,'+
                  'ResponsibleByEvent = NULL,'+
                  'NeedComputer = NULL,'+
                  'NeedDataShow = NULL,'+
                  'VideoFrom = NULL,'+
                  'VideoTo = NULL,'+
                  'AdditionalInformation = NULL,'+
                  'Nparent = NULL,'+
                  'Npupil = NULL,'+
                  'Nstaff = NULL,'+
                  'Nvisitor = NULL,'+
                  'Budget_ID = NULL,'+
                  'ApprovedBy = NULL,'+
                  'ApprovedAt = NULL,'+
                  'DepartureFrom = NULL,'+
                  'AmountPerson = NULL,'+
                  'TransportWaitAvenue = NULL,'+
                  'MeansOfTransport = NULL,'+
                  'LocationEvent = NULL,'+
                  'LeavingFromEvent = NULL,'+
                  'Departament_ID = NULL'+
                  ' WHERE EventCode = ?', [req.body.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('___qUERY null')
          console.log(this.sql)
          console.log('___qUERY null')
          console.log(result)
          req.resultadoevento = result
          next()
        }
      })
    })
  }

  this.checkEventAvailable = function(req, res, next){
    if ('I' === req.body.Type) {
      conn.acquire(function(err,con){
        con.query('SELECT * FROM Event WHERE Room_ID = ? AND EventCode <> ? '+
                  'AND (? BETWEEN StartEvent AND EndEvent ' +
                    'OR ? BETWEEN StartEvent AND EndEvent ' +
                    'OR StartEvent BETWEEN ? AND ? ' +
                    'OR EndEvent BETWEEN ? AND ? ) ORDER BY StartEvent', [parseInt(req.body.roomID), parseInt(req.body.EventCode), req.body.StartTime, req.body.EndTime, req.body.StartTime, req.body.EndTime, req.body.StartTime, req.body.EndTime], function(err, result) {
          con.release();
          console.log(this.sql);
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            if(0 === result.length){
              console.log('nenhum evento na sala, horario inicial e horario final')
              next()
            }else{
              console.log('já existe evento')
              console.log(result)
              console.log('já existe evento')

              let reason
              if (1 === result.length) {
                reason = 'Another event is already scheduled'
              }else{
                reason = 'In the desired time there are already other events'
              }

              let content = result.reduce(function(acc, e){
                  return acc + '<div style="border-bottom:1px solid black;"><b>Nº ' + e.EventCode + ' - </b>' + moment(e.StartEvent).format('DD/MM/YYYY HH:mm') + ' - ' + moment(e.EndEvent).format('DD/MM/YYYY HH:mm') + '</div>' +'<br>'
              }, '')

              res.json({
                "right": false,
                "reasonText": reason,
                "reasonCode": 'noTime',
                "redirect": "/my-event",
                "objeto": req.body,
                "events": result,
                "content": content
              })
            }
          }
        })
      })
    }else{
      next()
    }
  }

  this.checkAlreadyApproved = function(req, res, next){
    if ('I' === req.body.Type) {
      conn.acquire(function(err,con){
        con.query('SELECT * FROM Event WHERE EventCode = ?', [req.body.EventCode], function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            console.log('teste status')
            console.log(this.sql)
            console.log(result[0])
            console.log('teste status')
            debugger

            if(1 !== result[0].EventStatus_ID){
              console.log('ta aprovado')
              let content = 'Already qualified event'
              res.json({
                "right": false,
                "reasonText": 'Already qualified event',
                "reasonCode": 'alreadyApproved',
                "redirect": "/my-event",
                "objeto": req.body,
                "content": content
              })
            }else{
              console.log('nao ta aprovado');
              next()
            }

          }
        })
      })
    }else{
      next()
    }
  }

  this.updateEvent = function(req, res, next){
    debugger
    let event = {
      EventCode: req.body.EventCode,
      Type: req.body.Type,
      EventStatus_ID: 1,
      StartEvent: req.body.StartTime,
      EndEvent: req.body.EndTime,
      Room_ID: req.body.roomID || null,
      Name: req.body.Name,

      NeedComputer: req.body.NeedComputer || null,
      NeedDataShow: req.body.NeedDataShow || null,
      VideoFrom: req.body.VideoFrom || null,
      VideoTo: req.body.VideoTo || null,

      AmountPerson: req.body.AmountPerson || null,
      DepartureFrom: req.body.DepartureFrom || null,
      LeavingFromEvent: req.body.LeavingFromEvent || null,
      LocationEvent: req.body.LocationEvent || null,
      TransportWaitAvenue: req.body.TransportWaitAvenue || null,
      MeansOfTransport: req.body.meansOfTransport || null,

      AdditionalInformation: req.body.AdditionalInformation || null,
      Nparent: parseInt(req.body.Nparent) || null,
      Npupil: parseInt(req.body.Npupil) || null,
      Nstaff: parseInt(req.body.Nstaff) || null,
      Nvisitor: parseInt(req.body.Nvisitor) || null,
      Budget_ID: parseInt(req.body.id_budget) || null,
      ResponsibleByEvent: parseInt(req.body.responsibleNewEvent) || parseInt(req.session.matricula)
    }

    console.log('to no update___')
    console.log(event);
    // next()

    conn.acquire(function(err,con){
      con.query('UPDATE Event SET ? WHERE EventCode = ?', [event, event.EventCode], function(err, result) {
        con.release();
        console.log(this.sql);
        if(err){
          console.log(err);
          res.render('error', { error: err } );
        }else{
          console.log('___qUERY EMAIL')
          console.log(this.sql)
          console.log('___qUERY EMAIL')
          console.log(result)
          req.nextEventCode = req.body.EventCode
          req.resultadofinal = result
          next()
        }
      })
    })
  }

}

module.exports = new Find()
