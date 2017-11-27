const conn = require(process.env.PWD + '/conn');
const async = require('async')

function Approve(){

  this.getDirectApproval = function(req,res,next){
    conn.acquire(function(err,con){
      con.query('SELECT Matricula_ID FROM EventDirectApproval', function(err, result) {
        con.release();
        if(err){
          console.log(this.sql)
          res.render('error', { error: err } );
        }else{
          req.directApproved = result
          next()
        }
      })
    })
  }

  this.getEventToApprove = function(req, res, next){

    let whereClausure = ''
    if (15 === parseInt(req.session.profile)) {
      whereClausure = 'WHERE e.EventStatus_ID = 1 AND e.EventFatherCode IS NULL '
    }else if (16 === parseInt(req.session.profile)){
      whereClausure = 'WHERE e.EventStatus_ID = 1 AND e.EventFatherCode IS NULL AND (u1.id_site = '+ req.session.idunidade +' OR u2.id_site = '+ req.session.idunidade +') '
    }else {
      let err = 'Error ao tentar utilizar aprovacao'
      res.render('error', { error: err } );
    }

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
                  'u1.nomeusuario AS CreatedByName, '+
                  'u2.id_site AS SiteResponsible, '+
                  'u1.id_site AS SiteCreator, '+
                  'GROUP_CONCAT(CONCAT(ev.EventCode, " (", DATE(ev.StartEvent), ")")) AS EventsRescheduled, '+
                  'COUNT(ev.EventCode) AS QtdEventsRescheduled '+
                'FROM '+
                  'Event AS e '+
                  'Inner Join EventStatus AS es ON e.EventStatus_ID = es.EventStatusID '+
                  'Inner Join usuarios AS u1 ON e.CreateBy = u1.matricula '+
                  'Left Join usuarios AS u2 ON u2.matricula = e.ResponsibleByEvent '+
                  'Left Join Event AS ev ON ev.EventFatherCode = e.EventCode AND ev.EventStatus_ID = 1 '+
                whereClausure +
                'GROUP BY e.EventCode', function(err, result) {
        con.release();
        if(err){
          console.log(this.sql)
          res.render('error', { error: err } );
        }else{
          console.log(req.session)
          console.log(this.sql)
          req.allEventToApprove = result
          next()
        }
      })
    })
  }
  this.evaluateEvents = function(req, res, next){
    debugger
    if (!req.body.selectedEvent){
      req.session.flashMsg = {type:'alert-danger', events:'Please select at least 1 event'}
      res.redirect('/approve')
    }
    else{
      conn.acquire(function(err,con){
        con.query('UPDATE Event SET EventStatus_ID = ?, ApprovedAt = NOW(), ApprovedBy = ? WHERE EventCode IN (?)', [req.body.statusToUpdate, req.session.matricula, req.body.selectedEvent], function(err, result) {
          console.log(this.sql);
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            console.log(result);
            req.allEventsEvaluated = result
            next()
          }
        })
      })
    }
  }

  this.prepareEmailGuests = function(req, res, next){
    async.forEach((req.jsonAprove), function (item, callback){
      conn.acquire(function(err,con){
        con.query('SELECT Type, NameGuest FROM EventGuest WHERE Event_ID = ?', [item.EventCode],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            item.guests = result
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })
  }

  this.prepareEmailProducts = function(req, res, next){
    async.forEach((req.jsonAprove), function (item, callback){
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
                    'EventItem.Event_ID = ?', [item.EventCode],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            item.products = result
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })
  }

  this.prepareEmailMain = function(req, res, next){
    req.jsonAprove = []
    if(Object.prototype.toString.call( req.body.selectedEvent ) === '[object Array]'){
      async.forEach((req.body.selectedEvent), function (item, callback){
        conn.acquire(function(err,con){
          con.query('SELECT '+
                      'e.EventID, '+
                      'e.Type, '+
                      'e.EventStatus_ID, '+
                      'e.EventCode, '+
                      'e.CreateBy, '+
                      'u1.nomeusuario AS CreatedByName, '+
                      'u1.email AS EmailCreateBy, '+
                      'u1.id_site as UnitCreateBy, '+
                      'e.ResponsibleByEvent, '+
                      'u2.nomeusuario AS ResponsibleByName, '+
                      'u2.email AS EmailResponsibleBy, '+
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
                      'EventTransport.TypeVehicleEnglish, '+
                      'EventTransport.TypeVehiclePort, '+
                      'EventTransport.AmountSeat, '+
                      'orcamento.setor,'+
                      'orcamento.conta, '+
                      'orcamento.grupo, '+
                      'e.ApprovedBy, '+
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
                      'e.EventCode = ?', [item],function(err, result) {
            con.release();
            // console.log('_________');
            // console.log('_________');
            // console.log('_________');
            // console.log(req.body);
            // console.log(this.sql);
            // console.log('_________');
            // console.log('_________');
            // console.log('_________');
            if(err){
              console.log(err);
              res.render('error', { error: err } );
            }else{
              req.jsonAprove.push(result[0])
              callback()
            }
          })
        })
      }, function(err) {
        // console.log('____veremail do criador e responsavel')
        // console.log(req.jsonAprove)
        // console.log('____veremail do criador e responsavel')
        next()
      })
    }else{
      conn.acquire(function(err,con){
        con.query('SELECT '+
                    'e.EventID, '+
                    'e.Type, '+
                    'e.EventStatus_ID, '+
                    'e.EventCode, '+
                    'e.CreateBy, '+
                    'u1.nomeusuario AS CreatedByName, '+
                    'u1.email AS EmailCreateBy, '+
                    'u1.id_site as UnitCreateBy, '+
                    'e.ResponsibleByEvent, '+
                    'u2.nomeusuario AS ResponsibleByName, '+
                    'u2.email AS EmailResponsibleBy, '+
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
                    'EventTransport.TypeVehicleEnglish, '+
                    'EventTransport.TypeVehiclePort, '+
                    'EventTransport.AmountSeat, '+
                    'orcamento.setor,'+
                    'orcamento.conta, '+
                    'orcamento.grupo, '+
                    'e.ApprovedBy, '+
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
                    'e.EventCode = ?', [req.body.selectedEvent],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            // console.log('____veremail do criador e responsavel')
            // console.log(result[0])
            // console.log('____veremail do criador e responsavel')
            req.jsonAprove.push(result[0])
            next()
          }
        })
      })
    }
  }

  this.getListRecipients = function(req, res, next){
    async.forEach((req.jsonAprove), function (item, callback){
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
                    '(u.id_site = ? OR u.id_site = ?)', [item.UnitCreateBy , item.UnitResponsibleBy],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            console.log('____query sql lista email')
            console.log(this.sql)
            console.log('____query sql lista email')
            item.RecipientsEmail = result
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })
  }

}

module.exports = new Approve()
