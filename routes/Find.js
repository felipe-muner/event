const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const find = require(process.env.PWD + '/model/Find')
const g = require(process.env.PWD + '/model/Guest')
const ie = require(process.env.PWD + '/model/InternalEvent')
const mi = require(process.env.PWD + '/model/MenuItem')
const m = require(process.env.PWD + '/model/MailSender')
const u = require(process.env.PWD + '/model/User')
const t = require(process.env.PWD + '/model/Transport')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', find.getLastHundred, u.allActive, ie.getAllSiteBuildingRoom,function(req, res, next) {
  req.lastHundredOccurrence.map(e => {
    console.log(e)
    console.log('------')
    if( e.Type === 'I'){
      e.Type = 'Internal'
      e.TypeFormatado = 'Internal('+ Util.toTitleCase(e.unidade) +')'
    }else{
      e.Type = 'External'
      e.TypeFormatado = 'External('+e.DepartureFrom+')'
    }
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.startFormated = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.endFormated = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
    e.ProductFormated = (!!e.HasItem) ? 'Yes' + '('+e.QtdItem+')' : 'No' + '('+e.QtdItem+')'

    console.log(e)
    console.log('------')
  })
  res.render('find/find', {
    sess:req.session,
    allActiveUser:req.allActiveUser,
    getAllSiteBuildingRoom: req.getAllSiteBuildingRoom,
    lastHundredOccurrence: req.lastHundredOccurrence
  })
}).post('/search-event-by-code', find.searchEventByCode, find.getTemplateType, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {

  req.findEventByCode.Type === 'I' ? req.findEventByCode.Type = 'Internal' : req.findEventByCode.Type = 'External'
  req.findEventByCode.ResponsibleByName = Util.toTitleCase(req.findEventByCode.ResponsibleByName)
  req.findEventByCode.CreatedByName = Util.toTitleCase(req.findEventByCode.CreatedByName)
  req.findEventByCode.title = Util.toTitleCase(req.findEventByCode.title)
  req.findEventByCode.LocationEvent = Util.toTitleCase(req.findEventByCode.LocationEvent)

  req.findEventByCode.start = moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.end = moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm')
  req.findEventByCode.LeavingFromEvent = moment(req.findEventByCode.LeavingFromEvent).format('DD/MM/YYYY HH:mm')

  req.findEventByCode.TotalFinalProd = req.findEventByCode.products.reduce((acc,ele)=> acc + (ele.Amount * ele.Price),0)
  req.findEventByCode.TotalFinalProd = req.findEventByCode.TotalFinalProd.toFixed(2)

  req.findEventByCode.products.map((e) => e.TotalProd = (e.TotalProd).toFixed(2))

  req.findEventByCode.guests.map(e => {
    e.Type = Util.toTitleCase(e.Type)
    e.NameGuest = Util.toTitleCase(e.NameGuest)
  })

  res.render(req.findEventByCode.typeTemplate, {
    sess: req.session,
    EventFound: req.findEventByCode
  })
}).post('/fillout-form', find.searchEventByCode, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {

  req.findEventByCode.Type === 'I' ? req.findEventByCode.Type = 'Internal' : req.findEventByCode.Type = 'External'
  req.findEventByCode.ResponsibleByName = Util.toTitleCase(req.findEventByCode.ResponsibleByName)
  req.findEventByCode.CreatedByName = Util.toTitleCase(req.findEventByCode.CreatedByName)
  req.findEventByCode.title = Util.toTitleCase(req.findEventByCode.title)
  req.findEventByCode.LocationEvent = Util.toTitleCase(req.findEventByCode.LocationEvent)

  req.findEventByCode.TotalFinalProd = req.findEventByCode.products.reduce((acc,ele)=> acc + (ele.Amount * ele.Price),0)
  req.findEventByCode.TotalFinalProd = req.findEventByCode.TotalFinalProd.toFixed(2)

  req.findEventByCode.products.map((e) => e.TotalProd = (e.TotalProd).toFixed(2))

  req.findEventByCode.guests.map(e => {
    e.Type = Util.toTitleCase(e.Type)
    e.NameGuest = Util.toTitleCase(e.NameGuest)
  })

  res.json({EventFound: req.findEventByCode})
}).post('/searchFiltered', find.makeFind, function(req, res, next) {
  let filters = req.body

  console.log('-----------------BODY-------------------2')
  console.log(req.body)
  console.log('-----------------BODY-------------------2')
  console.log('-----------------FILTERS-------------------2')
  console.log(filters)
  console.log('-----------------FILTERS------------------2-')

  if(filters.ResponsibleOrCreator) filters.ResponsibleOrCreator = Util.stringParseArray(filters.ResponsibleOrCreator).map(e => parseInt(e))
  if(filters.listRoom) filters.listRoom = Util.stringParseArray(filters.listRoom).map(e => parseInt(e))
  if(filters.Status) filters.Status = Util.stringParseArray(filters.Status).map(e => parseInt(e))
  if(filters.Location) filters.Location = Util.stringParseArray(filters.Location).map(e => e.toUpperCase())


  console.log('-----------------BODY-------------------')
  console.log(req.body)
  console.log('-----------------BODY-------------------')
  console.log('-----------------FILTERS-------------------')
  console.log(filters)
  console.log('-----------------FILTERS-------------------')

  if(filters.EventCode){
    req.makeFind = req.makeFind.filter(e => e.EventCode === parseInt(filters.EventCode))
  }else{
    if((filters.Type === 'I') || (filters.Type === 'E')) req.makeFind = req.makeFind.filter(e => e.Type === filters.Type)
    if(filters.EventName) req.makeFind = req.makeFind.filter(e => e.title.toUpperCase().includes(filters.EventName.toUpperCase()))
    if(filters.ResponsibleOrCreator) req.makeFind = req.makeFind.filter(e => filters.ResponsibleOrCreator.includes(e.CreateBy) || filters.ResponsibleOrCreator.includes(e.ResponsibleByEvent))

    req.makeFind = req.makeFind.filter(e => filters.Status.includes(e.EventStatus_ID))
                               .filter(e =>
                                 'I' === e.Type && filters.Location.includes(e.unidade.toUpperCase()) ||
                                 'E' === e.Type && filters.Location.includes(e.DepartureFrom.toUpperCase())
                               )
  }

  // if(filters.Status) req.makeFind = req.makeFind.filter(e =>  filters.Status.includes(e.EventStatus_ID))
  // if(filters.Location) req.makeFind = req.makeFind.filter(e => {
  //   let unit = e.unidade ? filters.Location.includes(e.unidade.toLowerCase()) : null
  //   let departure = e.DepartureFrom ? filters.Location.includes(e.DepartureFrom.toLowerCase()) : null
  //   return unit && departure
  // })
  // if(filters.ResponsibleOrCreator) req.makeFind = req.makeFind.filter(e => e.EventCode === filters.EventCode)
  // if(filters.listRoom) req.makeFind = req.makeFind.filter(e => e.EventCode === filters.EventCode)

  // let arrFiltered = req.makeFind.reduce((acc, el)=>{
  //
  //   // console.log(el)
  //   // console.log(acc)
  //   if(20170247 === el.EventCode || 20170248 === el.EventCode){
  //     acc.push(el)
  //   }
  //   // console.log('reduce');
  //   return acc
  // },[])
  // console.log('filtered');
  // console.log(arrFiltered);
  // console.log('filtered');

  req.makeFind.map(e => {
    if( e.Type === 'I'){
      e.Type = 'Internal'
      e.TypeFormatado = 'Internal('+ Util.toTitleCase(e.unidade) +')'
    }else{
      e.Type = 'External'
      e.TypeFormatado = 'External('+e.DepartureFrom+')'
    }
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.startFormated = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.endFormated = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
    e.ProductFormated = (!!e.HasItem) ? 'Yes' + '('+e.QtdItem+')' : 'No' + '('+e.QtdItem+')'
  })

  res.json(req.makeFind)

}).post('/edit', ie.getAllSiteBuildingRoom, mi.getAllProductActive, u.allActive, t.all, find.searchEventByCode, g.guestOfEvent, mi.productOfEvent, function(req, res, next) {

  (req.findEventByCode.Type === 'I') ? req.findEventByCode.isInternal = true : req.findEventByCode.isExternal = true

  req.findEventByCode.startFormated = req.findEventByCode.start.replace(' ', 'T')
  req.findEventByCode.endFormated =req.findEventByCode.end.replace(' ', 'T')
  if(req.findEventByCode.LeavingFromEvent) req.findEventByCode.LeavingFromEventFormated = req.findEventByCode.LeavingFromEvent.replace(' ', 'T')

  req.findEventByCode.OptionsTransportWaitAvenue = [{"opt":""},{"opt":"No"},{"opt":"Yes"}];
  req.findEventByCode.OptionsNeedComputer = [{"opt":""},{"opt":"No"},{"opt":"Yes"}];
  req.findEventByCode.OptionsNeedDataShow = [{"opt":""},{"opt":"No"},{"opt":"Yes"}];

  req.findEventByCode.OptionsDepartureFrom = [{"opt":""},{"opt":"Botafogo"},{"opt":"Urca"},{"opt":"Barra"}];

  req.findEventByCode.OptionsVideoConferenceFrom = [{"opt":""},{"opt":"ADM"},{"opt":"Botafogo"},{"opt":"Urca"},{"opt":"Barra"}];
  req.findEventByCode.OptionsVideoConferenceTo =   [{"opt":""},{"opt":"ADM"},{"opt":"Botafogo"},{"opt":"Urca"},{"opt":"Barra"},{"opt":"All"}];

  req.findEventByCode.OptionsGuest = [{"opt":"parent"},{"opt":"pupil"},{"opt":"staff"},{"opt":"visitor"}];

  req.findEventByCode.totProd = req.findEventByCode.products.reduce(function(acc, el){
    return acc + el.TotalProd
  },0)

  console.log('aditional information')
  console.log(req.findEventByCode)
  console.log('aditional information')
  res.render('find/edit', {
    sess:req.session,
    getAllSiteBuildingRoom: req.getAllSiteBuildingRoom,
    allProductActive: req.allProductActive,
    allActiveUser:req.allActiveUser,
    meansOfTransport:req.allMeansOfTransport,
    Evento:req.findEventByCode
  })

// }).post('/update', find.clearEvent, find.updateEvent, function(req, res, next) {
}).post('/update', find.checkAlreadyApproved, find.checkEventAvailable, find.clearEvent, find.updateEvent, g.clearGuest, g.bulkGuestEvent, mi.clearProduct, mi.bulkItemEvent, find.searchEventByCode, g.guestOfEvent, mi.productOfEvent, find.getRecipientsEmail, function(req, res, next) {
  console.log(req.resultadofinal)
  console.log(req.body)
  console.log('__+_+_+_+_req.nextEventCode')
  console.log('__+_+_+_+_req.nextEventCode')
  console.log(req.findEventByCode)
  console.log('__+_+_+_+_req.nextEventCode')
  console.log('__+_+_+_+_req.nextEventCode')
  req.findEventByCode.msgDefault = 'Evento editado por ' + req.findEventByCode.CreatedByName
  m.editEvent(req.findEventByCode)
  res.json({
    "right":true,
    "redirect":"/my-event",
    "objeto":req.body
  })
})

module.exports = router;
