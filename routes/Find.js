const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const find = require(process.env.PWD + '/model/Find')
const g = require(process.env.PWD + '/model/Guest')
const mi = require(process.env.PWD + '/model/MenuItem')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', find.getLastHundred, function(req, res, next) {
  req.lastHundredOccurrence.map(e => {
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
  })
  res.render('find/find', {
    sess:req.session,
    dados:'find',
    lastHundredOccurrence: req.lastHundredOccurrence
  })
}).post('/search-event-by-code', find.getLastHundred, find.searchEventByCode, find.getTemplateType, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {
  // console.log(req.findEventByCode)

  req.findEventByCode.Type === 'I' ? req.findEventByCode.Type = 'Internal' : req.findEventByCode.Type = 'External'
  req.findEventByCode.ResponsibleByName = Util.toTitleCase(req.findEventByCode.ResponsibleByName)
  req.findEventByCode.CreatedByName = Util.toTitleCase(req.findEventByCode.CreatedByName)
  req.findEventByCode.start = moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.end = moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.title = Util.toTitleCase(req.findEventByCode.title)

  req.findEventByCode.TotalFinalProd = req.findEventByCode.products.reduce(function(acc,ele){
    console.log(acc);
    return acc + (ele.Amount * ele.Price * 1.14)
  },0)
  req.findEventByCode.TotalFinalProd = req.findEventByCode.TotalFinalProd.toFixed(2)

  req.findEventByCode.products.map((e) => e.TotalProd = (e.TotalProd * 1.14).toFixed(2))

  req.findEventByCode.guests.map(e => {e.Type = Util.toTitleCase(e.Type);e.NameGuest = Util.toTitleCase(e.NameGuest);})

  console.log(req.findEventByCode)

  res.render(req.findEventByCode.typeTemplate, {
    sess:req.session,
    EventFound: req.findEventByCode
  })
})

module.exports = router;
