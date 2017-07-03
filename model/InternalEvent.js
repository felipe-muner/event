const conn = require(process.env.PWD + '/conn');

function InternalEvent(){
  this.getAllSite = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT idunidade, unidade FROM unidades', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allSite = result
          next()
        }
      });
    });
  }
  this.getAllBuilding = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('Select BuildingID, Site_ID, Name from Building WHERE Status = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allBuilding = result
          next()
        }
      });
    });
  }
  this.getAllRoom = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('Select RoomID, Building_ID, Name, Status FROM Room Where Status = 1 AND CanEvent = 1', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(req.allSite);
          req.allRoom = result
          next()
        }
      });
    });
  }

  this.searchEvents = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT EventID, Name, StartingDate, StartingTime, EndTime FROM Event WHERE YEAR(StartingDate) = ? AND MONTH(StartingDate) = ?', [req.body.currentYear, req.body.currentMonth],function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          req.allEvents = result
          next()
        }
      });
    });
  }

  this.searchEventTwoDate = function(req, res, next){
    conn.acquire(function(err,con){
      console.log(req.body);
      con.query('SELECT EventID, Name as title, StartingDate, StartingTime, EndTime FROM Event '+
      'WHERE StartingDate >= ? AND StartingDate <= ? AND '+
      'Room_ID = ?', [req.body.firstDay, req.body.lastDay, req.body.roomID],function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(this.sql);
          req.allEvents = result
          next()
        }
      });
    });
  }

  this.getAllSiteBuildingRoom = function(req, res, next){
    conn.acquire(function(err,con){
      con.query('SELECT '+
                  'u.idunidade, '+
                  'upper(u.unidade) as unidade, '+
                  'b.BuildingID, '+
                  'b.Name as NameBuilding, '+
                  'r.RoomID, '+
                  'r.Name as NameRoom '+
                'FROM '+
                  'Room AS r '+
                  'Inner Join Building AS b ON r.Building_ID = b.BuildingID '+
                  'Inner Join unidades AS u ON b.Site_ID = u.idunidade '+
                'WHERE '+
                  'r.Status = 1 '+
                'ORDER BY '+
                  'u.idunidade ASC, '+
                  'b.BuildingID ASC, '+
                  'r.RoomID ASC', function(err, result) {
        con.release();
        if(err){
          res.render('error', { error: err } );
        }else{
          console.log(this.sql);
          req.getAllSiteBuildingRoom = result
          next()
        }
      });
    });
  }
}

module.exports = new InternalEvent()
