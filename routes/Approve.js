const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const approve = require(process.env.PWD + '/model/Approve')
const m = require(process.env.PWD + '/model/MailSender')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', approve.getEventToApprove ,function(req, res, next) {
  let flashMsg = req.session.flashMsg
  if(flashMsg) delete req.session.flashMsg
  req.allEventToApprove.map(e => {
    e.Type === 'I' ? e.Type = 'Internal' : e.Type = 'External'
    e.ResponsibleByName = Util.toTitleCase(e.ResponsibleByName)
    e.CreatedByName = Util.toTitleCase(e.CreatedByName)
    e.start = moment(e.start).format('DD/MM/YYYY HH:mm')
    e.end = moment(e.end).format('DD/MM/YYYY HH:mm')
    e.title = Util.toTitleCase(e.title)
  })
  res.render('approve/approve', {
    sess:req.session,
    allEventToApprove:req.allEventToApprove,
    flashMsg
  })
}).post('/approve-event', approve.evaluateEvents, approve.prepareEmailMain, approve.getListRecipients, approve.prepareEmailProducts, approve.prepareEmailGuests, function(req, res, next) {
  let statusName = (parseInt(req.body.statusToUpdate) === 2) ? 'Approved: ' : 'Cancelled: '
  let events = (Object.prototype.toString.call( req.body.selectedEvent ) === '[object Array]') ? req.body.selectedEvent.join(', ') : req.body.selectedEvent
  req.session.flashMsg = {statusName, events, type: 'alert-info'}

  req.jsonAprove.map(function(e){
    console.log('analisando ojb');
    console.log(e);
    console.log('analisando ojb');
    debugger
    (2 === e.EventStatus_ID) ? e.msgDefault = 'Aprovado por: ' + e.ApprovedBy : e.msgDefault = 'Cancelado por: ' + e.ApprovedBy

    m.approveEvent(e)
  })
  res.redirect('/approve')
})

module.exports = router;
