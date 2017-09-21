const conn = require(process.env.PWD + '/conn');
const async = require('async')
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
    next()
  }

  this.checkAvailabilityReschedule = function(req, res, next){

    async.forEach((req.DesiredDate), function (item, callback){
      conn.acquire(function(err,con){
        con.query('SELECT * FROM Event WHERE Room_ID = ? AND EventStatus_ID <> ? '+
                  'AND (? BETWEEN StartEvent AND EndEvent ' +
                    'OR ? BETWEEN StartEvent AND EndEvent ' +
                    'OR StartEvent BETWEEN ? AND ? ' +
                    'OR EndEvent BETWEEN ? AND ? ) ORDER BY StartEvent', [parseInt(req.Room_ID), 4, item.dateStart, item.dateEnd, item.dateStart, item.dateEnd, item.dateStart, item.dateEnd], function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            console.log(this.sql)
            if(0 === result.length){
              item.Available = true
            }else{
              item.Available = result[0]
            }
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })

  }





}

module.exports = new Reschedule()
