const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const mi = require(process.env.PWD + '/model/MenuItem')
const d = require(process.env.PWD + '/model/Departament')
const ee = require(process.env.PWD + '/model/ExternalEvent')
const ie = require(process.env.PWD + '/model/InternalEvent')
const t = require(process.env.PWD + '/model/Transport')
const g = require(process.env.PWD + '/model/Guest')
const u = require(process.env.PWD + '/model/User')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', mi.getAllProductActive, t.all, d.all, u.allActive, function(req, res, next) {
  console.log('entrei evento routa externo');
  res.render('external-event/external-event',{
    sess:req.session,
    allProductActive: req.allProductActive,
    allDepartament:req.allDepartament,
    meansOfTransport:req.allMeansOfTransport,
    allActiveUser:req.allActiveUser
  })
}).post('/search-events', ee.searchEventTwoDate, function(req, res, next) {
  console.log(req.allEvents);

  req.allEvents.map(e => e.title = Util.toTitleCase(e.title))
  req.allEvents.map(e => e.CreatedByName = Util.toTitleCase(e.CreatedByName))
  req.allEvents.map(e => e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName) || 'Not Reported')
  req.allEvents.map(e => e.start = moment(e.start).format('DD/MM/YYYY HH:mm'))
  req.allEvents.map(e => e.end = moment(e.end).format('DD/MM/YYYY HH:mm'))

  res.json(req.allEvents)
}).post('/create-event',ee.getLastEvent, ee.createEvent, g.bulkGuestEvent, mi.bulkItemEvent, function(req, res, next) {
  res.json(req.body)
})

module.exports = router;
