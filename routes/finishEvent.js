const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fe = require(process.env.PWD + '/model/FinishEvent')
const mi = require(process.env.PWD + '/model/MenuItem')
const m = require(process.env.PWD + '/model/MailSender')
const f = require(process.env.PWD + '/model/Find')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', fe.getAllFinishEvent, function(req, res, next) {
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
    flashMsg
  })
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
  
  m.finishEvent(req.findEventByCode)
  console.log(req.body);
  res.redirect('/finish-event')
})

module.exports = router;
