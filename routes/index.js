const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/model/MailSender')
const l = require(process.env.PWD + '/model/Login')
const fs = require('fs')
const moment = require('moment')
const md5 = require('md5')
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

// router.get('/testeJavaScriptTemplate', function(req, res, next) {
//   conn.acquire(function(err,con){
//     con.query('SELECT * FROM usuarios WHERE ativo = 1 ORDER BY idusuario', function(err, result) {
//       con.release();
//       if(err){
//         res.render('error', { error: err } );
//       }else{
//         result.map(function(e){
//           console.log('INSERT INTO usuario_controle_acesso VALUES(null,'+e.idusuario+',7,20,1);')
//         })
//       }
//     });
//   });
//   res.send('ok')
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

router.post('/login', l.searchMatricula, l.incrementAttempt, l.checkFirstAccess, l.changeSenhaBecauseTime, l.getFunctionality, l.getBudgets, l.clearAttempt, function (req, res, next){
  console.log('___')
  console.log('___')
  console.log(req.foundUser)
  console.log('___')
  console.log(req.functionalityProfile)
  console.log('___')
  console.log(req.budgets)
  console.log('___')
  console.log('___')


  req.session.matricula = req.foundUser.matricula
  req.session.nomeusuario = req.foundUser.nomeusuario
  req.session.profile = req.foundUser.id_perfil_sistema
  req.session.idunidade = req.foundUser.idunidade
  req.session.functionalityProfile = req.functionalityProfile
  req.session.budgets = req.budgets

  res.redirect('/panel')
})

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
})

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
                res.redirect('/login')
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
    let sql = 'UPDATE usuarios SET senha = md5(?), AttemptLogin=0, primeiroacesso=0 WHERE matricula = ?'
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
})

// router.post('/email-forget-password', function(req, res, next) {
//   console.log('entrei aqui');
//   conn.acquire(function(err,con){
//     let randomString = Util.randomAlphaNumeric(6)
//     let matricula = parseInt(req.body.matriculaToReset)
//     let sql = 'UPDATE usuarios SET senha = md5(?), primeiroacesso=0 WHERE matricula = ?'
//     con.query(sql, [randomString, matricula], function(err, result) {
//       con.release();
//       if(err){
//         res.render('error', { error: err } );
//       }else{
//         if(!!result.affectedRows){
//           sql = 'SELECT email FROM usuarios WHERE Matricula = ?'
//           con.query(sql, [matricula], function(err, result) {
//             mailSender.emailRecoverPassword(randomString, result[0].email, matricula)
//             res.render('login',{layout:false, alertClass: 'alert-success', msg: 'Please, check your e-mail. New Password was sent.'});
//           })
//         }else{
//           res.render('login',{layout:false, alertClass: 'alert-danger', msg: 'Incorrect Matrícula / E-mail.'});
//         }
//       }
//     });
//   });
// })

router.get('*', function(req, res, next) {
  req.session.matricula ? next() : res.redirect('/');
});

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
