const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fs = require('fs');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', function(req, res, next) {
  console.log('emntrei no /');
  res.render('login',{layout:false})
});

router.post('/login', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('SELECT * FROM usuarios WHERE Matricula = ?', [req.body.matricula], function(err, result) {
      con.release();
      if(err){ res.render('error', { error: err } );}
      else{
        if(0 === result.length){
          res.render('login',{ layout: false, alertClass: 'alert-danger', msg: 'Incorrect Enrolment Number  '})
        }else if( result[0].senha !== md5(req.body.password) ){
          res.render('login',{ layout:false, alertClass: 'alert-danger', msg: 'Incorrect Password'})
        }else{
          if(0 === result[0].primeiroacesso){
            req.session.matricula = req.body.matricula
            req.session.password = req.body.password
            console.log('entrei nao é primeira acesso');
            console.log(req.session);
            res.redirect('/change-password')
          }else{
            console.log('entrei nao é primeira acesso');
            req.session.matricula = result[0].matricula
            res.redirect('/panel')
          }
        }
      }
    });
  });
});

router.get('/logout', function(req, res, next) {
  console.log('logout');
  req.session.destroy();
  res.render('login', {layout:false, alertClass: 'alert-info', msg : 'Logout Successfull !'})
});

router.get('/email-change-password', function(req, res, next) {
  res.render('change-password', {layout:false})
});

router.get('/change-password', function(req, res, next) {
  //(req.session.credential) ? console.log('tem credential') : console.log('n-------tem credential');
  let obj = {layout:false}
  if (req.session.matricula) {
    obj.matricula = req.session.matricula
    obj.password = req.session.password
    res.render('change-password', obj)
  } else {
    res.render('change-password', obj)
  }
});

router.post('/change-password', function(req, res, next) {
  let matricula = parseInt(req.body.matricula)
  let currentpassword = req.body.currentpassword
  conn.acquire(function(err,con){
    let query = 'SELECT matricula FROM usuarios where matricula = ? AND senha = md5(?)'
    con.query(query, [matricula, currentpassword], function(err, result) {
      console.log(this.sql);
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        if(0 === result.length){
          res.send(this.sql)
        }else{
          conn.acquire(function(err,con){
            let query = 'UPDATE usuarios SET senha = md5(?), primeiroacesso = 1, date_last_change_pass = NOW() WHERE Matricula = ?'
            con.query(query, [req.body.newpassword, matricula], function(err, result) {
              console.log('updateQuery - ' + this.sql);
              con.release();
              if(err){
                res.render('error', { error: err } );
              }else{
                req.session.matricula = matricula
                res.redirect('/panel')
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
    let randomString = md5( Util.randomAlphaNumeric(6) )
    let userToReset = req.body.matriculaOrEmail
    let sql = 'UPDATE usuarios SET senha = ?, ChangePassword=0 WHERE Matricula = ?'
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

router.get('*', function(req, res, next) {
  console.log('entrei no *');
  console.log(req.session);
  req.session.matricula ? next() : res.redirect('/');
});

router.get('/createEvent', function(req, res, next) {
  res.render('createEvent')
});

router.get('/panel', function(req, res, next) {
  res.render('panel', { sess: req.session})
});

module.exports = router;
