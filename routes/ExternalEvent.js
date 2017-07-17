const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const mi = require(process.env.PWD + '/model/MenuItem')
const d = require(process.env.PWD + '/model/Departament')
const ee = require(process.env.PWD + '/model/ExternalEvent')
const g = require(process.env.PWD + '/model/Guest')
const u = require(process.env.PWD + '/model/User')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', function(req, res, next) {
  console.log('entrei evento routa externo');
  res.render('external-event/external-event',{dados:'felipe externo',sess:req.session})
}).post('/search-events', ee.searchEventTwoDate, function(req, res, next) {
  //console.log(req.allEvents);
  res.json(req.allEvents)
})

module.exports = router;
