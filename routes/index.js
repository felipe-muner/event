const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/testeJavaScriptTemplate', function(req, res, next) {
  console.log('testeJavaScriptTemplate view');
  res.render('testeJavaScriptTemplate',{layout:false})
});

router.get('/*', function(req, res, next) {
  console.log(req.session)
  next()
});

router.get('/', function(req, res, next) {
  console.log('emntrei no /');
  res.render('login',{layout:false})
});

router.post('/login', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('SELECT '+
                'u.matricula,'+
                'u.nomeusuario,'+
                'u.AttemptLogin,'+
                'u.senha,'+
                'u.date_last_change_pass,'+
                'u.primeiroacesso,'+
                's.idsistema,'+
                'uca.id_perfil_sistema,'+
                'unidades.idunidade,'+
                'unidades.unidade,'+
                'departamentos.nomedepartamento,'+
                '(select valor from constantes where nome = ?) as limitDaySamePassword '+
              'FROM '+
                'sistemas s '+
              'INNER JOIN '+
                'usuarios u '+
              'INNER JOIN '+
                'usuario_controle_acesso uca '+
              'ON '+
                's.idsistema = uca.id_sistema '+
              'AND '+
                'uca.id_usuario = u.idusuario '+
              'INNER JOIN '+
                'unidades ON u.id_site = unidades.idunidade '+
              'INNER JOIN '+
                'departamentos ON u.id_departamento = departamentos.iddepartamento '+
              'WHERE '+
                's.idsistema = 7 '+
              'AND '+
                'matricula = ?', ['qtd_dia_alter_senha', parseInt(req.body.matricula)], function(err, result) {
      con.release();
      if(err){ res.render('error', { error: err } );}
      else{
        console.log(this.sql);
        console.log(result[0]);
        if( result[0].AttemptLogin > 2 ){
          res.send('usuario bloqueado, favor entrar em contato com ict')
        }else if(0 === result.length){
          res.render('login',{ layout: false, alertClass: 'alert-danger', msg: 'Incorrect Enrolment Number'})
        }else if( result[0].senha !== md5(req.body.password) ){
          conn.acquire(function(err,con){
            con.query('UPDATE usuarios SET AttemptLogin = AttemptLogin + 1 where matricula = ?', [req.body.matricula], function(err, result) {
              con.release();
              if(err){ res.render('error', { error: err } );}
            })
          })
          res.render('login',{ layout:false, alertClass: 'alert-danger', msg: 'Incorrect Password'})
        }else{
          if(0 === result[0].primeiroacesso){
            req.session.matricula = req.body.matricula
            req.session.password = req.body.password
            res.redirect('/change-password')
          }else if( moment().diff(moment(result[0].date_last_change_pass),'days') > parseInt(result[0].limitDaySamePassword) ){
            req.session.matricula = req.body.matricula
            req.session.password = req.body.password
            res.send('necessario alterar senha')
          }else{
            conn.acquire(function(err,con){
              con.query('UPDATE usuarios SET AttemptLogin = 0 where matricula = ?', [req.body.matricula], function(err, result) {
                con.release();
              })
            })
            console.log('diferenca menor que dia limite --- ' + moment().diff(moment(result[0].date_last_change_pass),'days'));
            req.session.matricula = result[0].matricula
            req.session.idunidade = result[0].idunidade
            req.session.profile = result[0].id_perfil_sistema
            res.redirect('/panel')
            // conn.acquire(function(err,con){
            //   con.query('SELECT '+
            //               'f.name,'+
            //               'f.action '+
            //             'FROM '+
            //                 'Functionality f '+
            //             'inner join '+
            //               'ProfileFuncionality pf '+
            //             'ON '+
            //               'f.FunctionalityID = pf.Funcionality_ID '+
            //             'WHERE ' +
            //               'pf.Profile_ID = ?', [parseInt(result[0].id_perfil_sistema)], function(err, funcionality) {
            //     con.release();
            //     console.log(funcionality);
            //     console.log(this.sql);
            //
            //   })
            // })
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
          res.render('change-password',{layout:false, alertClass: 'alert-danger', msg: 'Incorrect Enrolment Number or Password.'});
        }else{
          conn.acquire(function(err,con){
            let query = 'UPDATE usuarios SET senha = md5(?), primeiroacesso = 1, AttemptLogin = 0, date_last_change_pass = NOW() WHERE Matricula = ?'
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

router.post('/email-forget-password', function(req, res, next) {
  conn.acquire(function(err,con){
    let randomString = Util.randomAlphaNumeric(6)
    let matricula = parseInt(req.body.matriculaToReset)
    let sql = 'UPDATE usuarios SET senha = md5(?), primeiroacesso=0 WHERE matricula = ?'
    con.query(sql, [randomString, matricula], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        if(!!result.affectedRows){
          sql = 'SELECT email FROM usuarios WHERE Matricula = ?'
          con.query(sql, [matricula], function(err, result) {
            mailSender.emailRecoverPassword(randomString, result[0].email, matricula)
            res.render('login',{layout:false, alertClass: 'alert-success', msg: 'Please, check your e-mail. New Password was sent.'});
          })
        }else{
          res.render('login',{layout:false, alertClass: 'alert-danger', msg: 'Incorrect Matrícula / E-mail.'});
        }
      }
    });
  });
});

router.get('*', function(req, res, next) {
  //console.log('entrei no *');
  //console.log(req.session);
  req.session.matricula ? next() : res.redirect('/');
});

router.get('/create-event', function(req, res, next) {
  res.render('createEvent')
});

router.get('*', function(req, res, next) {
  req.session.matricula ? next() : res.redirect('/');
});

router.get('/panel', function(req, res, next) {
  console.log(req.session + 2);
  res.render('panel', { sess: req.session})
});

module.exports = router;
