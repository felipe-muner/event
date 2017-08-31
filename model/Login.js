const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const moment = require('moment')
const md5 = require('md5')

function Login(){

  this.checkFirstAccess = function(req, res, next){
    if (req.checkFirstAccess) {
      // console.log('____trocar senha primeiro acesso')
      // console.log(req.body)
      console.log('____trocar senha primeiro acesso')
      res.render('change-password',{user:req.body,layout:false})
    }else {
      next()
    }
  }

  this.changeSenhaBecauseTime = function(req, res, next){
    if (req.changeSenhaBecauseTime) {
      // console.log('____trocar senha becausetimte')
      // console.log(req.body)
      console.log('____trocar senha becausetimte')
      res.render('change-password',{user:req.body,layout:false})
    }else {
      next()
    }
  }

  this.getAllBudgets = function(req, res, next){
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
                  'ORDER BY o.setor, o.grupo, o.conta', function(err, budgets) {
        con.release()
        if(err){
          console.log(err);
          res.render('error', { error: err } )
        }else{
          console.log(budgets);
          req.allBudgets = budgets
          next()
        }
      })
    })
  }

  this.getBudgets = function(req, res, next){
    console.log();
    if (req.userOkpassOk) {
      console.log('buscar budget___')
      console.log(req.foundUser)
      console.log('buscar budget___')
      if ('A' === req.foundUser.Tipo) {
        console.log('USUARIO ADM')
        let budgets = [{
          id_orca: '999999',
          setor: '001',
          grupo: '001',
          conta: '00WS',
          nomecont: 'Whole School',
          saldo: 10000000
        }]
        req.budgets = budgets
        next()
      }else if('E' === req.foundUser.Tipo){
        console.log('USUARIO EDUCACIONAL')
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
                      'u.ID_USER = ?', [req.foundUser.Purchasing_ID], function(err, budgets) {
            con.release()
            console.log('BUDGETS ASSOCIADOS: ' + this.sql);
            // console.log('BUDGETS ASSOCIADOS: ' + budgets);
            req.budgets = budgets
            next()
          })
        })
      }
    }else {
      next()
    }
  }

  this.getFunctionality = function(req, res, next){
    if (req.userOkpassOk) {
      conn.acquire(function(err,con){
        con.query('SELECT '+
                    'f.Name, '+
                    'f.Action, '+
                    'f.Icon '+
                  'FROM '+
                    'usuarios AS u '+
                  'Inner Join usuario_controle_acesso AS uca ON u.idusuario = uca.id_usuario '+
                  'Inner Join perfis_acesso_sistemas AS pas ON uca.id_perfil_sistema = pas.idperfilsistema '+
                  'Inner Join ProfileFunctionality AS pf ON pas.idperfilsistema = pf.Profile_ID '+
                  'Inner Join Functionality AS f ON pf.Functionality_ID = f.FunctionalityID '+
                  'WHERE '+
                    'u.matricula = ? AND '+
                    'pas.id_sistema = ? AND '+
                    'f.Active = 1 '+
                  'ORDER BY f.Priority', [parseInt(req.body.matricula), parseInt(process.env.SYSTEM_ID)], function(err, result) {
          con.release();
          console.log('query functionality')
          console.log(this.sql)
          console.log('query functionality')
          if(err){
            console.log(err);
            res.render('error', { error: err } )
          }else{
            //LOGOU PERFEITAMENTE
            req.functionalityProfile = result
            console.log(' busquei as funcionalidades')
            next()
          }
        })
      })
    }else {
      next()
    }
  }

  this.incrementAttempt = function(req, res, next){
    if (req.incrementAttempt) {
      conn.acquire(function(err,con){
        con.query('UPDATE usuarios SET AttemptLogin = AttemptLogin + 1 WHERE matricula = ?', [req.body.matricula], function(err, result) {
          con.release();
          // console.log(this.sql);
          if(err){
            console.log(err);
            res.render('error', { error: err } )
          }else{
            res.render('login',{ layout: false, alertClass: 'alert-danger', msg: 'Incorrect Password'})
          }
        })
      })
    }else {
      next()
    }
  }

  this.clearAttempt = function(req, res, next){
    if (req.clearAttempt) {
      conn.acquire(function(err,con){
        con.query('UPDATE usuarios SET AttemptLogin = 0 WHERE matricula = ?', [req.body.matricula], function(err, result) {
          con.release();
          // console.log(this.sql);
          if(err){
            console.log(err);
            res.render('error', { error: err } );
          }else{
            next()
          }
        })
      })
    }else {
      next()
    }
  }

  this.searchMatricula = function(req, res, next){
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
        // console.log('query GETUSER: ' + this.sql)
        con.release();
        if(err){ res.render('error', { error: err } );}
        else{
          if(0 === result.length){
            // console.log('nao achei suuario');
            res.render('login',{ layout: false, alertClass: 'alert-danger', msg: 'Incorrect Enrolment Number'})
          }else if(result[0].senha !== md5(req.body.password)){
            // console.log('usuario certo e senha errada');
            if(result[0].AttemptLogin > 2){
              res.render('login',{ layout: false, alertClass: 'alert-danger', msg: 'User blocked.'})
            }else{
              req.incrementAttempt = true
              next()
            }
          }else{
            if ( 0 === result[0].primeiroacesso ) {
              req.checkFirstAccess = true
            }
            if ( moment().diff(moment(result[0].date_last_change_pass),'days') > parseInt(result[0].limitDaySamePassword) ) {
              req.changeSenhaBecauseTime = true
            }
            req.clearAttempt = true
            req.userOkpassOk = true
            req.foundUser = result[0]
            console.log('usuario e senha certo')
            next()
          }
        }
      })
    })
  }
}

module.exports = new Login()
