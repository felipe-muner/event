const conn = require(process.env.PWD + '/conn');
const async = require('async')
const moment = require('moment')
function Reschedule(){

  this.searchEventByCode = function(req, res, next){
    conn.acquire(function(err,con){
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
                  'e.EventStatus_ID, '+
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
                  'e.EventCode = ?', [parseInt(req.body.EventCode)],function(err, result) {
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

  this.guestOfEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT Type, NameGuest FROM EventGuest WHERE Event_ID = ?', [req.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.guests = result
          next()
        }
      })
    })
  }
  this.productOfEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'EventItem.EventProduct_ID, '+
                  'EventItem.Price, '+
                  'EventItem.Amount, '+
                  'EventItem.UsedAmount, '+
                  'EventItem.Amount * EventItem.Price as TotalProd, '+
                  'EventProduct.NameEnglish as ProductNameEnglish,  '+
                  'EventProduct.NamePort as ProductNamePort, '+
                  'EventProductUnit.NameEnglish as UnitInEnglish, '+
                  'EventProductUnit.NamePort as UnitInPort '+
                'FROM '+
                  'EventItem '+
                'Inner Join EventProduct ON EventItem.EventProduct_ID = EventProduct.EventProductID '+
                'Inner Join EventProductUnit ON EventProduct.Unit = EventProductUnit.EventProductUnitID '+
                'WHERE '+
                  'EventItem.Event_ID = ?', [req.EventCode], function(err, result) {
        con.release()
        if(err){
          res.render('error', { error: err } );
        }else{
          req.products = result
          next()
        }
      })
    })
  }

  this.convBodyToReq = function(req, res, next){
    req.EventCode = req.body.EventCode
    req.Room_ID = req.body.Room_ID
    req.DesiredDate = JSON.parse(req.body.desiredDate)
    req.NewEvents = []
    next()
  }

  this.checkAvailabilityReschedule = function(req, res, next){

    async.forEach((req.DesiredDate), function (item, callback){
      conn.acquire(function(err,con){
        let query = 'SELECT e.EventCode, ' +
                            'e.Name, ' +
                            'e.Room_ID, ' +
                            'r.Name AS RoomName, ' +
                            'e.CreateBy, ' +
                            'u.nomeusuario AS CreateByName, ' +
                            'e.StartEvent, ' +
                            'e.EndEvent ' +
                    'FROM EVENT e ' +
                      'INNER JOIN Room r ON r.RoomID = e.Room_ID ' +
                      'INNER JOIN usuarios u ON u.matricula = e.CreateBy ' +
                    'WHERE Room_ID = ? ' +
                      'AND EventStatus_ID <> ? ' +
                      'AND ( ' +
                        '? BETWEEN StartEvent AND EndEvent ' +
                        'OR ? BETWEEN StartEvent AND EndEvent ' +
                        'OR StartEvent BETWEEN ? AND ? ' +
                        'OR EndEvent BETWEEN ? AND ? ' +
                      ') ' +
                    'ORDER BY StartEvent;'

        con.query(query, [parseInt(req.Room_ID), 4, item.dateStart, item.dateEnd, item.dateStart, item.dateEnd, item.dateStart, item.dateEnd], function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            // console.log(this.sql)
            if(0 === result.length){
              item.Available = true
            }else{
              item.Available = false
              item.EventScheduled = result[0]
              item.EventsSameTime = result
            }
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })

  }


  this.createEvent = function(req, res, next){
    req.DesiredDate = req.DesiredDate.filter(e=>e.Available)
    req.newArrayEventCode = []
    async.forEachSeries((req.DesiredDate), function (item, callback){
      console.log(item)
      conn.acquire(function(err,con){
        con.query('SELECT EventID, EventCode FROM event WHERE YEAR(StartEvent) = YEAR(?) order by eventId desc limit 1', [item.dateStart], function(err, result) {
          console.log(this.sql);
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            let eventCode = result.length === 0  ? parseInt(moment(item.dateStart).year() + '0001') : result[0].EventCode + 1
            console.log('proximo codigo: ' + eventCode)

            req.newArrayEventCode.push(eventCode)

            let newEvent = {
              Type: 'I',
              EventCode: eventCode,
              StartEvent: item.dateStart,
              EndEvent: item.dateEnd,
              Room_ID: req.findEventByCode.RoomID,
              Name: req.findEventByCode.title,
              NeedComputer: req.findEventByCode.NeedComputer,
              NeedDataShow: req.findEventByCode.NeedDataShow,
              VideoFrom: req.findEventByCode.VideoFrom,
              VideoTo: req.findEventByCode.VideoTo,
              AdditionalInformation: req.findEventByCode.AdditionalInformation,
              Nparent: req.findEventByCode.Nparent,
              Npupil: req.findEventByCode.Npupil,
              Nstaff: req.findEventByCode.Nstaff,
              Nvisitor: req.findEventByCode.Nvisitor,
              Budget_ID: req.findEventByCode.Budget_ID,
              CreateBy: req.findEventByCode.CreateBy,
              ResponsibleByEvent: req.findEventByCode.ResponsibleByEvent,
              Departament_ID: req.findEventByCode.Departament_ID,
              EventStatus_ID: req.findEventByCode.EventStatus_ID
            }

            //CRIANDO NOVO EVENTO
            console.log(newEvent)
            conn.acquire(function(err,con){
              con.query('INSERT INTO Event SET ?', [newEvent], function(err, result) {
                console.log(this.sql)
                con.release()
                if(err) {
                  console.log(err)
                  res.render('error', { error: err })
                } else {
                  console.log('criado ' + eventCode);
                  callback()
                }
              })
            })
            //CRIANDO NOVO EVENTO
          }
        })
      })
    }, function(err) {
      next()
    })
  }

  this.createGuestOfEvent = function(req, res, next) {
    if(req.guests.length > 0) {
      async.forEach((req.newArrayEventCode), function(eventCode, callback) {
        let bulkQuery = req.guests.map(function(e) {
          let item = []
          new Array().push.call(item, eventCode, e.Type, e.NameGuest)
          return item
        })
        conn.acquire(function(err,con) {
          con.query('INSERT INTO EventGuest(Event_ID, Type, NameGuest) VALUES ?', [bulkQuery], function(err, result) {
            con.release();
            if(err) {
              res.render('error', { error: err });
            } else {
              callback()
            }
          });
        });
      }, function(err) {
        next()
      })
    } else {
      next()
    }
  }

  this.createProductOfEvent = function(req, res, next) {
    if(req.products.length > 0) {
      async.forEach((req.newArrayEventCode), function(eventCode, callback) {
        let bulkQuery = req.products.map(function(e) {
          let item = []
          new Array().push.call(item, eventCode, e.EventProduct_ID, e.Price, e.Amount)
          return item
        })
        conn.acquire(function(err,con) {
          con.query('INSERT INTO EventItem(Event_ID, EventProduct_ID, Price, Amount) VALUES ?', [bulkQuery], function(err, result) {
            con.release();
            if(err) {
              res.render('error', { error: err });
            } else {
              callback()
            }
          });
        });
      }, function(err) {
        next()
      })
    } else {
      next()
    }
  }
}

module.exports = new Reschedule()
