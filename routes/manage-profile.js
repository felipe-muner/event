var express = require('express');
var router = express.Router();
var conn = require(process.env.PWD + '/conn');
var moment = require('moment');

let getAllFunctionality = function(req,res,next){
  conn.acquire(function(err,con){
    con.query('SELECT f.FunctionalityID, f.Name from Functionality f where f.System_ID = ? AND f.Active = 1',[process.env.SYSTEM_ID], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log(JSON.stringify(result, null, 2));
        req.functionalities = result
        next()
      }
    });
  });
}

let getAllProfileSystem = function(req,res,next){
  conn.acquire(function(err,con){
    con.query('SELECT pas.idperfilsistema, pas.nomeperfilacesso from perfis_acesso_sistemas pas where pas.id_sistema = ?',[process.env.SYSTEM_ID], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log(JSON.stringify(result, null, 2));
        req.profiles = result
        next()
      }
    });
  });
}

let renderMainPage = function(req,res,next){
  res.render('manage-profile/tela-inicial',{
    sess:req.session,
    profiles: req.profiles
  })
}

router.get('/', getAllProfileSystem, renderMainPage);

router.get('/edit', function(req, res, next) {
  console.log('editar profile evento');
  res.render('user', {dados:'editando'});
});

router.get('/new', function(req, res, next) {
  console.log('tela novo profile');
  res.render('manage-profile/new-profile', {sess:req.session})
});

router.post('/new', function(req, res, next) {
  console.log('cadastrar novo profile');
  console.log('vou redirecior');
  res.redirect('/manage-profile')
});

module.exports = router;
