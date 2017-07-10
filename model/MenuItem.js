const conn = require(process.env.PWD + '/conn');

function MenuItem(){
  this.addProduct = function(req, res, next){
    delete req.body.EventProductID
    conn.acquire(function(err,con){
      con.query('INSERT INTO EventProduct SET ?', [req.body], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          next()
        }
      });
    });
  }
  this.getAllProduct = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'ep.EventProductID, ep.NameEnglish, ep.NamePort, ep.Price, epu.NameEnglish as NameUnitEngl, epu.NamePort as NameUnitPort, ep.Active '+
                'FROM '+
                  'EventProduct ep INNER JOIN EventProductUnit epu '+
                'ON ep.Unit = epu.EventProductUnitID', function(err, result) {
        console.log(this.sql);
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allProduct = result
          next()
        }
      });
    });
  }
  this.getAllProductActive = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'ep.EventProductID, ep.NameEnglish, ep.NamePort, ep.Price, epu.NameEnglish as NameUnitEngl, epu.NamePort as NameUnitPort, ep.Active '+
                'FROM '+
                  'EventProduct ep INNER JOIN EventProductUnit epu '+
                'ON ep.Unit = epu.EventProductUnitID AND ep.Active = 1', function(err, result) {
        console.log(this.sql);
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allProductActive = result
          next()
        }
      });
    });
  }
  this.changeActive = function(req, res, next){
    conn.acquire(function(err,con){
      let changedActive
      (parseInt(req.params.Active) === 1) ? changedActive = 0 : changedActive = 1
      console.log(typeof changedActive);
      con.query('UPDATE EventProduct SET Active = ? WHERE EventProductID = ?', [changedActive, req.params.EventProductID], function(err, result) {
        console.log(this.sql);
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          next()
        }
      });
    });
  }
  this.findById = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'ep.EventProductID, ep.NameEnglish, ep.NamePort, ep.Price, ep.Active, epu.NameEnglish as NameUnitEngl, epu.NamePort as NameUnitPort, epu.EventProductUnitID '+
                'FROM '+
                  'EventProduct ep INNER JOIN EventProductUnit epu '+
                'ON ep.Unit = epu.EventProductUnitID '+
                'WHERE '+
                'ep.EventProductID = ?', [parseInt(req.params.EventProductID)], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.findById = result[0]
          next()
        }
      });
    });
  }
  this.updateItem = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('UPDATE EventProduct SET ? WHERE EventProductID = ?', [req.body, req.body.EventProductID], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          next()
        }
      });
    });
  }
  this.getAllUnit = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT EventProductUnitID, NameEnglish, NamePort FROM EventProductUnit WHERE Active = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allUnit = result
          next()
        }
      });
    });
  }
  this.bulkItemEvent = function(req, res, next){
        
    let bulkQuery = JSON.parse(req.body.products).map(function(e){
      let item = []
      new Array().push.call(item, req.resultCreated.insertId, e.productId, e.priceProd, e.qtd)
      return item
    })

    conn.acquire(function(err,con){
      con.query('INSERT INTO EventItem(Event_ID, EventProduct_ID, Price, Amount) VALUES ?', [bulkQuery], function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log('gravei os produtos no evento');
          console.log(result);
          next()
        }
      });
    });
  }
}

module.exports = new MenuItem()
