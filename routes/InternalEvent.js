const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const ie = require(process.env.PWD + '/model/InternalEvent')
const mi = require(process.env.PWD + '/model/MenuItem')
const d = require(process.env.PWD + '/model/Departament')
const u = require(process.env.PWD + '/model/User')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', ie.getAllSiteBuildingRoom, mi.getAllProductActive, d.all, u.allActive, function(req, res, next) {
  // console.log(req.allDepartament);
  // console.log(req.allActiveUser);
  console.log('felipe entrei ------');
  res.render('internal-event/internal-event',{
    sess:req.session,
    getAllSiteBuildingRoom: req.getAllSiteBuildingRoom,
    allProductActive: req.allProductActive,
    allDepartament:req.allDepartament,
    allActiveUser:req.allActiveUser
  })
}).post('/search-events', ie.searchEventTwoDate, function(req, res, next) {
  console.log(req.allEvents);
  res.json(req.allEvents)
}).post('/create-event', ie.createEvent, function(req, res, next) {
  console.log(req.resultCreated);
  for(var abc in JSON.parse(req.body.products)){
    console.log(JSON.parse(req.body.products)[abc])
  }
  res.json(req.body)
})

module.exports = router;
