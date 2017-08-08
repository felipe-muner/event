const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const mi = require(process.env.PWD + '/model/MenuItem')
const d = require(process.env.PWD + '/model/Departament')
const f = require(process.env.PWD + '/model/Find')
const ee = require(process.env.PWD + '/model/ExternalEvent')
const a = require(process.env.PWD + '/model/Approve')
const ie = require(process.env.PWD + '/model/InternalEvent')
const t = require(process.env.PWD + '/model/Transport')
const m = require(process.env.PWD + '/model/MailSender')
const g = require(process.env.PWD + '/model/Guest')
const u = require(process.env.PWD + '/model/User')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', mi.getAllProductActive, t.all, d.all, u.allActive, f.myEvents, function(req, res, next) {
  console.log('entrei evento routa externo');
  console.log(req.myEvents)
  console.log('_________LOG');
  res.render('external-event/external-event',{
    sess:req.session,
    allProductActive: req.allProductActive,
    allDepartament:req.allDepartament,
    meansOfTransport:req.allMeansOfTransport,
    allActiveUser:req.allActiveUser,
    myEvents:req.myEvents
  })
}).post('/search-events', ee.searchEventTwoDate, function(req, res, next) {
  console.log(req.allEvents);

  req.allEvents.map(e => e.title = Util.toTitleCase(e.title))
  req.allEvents.map(e => e.CreatedByName = Util.toTitleCase(e.CreatedByName))
  req.allEvents.map(e => e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName) || 'Not Reported')
  req.allEvents.map(e => e.start = moment(e.start).format('DD/MM/YYYY HH:mm'))
  req.allEvents.map(e => e.end = moment(e.end).format('DD/MM/YYYY HH:mm'))

  res.json(req.allEvents)
}).post('/create-event', a.getDirectApproval,ee.getLastEvent, ee.createEvent, g.bulkGuestEvent, mi.bulkItemEvent, f.searchEventByCode, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {
  m.externalEvent(req.findEventByCode)
  res.json(req.nextEventCode)
})

module.exports = router;
