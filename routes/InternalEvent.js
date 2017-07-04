const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const InternalEvent = require(process.env.PWD + '/model/InternalEvent')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', InternalEvent.getAllSiteBuildingRoom, function(req, res, next) {
  //console.log('entrei evento routa interno');
  //console.log(req.connection);
  res.render('internal-event/internal-event',{
    sess:req.session,
    getAllSiteBuildingRoom: req.getAllSiteBuildingRoom
  })
}).post('/search-events', InternalEvent.searchEventTwoDate, function(req, res, next) {
  // console.log(req.allEvents);
  res.json(req.allEvents)
})

module.exports = router;
