const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const connPurchasing = require(process.env.PWD + '/conn-purchasing');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const ie = require(process.env.PWD + '/model/InternalEvent')
const mi = require(process.env.PWD + '/model/MenuItem')
const d = require(process.env.PWD + '/model/Departament')
const f = require(process.env.PWD + '/model/Find')
const g = require(process.env.PWD + '/model/Guest')
const u = require(process.env.PWD + '/model/User')
const m = require(process.env.PWD + '/model/MailSender')
const HtmlPDF = require(process.env.PWD + '/model/HtmlPDF')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', ie.getAllSiteBuildingRoom, mi.getAllProductActive, d.all, u.allActive, f.myEvents, function(req, res, next) {
  // console.log(req.allDepartament)
  // console.log(req.allActiveUser)
  // console.log(req.myEvents)
  console.log('felipe entrei ------')

  req.myEvents.map((e)=>{
    e.title = Util.toTitleCase(e.title)
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    return e
  })

  res.render('internal-event/internal-event',{
    sess:req.session,
    getAllSiteBuildingRoom: req.getAllSiteBuildingRoom,
    allProductActive: req.allProductActive,
    allDepartament:req.allDepartament,
    allActiveUser:req.allActiveUser,
    myEvents:req.myEvents
  })
}).post('/search-events', ie.searchEventTwoDate, function(req, res, next) {
  //console.log(req.allEvents);
  res.json(req.allEvents)
}).post('/create-event',ie.getLastEvent, ie.createEvent, g.bulkGuestEvent, mi.bulkItemEvent, f.searchEventByCode, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {
  console.log('_______________')
  console.log(req.findEventByCode)
  console.log('_______________')
  
  m.testeMuner(req.findEventByCode)
  res.json(req.nextEventCode)
}).post('/find-event-by-code',ie.searchEventByCode, ie.getTemplateMoreInfo, g.guestOfEvent, mi.productOfEvent, function(req,res,next){
  req.findEventByCode.start = moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.end = moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.guests.map((e) => e.Type = Util.toTitleCase(e.Type))
  req.findEventByCode.guests.map((e) => e.NameGuest = Util.toTitleCase(e.NameGuest))
  req.findEventByCode.TotalGeralProduct = req.findEventByCode.products.reduce((acc,ele) => acc + (ele.Price * ele.Amount),0)
  req.findEventByCode.TotalGeralProduct = (req.findEventByCode.TotalGeralProduct * 1.14).toFixed(2)
  res.json(req.findEventByCode)
}).get('/downloadPDF', ie.searchEventByCode, g.guestOfEvent, mi.productOfEvent, HtmlPDF.genPDF)

module.exports = router;
