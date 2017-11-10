const conn = require(process.env.PWD + '/conn');
const async = require('async')

function FinishEvent(){
  this.getAllFinishEvent = function(req, res, next){
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
                'WHERE '+
                  'e.EventStatus_ID = 2', function(err, result) {
        con.release();
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

  this.clearProduct = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('DELETE FROM EventItem WHERE Event_ID = ?', [req.body.EventCode], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('deletei os produtos');
          console.log(result);
          console.log('deletei os produtos');
          next()
        }
      })
    })
  }

  this.addProductUpdated = function(req, res, next){
    console.log(req.body);
    async.forEach(JSON.parse(req.body.darBaixa), function (item, callback){
      item.Event_ID = item.EventCode
      item.UsedAmount = item.amountUsed
      item.Amount = item.amountRequested
      item.Matricula_ID = req.session.matricula

      delete item.EventCode
      delete item.amountUsed
      delete item.amountRequested
      delete item.EventItemID

      console.log(item);
      console.log('qwe');
      conn.acquire(function(err,con){
        con.query('INSERT INTO EventItem SET ?', [item],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            callback()
          }
        })
      })
    }, function(err) {
      console.log('acabei de gravar itens no fechamento ');
      // console.log(req.jsonAprove)
      next()
    })


    // console.log('----addProductUpdated');
    // console.log(JSON.stringify(JSON.parse(req.body.darBaixa),null,2));
    // console.log('----addProductUpdated');
    // next()
  }

  // this.updateItemsFinishEvent = function(req, res, next){
  //   if(0 === JSON.parse(req.body.darBaixa).length){
  //      next()
  //   }else {
  //
  //     conn.acquire(function(err,con){
  //       console.log(JSON.parse(req.body.darBaixa))
  //       let bulkUpdate = JSON.parse(req.body.darBaixa).reduce(function(acc, e){
  //         return acc + 'UPDATE EventItem SET UsedAmount = '+ e.amountUsed +', Matricula_ID = '+ req.session.matricula +' WHERE EventItemID = '+ e.EventItemID + ';'
  //       },'')
  //       console.log('bulupdate');
  //       console.log(bulkUpdate);
  //
  //       con.query(bulkUpdate, function(err, result) {
  //         con.release();
  //         if(err){
  //           console.log(err);
  //           res.render('error', { error: err } );
  //         }else{
  //           console.log('atualizei os valores dos itens usados no evento');
  //           console.log(result);
  //           req.baixas = result
  //           next()
  //         }
  //       })
  //     })
  //   }
  // }
}

module.exports = new FinishEvent()
