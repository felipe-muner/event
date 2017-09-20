const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fe = require(process.env.PWD + '/model/FinishEvent')
const myevent = require(process.env.PWD + '/model/MyEvent')
const m = require(process.env.PWD + '/model/MailSender')
const f = require(process.env.PWD + '/model/Find')
const g = require(process.env.PWD + '/model/Guest')
const r = require(process.env.PWD + '/model/Reschedule')
const mi = require(process.env.PWD + '/model/MenuItem')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', f.myInternalEvents, function(req, res, next) {
  res.render('reschedule/reschedule',{
    sess: req.session,
    myInternalEvents:req.myInternalEvents
  })
}).post('/create', r.convSerializedToObj, r.checkAvailability, r.searchEventByCode, r.guestOfEvent, r.productOfEvent, function(req, res, next) {
  console.log('________BODY')
  console.log(req.body)
  console.log('________BODY')
  // console.log('____EVENT SEARCHED')
  // console.log(req.findEventByCode)
  // console.log('____EVENT SEARCHED')
  // console.log('____GUEST SEARCHED')
  // console.log(req.guests)
  // console.log('____GUEST SEARCHED')
  // console.log('____PRODUTO SEARCHED')
  // console.log(req.products)
  // console.log('____PRODUTO SEARCHED')

  res.json(
    {"nome":"felipe"}
  )
})

module.exports = router;
