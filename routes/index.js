var express = require('express');
var router = express.Router();
var conn = require(process.env.PWD + '/conn');
var Util = require(process.env.PWD + '/util/Util')
var mailSender = require(process.env.PWD + '/util/MailSender')
var fs = require('fs');
var pdf = require('html-pdf');
var A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', function(req, res, next) {
  res.render('login',{layout:false})
});

router.get('/testeJavaScriptTemplate', function(req, res, next) {
  res.render('testeJavaScriptTemplate')
});

router.get('/gerarPDF', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('select * from User u inner join AccessGroup ag on u.Group_ID = ag.AccessGroupID limit 3000', function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        let html = Util.generateHTMLReport(res,result,['Group_ID','Matricula','DateBirth','PasswordChanged','Password'])
      }
    })
  })
});

router.get('/logout', function(req, res, next) {
  console.log('logout');
  req.session.destroy();
  res.render('login', {layout:false, alertClass: 'alert-info', msg : 'Logout Successfull !'})
});

router.get('/change-password', function(req, res, next) {
  //(req.session.credential) ? console.log('tem credential') : console.log('n-------tem credential');
  let obj = {layout:false}
  if (req.session.credential) {
    obj.matricula = req.session.credential.matricula
    obj.password = req.session.credential.password
    console.log('$$$$$$ - tem credencial');
    req.session.credential.matricula = null
    req.session.credential.password = null
    res.render('change-password', obj)
  } else {
    console.log('----n tem credencial');
    res.render('change-password', obj)
  }
  console.log('felipe' + JSON.stringify(obj));
});

router.get('/email-change-password', function(req, res, next) {
  res.render('change-password', {layout:false})
});

router.post('/change-password', function(req, res, next) {
  let Email = req.body.Email
  let Password = req.body.currentpassword
  conn.acquire(function(err,con){
    let sql = ''
    if(Number.isInteger(parseInt(Email))){
        sql = 'SELECT Matricula FROM User where Matricula = ? AND Password = ?'
    }else{
        sql = 'SELECT Matricula FROM User where Email = ? AND Password = ?'
    }
    con.query(sql, [Email, Password], function(err, result) {
      console.log(this.sql);
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        if(0 === result.length){
          res.send('ninguem com essa senha')
        }else{
          conn.acquire(function(err,con){
            if(Number.isInteger(parseInt(Email))){
                sql = 'UPDATE User SET Password = ?, ChangePassword = 1, PasswordChanged = NOW() WHERE Matricula = ?'
            }else{
                sql = 'UPDATE User SET Password = ?, ChangePassword = 1, PasswordChanged = NOW() WHERE Email = ?'
            }
            con.query(sql, [req.body.Password, Email], function(err, result) {
              console.log('update' + this.sql);
              con.release();
              if(err){
                res.render('error', { error: err } );
              }else{
                res.send(result);
              }
            })
          })
        }
      }
    });
  });
})

router.post('/emailforgetpassword', function(req, res, next) {
  conn.acquire(function(err,con){
    let randomString = Util.randomAlphaNumeric(6)
    let userToReset = req.body.matriculaOrEmail
    let sql = ''
    if(Number.isInteger(parseInt(userToReset))){
        sql = 'UPDATE User SET Password = ?, ChangePassword=0 WHERE Matricula = ?'
    }else{
        sql = 'UPDATE User SET Password = ?, ChangePassword=0 WHERE Email = ?'
    }
    con.query(sql, [randomString, userToReset], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        if(!!result.affectedRows){
          if(Number.isInteger(parseInt(userToReset))){
            sql = 'SELECT Email FROM User WHERE Matricula = ?'
            con.query(sql, [parseInt(userToReset)], function(err, result) {
              mailSender.emailRecoverPassword(randomString, result[0].Email)
              res.render('login',{layout:false, alertClass: 'alert-success', msg: 'Please, check your e-mail. New Password was sent.'});
            })
          }else{
              mailSender.emailRecoverPassword(randomString, userToReset)
              res.render('login',{layout:false, alertClass: 'alert-success', msg: 'Please, check your e-mail. New Password was sent.'});
          }
        }else{
          res.render('login',{layout:false, alertClass: 'alert-danger', msg: 'Incorrect Matrícula / E-mail.'});
        }

      }
    });
  });
});

router.post('/login', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('SELECT * FROM User WHERE Matricula = ?', [req.body.matricula], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        if(0 === result.length){
          res.render('login',{ layout:false , alertClass: 'alert-danger', msg: 'Incorrect Matricula'})
        }else if(req.body.password !== result[0].Password){
          res.render('login',{ layout:false , alertClass: 'alert-danger', msg: 'Incorrect Password'})
        }else{
          if(0 === result[0].ChangePassword){
            req.session.credential = req.body
            res.redirect('/change-password')
          }else{
            req.session.Matricula = result[0].Matricula
            res.redirect('/panel')
          }
        }
      }
    });
  });
});

router.get('*', function(req, res, next) {
  req.session.Matricula ? next() : res.redirect('/');
});

router.get('/createEvent', function(req, res, next) {
  res.render('createEvent')
});

router.get('/panel', function(req, res, next) {
  res.render('panel',{userSession: req.session})
});

module.exports = router;
