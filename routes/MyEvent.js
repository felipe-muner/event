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
const mi = require(process.env.PWD + '/model/MenuItem')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', myevent.getMyEvent, function(req, res, next) {
  let flashMsg = req.session.flashMsg
  if(flashMsg) delete req.session.flashMsg

  req.allMyEvent.map(e => {
    e.DataStartOriginal = e.start
    e.pdf = ('I' === e.Type) ? '<a class="no-loading" href="/internal-event/downloadPDF?EventCode='+ e.EventCode +'" target="_blank"><i class="fa fa-file-pdf-o" data-container="body" title="PDF" data-toggle="tooltip" aria-hidden="true"></i></a>' : '<a class="no-loading" href="/external-event/downloadPDF?EventCode='+ e.EventCode +'" target="_blank"><i class="fa fa-file-pdf-o" data-container="body" title="PDF" data-toggle="tooltip" aria-hidden="true"></i></a>'
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
    e.btnCancel = (moment().isBefore(e.DataStartOriginal) && (1 === e.EventStatus_ID || 2 === e.EventStatus_ID)) ? true : false
    // e.canEdit = (moment().isBefore(e.DataStartOriginal) && 1 === e.EventStatus_ID) ? true : false
    e.canEdit = (moment().isBefore(e.DataStartOriginal) && (1 === e.EventStatus_ID || 2 === e.EventStatus_ID)) ? true : false
  })

  console.log(req.allMyEvent)

  res.render('my-event/my-event',{
    allMyEvent: req.allMyEvent,
    sess: req.session,
    flashMsg
  })
}).post('/cancel-event', myevent.cancelEvent, f.searchEventByCode, g.guestOfEvent, mi.productOfEvent, f.getRecipientsEmail, function(req, res, next) {
  req.findEventByCode.msgDefault = 'Evento Cancelado por ' + req.findEventByCode.CanceledByMatricula_ID
  m.cancelEvent(req.findEventByCode)
  req.session.flashMsg = req.body.EventCode
  res.redirect('/my-event')
})

module.exports = router;
