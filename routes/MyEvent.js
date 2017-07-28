const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fe = require(process.env.PWD + '/model/FinishEvent')
const myevent = require(process.env.PWD + '/model/MyEvent')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', myevent.getMyEvent, function(req, res, next) {
  let flashMsg = req.session.flashMsg
  if(flashMsg) delete req.session.flashMsg

  req.allMyEvent.map(e => {
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
    e.btnCancel = (1 === e.EventStatus_ID || 2 === e.EventStatus_ID) ? true : false
  })

  // console.log(req.allMyEvent)

  res.render('my-event/my-event',{
    allMyEvent: req.allMyEvent,
    sess: req.session
  })
})

module.exports = router;
