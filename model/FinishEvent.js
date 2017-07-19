const conn = require(process.env.PWD + '/conn');

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
                  'EventItem.Event_ID = ?', [req.query.eventcode], function(err, result) {
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
}

module.exports = new FinishEvent()
