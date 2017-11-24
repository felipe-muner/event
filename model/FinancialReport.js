const conn = require(process.env.PWD + '/conn');
const async = require('async')
function FinancialReport(){

  this.appendProductToEvent = function(req, res, next){
    async.forEach((req.getDistinctBudget),function( itemBudget, callbackBudget){
      async.forEach((itemBudget.events), function (item, callbackEvent){
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
                      'EventItem.Event_ID = ?', [item.EventCode], function(err, result) {
            con.release();
            if(err){
              console.log(err);
              res.render('error', { error: err } );
            }else{
              result.map(function(e){
                item.products.push(e)
              })
              callbackEvent()
            }
          })
        })
      }, function(errEvent) {
        callbackBudget()
      })
    }, function(errBudget){
      next()
    })
  }
  this.appendEventToBudget = function(req, res, next){
    // req.getDistinctBudget = req.getDistinctBudget.map(function(x){
    //   x = [0]
    //   return x
    // })
    // console.log('---teste');
    // console.log(req.getDistinctBudget);
    // console.log('---teste');
    async.forEach((req.getDistinctBudget), function (item, callback){
      conn.acquire(function(err,con){
        con.query('SELECT e.EventCode, e.Name, e.StartEvent, e.EndEvent, e.CreateBy, u.nomeusuario FROM Event e Inner Join usuarios u On e.CreateBy = u.matricula WHERE Budget_ID = ? AND EventStatus_ID = 3 AND (DATE(StartEvent) BETWEEN DATE(?) AND DATE(?))', [item.Budget_ID, req.body.startDate, req.body.endDate],function(err, result) {
          con.release();
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            result.map((x)=>{
              item.events.push({
                "EventCode": x.EventCode,
                "Name": x.Name,
                "StartEvent": x.StartEvent,
                "EndEvent": x.EndEvent,
                "matricula": x.CreateBy,
                "nomeMatricula": x.nomeusuario,
                products: []
              })
            })
            callback()
          }
        })
      })
    }, function(err) {
      next()
    })
  }

  this.getDistinctBudget = function(req, res, next){
    req.body.arrayIDBudget = JSON.parse(req.body.arrayIDBudget)
    let clauseIn = req.body.arrayIDBudget.map((x)=>x.value).join(',')
    debugger
    // console.log(typeof clauseIn)
    let sqlString = ''
    if(0 === req.body.arrayIDBudget.length){
      sqlString = 'SELECT DISTINCT(Budget_ID), o.setor, o.grupo, o.conta, o.nconta FROM Event Inner Join orcamento o ON Event.Budget_ID = o.id WHERE Budget_ID IS NOT NULL AND (DATE(StartEvent) BETWEEN DATE(?) AND DATE(?))'
    }else{
      sqlString = 'SELECT DISTINCT(Budget_ID), o.setor, o.grupo, o.conta, o.nconta FROM Event Inner Join orcamento o ON Event.Budget_ID = o.id WHERE Budget_ID IS NOT NULL AND (DATE(StartEvent) BETWEEN DATE(?) AND DATE(?)) AND Budget_ID IN ('+clauseIn+')'
    }
    conn.acquire(function(err,con){
      // console.log(req.body.arrayIDBudget)
      con.query(sqlString, [req.body.startDate, req.body.endDate],  function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          debugger
          console.log(this.sql)
          // console.log(result)
          // req.getDistinctBudget = req.getDistinctBudget.map((x)=>x.Budget_ID);
          req.getDistinctBudget = result.map((x)=>{
            let a = {}
            a.Budget_ID = x.Budget_ID
            a.nconta = x.nconta
            a.setor = x.setor
            a.grupo = x.grupo
            a.conta = x.conta
            a.events = []
            return a
          })
          next()
        }
      });
    });
  }
}

module.exports = new FinancialReport()
