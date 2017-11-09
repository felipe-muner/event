const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fe = require(process.env.PWD + '/model/FinishEvent')
const mi = require(process.env.PWD + '/model/MenuItem')
const m = require(process.env.PWD + '/model/MailSender')
const u = require(process.env.PWD + '/model/User')
const f = require(process.env.PWD + '/model/Find')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', fe.getAllFinishEvent, u.allActive, function(req, res, next) {
  let flashMsg = req.session.flashMsg
  if(flashMsg) delete req.session.flashMsg
  req.allEventToFinish.map(e => {
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
  })
  res.render('finish-event/finish-event',{
    sess:req.session,
    allEventToFinish:req.allEventToFinish,
    allActiveUser:req.allActiveUser,
    flashMsg
  })
}).post('/searchFiltered', fe.getAllFinishEvent, function(req, res, next) {
  let filters = req.body

  if(filters.ResponsibleOrCreator) filters.ResponsibleOrCreator = Util.stringParseArray(filters.ResponsibleOrCreator).map(e => parseInt(e))
  if(filters.Status) filters.Status = Util.stringParseArray(filters.Status).map(e => parseInt(e))
  if(filters.Location) filters.Location = Util.stringParseArray(filters.Location).map(e => e.toUpperCase())

  if(filters.EventCode) req.allEventToFinish = req.allEventToFinish.filter(e => e.EventCode === parseInt(filters.EventCode))
  if((filters.Type === 'I') || (filters.Type === 'E')) req.allEventToFinish = req.allEventToFinish.filter(e => e.Type === filters.Type)
  if(filters.EventName) req.allEventToFinish = req.allEventToFinish.filter(e => e.title.toUpperCase().includes(filters.EventName.toUpperCase()))
  if(filters.ResponsibleOrCreator) req.allEventToFinish = req.allEventToFinish.filter(e => filters.ResponsibleOrCreator.includes(e.CreateBy) || filters.ResponsibleOrCreator.includes(e.ResponsibleByEvent))

  req.allEventToFinish = req.allEventToFinish.filter(e => filters.Status.includes(e.EventStatus_ID))
                             .filter(e =>
                               'I' === e.Type && filters.Location.includes(e.unidade.toUpperCase()) ||
                               'E' === e.Type && filters.Location.includes(e.DepartureFrom.toUpperCase())
                             )

  req.allEventToFinish.map(e => {
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
  })

  res.json(req.allEventToFinish)
}).post('/write-down-page', fe.productOfEvent, function(req,res,next){
  res.render('finish-event/write-down-page',{
    sess:req.session,
    camposAproveitados:req.body,
    products: req.products
  })
}).post('/close-event', fe.updateItemsFinishEvent, fe.updateStatusEvent, f.searchEventByCode, mi.productOfEvent, f.getRecipientsEmail, function(req,res,next){
  req.session.flashMsg = {
    type: 'alert-success',
    statusName: 'Finalized',
    text: req.body.EventCode
  }
  req.findEventByCode.msgDefault = 'Finalizado por: ' + req.findEventByCode.FinishedByMatricula_ID
  m.finishEvent(req.findEventByCode)
  console.log(req.body)
  res.redirect('/finish-event')
})

module.exports = router;
