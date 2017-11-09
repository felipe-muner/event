const conn = require(process.env.PWD + '/conn');
const moment = require('moment')

function FinishEvent(){
  this.getAllFinishEvent = function(req, res, next){
    let StartTime = req.body.StartTime || moment().startOf('year').format('YYYY-MM-DD')
    let EndTime = req.body.EndTime || moment().endOf('year').format('YYYY-MM-DD')
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
                  'Left Join Room ON e.Room_ID = Room.RoomID '+
               		'Left Join Building ON Room.Building_ID = Building.BuildingID '+
            		  'Left Join unidades ON Building.Site_ID = unidades.idunidade '+
                'WHERE '+
                  'Date(e.StartEvent) >= ? AND '+
                  'Date(e.EndEvent) <= ? AND '+
                  'e.EventStatus_ID = 2', [StartTime, EndTime], function(err, result) {
        con.release();
        console.log(this.sql);
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allEventToFinish = result
          next()
        }
      });
    });
  }

  this.productOfEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'EventItem.EventItemID, '+
                  'EventItem.EventProduct_ID, '+
                  'EventItem.Price, '+
                  'EventItem.Amount, '+
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
                  'EventItem.Event_ID = ?', [req.body.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('fields from products');
          console.log(result);
          req.products = result
          next()
        }
      });
    });
  }

  this.updateStatusEvent = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE Event set EventStatus_ID = 3, FinishedByMatricula_ID = ? WHERE EventCode = ?', [req.session.matricula, req.body.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('fields from products');
          console.log(result);
          req.products = result
          next()
        }
      });
    });
  }

  this.updateItemsFinishEvent = function(req, res, next){
    if(0 === JSON.parse(req.body.darBaixa).length){
       next()
    }else {
      conn.acquire(function(err,con){
        console.log(JSON.parse(req.body.darBaixa))
        let bulkUpdate = JSON.parse(req.body.darBaixa).reduce(function(acc, e){
          return acc + 'UPDATE EventItem SET UsedAmount = '+ e.amountUsed +', Matricula_ID = '+ req.session.matricula +' WHERE EventItemID = '+ e.EventItemID + ';'
        },'')
        console.log('bulupdate');
        console.log(bulkUpdate);

        con.query(bulkUpdate, function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            console.log('atualizei os valores dos itens usados no evento');
            console.log(result);
            req.baixas = result
            next()
          }
        })
      })
    }
  }
}

module.exports = new FinishEvent()
