const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
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

// router.get('/*', function(req, res, next) {
//   next()
// });

router.get('/', function(req, res, next) {
  console.log('entrei aqui testarei session');
  if (req.session.matricula) {
    console.log('entrei aqui tem session!');
    res.redirect('/panel')
  }else{
    console.log('entrei aqui NNNNN tem session!');
    res.render('login',{layout:false})
  }
});

router.post('/login', function(req, res, next) {
  conn.acquire(function(err,con){
    con.query('SELECT '+
                'u.matricula,'+
                'u.Tipo,'+
                'u.Purchasing_ID,'+
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
      console.log('query GETUSER: ' + this.sql)
      con.release();
      if(err){ res.render('error', { error: err } );}
      else{
        if(0 === result.length){
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
          if( result[0].AttemptLogin > 2 ){
            res.send('usuario bloqueado, favor entrar em contato com ict')
          }else if(0 === result[0].primeiroacesso){
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
            conn.acquire(function(err,con){
              con.query('select f.Name, f.Action, f.Icon from Functionality f inner join ProfileFunctionality pf on pf.Functionality_ID = f.FunctionalityID where pf.Profile_ID = ?', [result[0].id_perfil_sistema], function(err, functionality) {
                console.log('query profile: ' + this.sql);
                con.release();
                //console.log('diferenca menor que dia limite --- ' + moment().diff(moment(result[0].date_last_change_pass),'days'));
                req.session.matricula = result[0].matricula
                req.session.nomeusuario = result[0].nomeusuario
                req.session.idunidade = result[0].idunidade
                req.session.profile = result[0].id_perfil_sistema
                req.session.functionalityProfile = functionality
                if('A' === result[0].Tipo){
                  let budgets = [{
                    id_orca: '999999',
                    setor: '001',
                    grupo: '001',
                    conta: '00WS',
                    nomecont: 'Whole School',
                    saldo: 10000000
                  }]
                  req.session.budgets = budgets
                  console.log('---ADMINSITRATIVO');
                  res.redirect('/panel')
                }else{
                  console.log('---EDUUUUUUUUUUUU');
                  connPurchasing.acquire(function(err,con){
                    con.query('SELECT '+
                                'o.id_orca, '+
                                'o.setor, '+
                                'o.grupo, '+
                                'o.conta, '+
                                'o.nomecont, '+
                                'o.saldo '+
                                'FROM '+
                                'orcamento AS o '+
                                'Inner Join user_view_budget AS uvb ON uvb.id_budget = o.id_orca '+
                                'Inner Join tblusers AS u ON uvb.id_user = u.ID_USER '+
                                'WHERE '+
                                'u.ID_USER = ?', [result[0].Purchasing_ID], function(err, budgets) {
                      con.release();
                      console.log('BUDGETS ASSOCIADOS: ' + this.sql);
                      console.log('BUDGETS ASSOCIADOS: ' + budgets);
                      req.session.budgets = budgets
                      res.redirect('/panel')
                    })
                  })
                }
              })
            })
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

// router.get('*', function(req, res, next) {
//   req.session.matricula ? next() : res.redirect('/');
// });

router.get('/panel', function(req, res, next) {
  console.log('entrei panel');
  console.log('Matricula: ' + req.session.matricula);
  console.log('Nome Usuario: ' + req.session.nomeusuario);
  console.log('Perfil: ' + req.session.profile);
  console.log('Unidade: ' + req.session.idunidade);
  console.log(req.session.functionalityProfile);
  console.log('----budgets' + JSON.stringify(req.session.budgets,null,2));
  res.render('panel', {sess: req.session})
});

module.exports = router;
