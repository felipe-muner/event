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
        //console.log(JSON.stringify(result, null, 2));
        req.functionalities = result
        next()
      }
    });
  });
}

let newProfile = function(req,res,next){
  console.log(req.body);
  let obj = {
    nomeperfilacesso: req.body.nomeperfilacesso,
    id_sistema: process.env.SYSTEM_ID
  }
  console.log('gravarei nomeperfilacesso');
  //res.send('gravarei')
  conn.acquire(function(err,con){
    con.query('INSERT INTO perfis_acesso_sistemas SET ?', [obj], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log(result);
        req.lastIDCreated = result.insertId
        next()
      }
    });
  });
}

let connectProfileFunctionality = function(req,res,next){
  console.log('-----------');
  console.log(req.body);
  console.log(req.lastIDCreated);
  console.log('-----------');
  console.log('vou gravar as funcionalidades no id do perfil');

  let bulkQuery = req.body.functionalities.map(function(e){
    let item = []
    new Array().push.call(item, req.lastIDCreated, parseInt(e))
    return item
  })
  conn.acquire(function(err,con){
    con.query('INSERT INTO ProfileFunctionality(Profile_ID, Functionality_ID) VALUES ?', [bulkQuery], function(err, result) {
      con.release();
      if(err){
        res.render('error', { error: err } );
      }else{
        console.log('gravei um novo perfil e suas funcionalidades');
        console.log(result);
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
        //console.log(JSON.stringify(result, null, 2));
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

router.get('/new', getAllFunctionality,function(req, res, next) {
  console.log('tela novo profile');
  console.log(req.functionalities);
  res.render('manage-profile/new-profile', {
    sess:req.session,
    functionalities:req.functionalities
  })
});

router.post('/new', newProfile, connectProfileFunctionality, function(req, res, next) {
  console.log('cadastrei um novo perfil !! novo profile');
  console.log(req.lastIDCreated);
  console.log('______________________________');
  //console.log(req.body);
  res.redirect('/manage-profile')
});

module.exports = router;
