const conn = require(process.env.PWD + '/conn');
const fs = require('fs')

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
                  'e.EventCode = ?', [parseInt(req.body.EventCode) || parseInt(req.nextEventCode)],function(err, result) {
        con.release();
        console.log('_________');
        console.log('_________');
        console.log('_________');
        console.log(req.body);
        console.log(this.sql);
        if(err){
          console.log(err);
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

  this.myEvents = function(req, res, next){
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
