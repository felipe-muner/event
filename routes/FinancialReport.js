const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fe = require(process.env.PWD + '/model/FinishEvent')
const myevent = require(process.env.PWD + '/model/MyEvent')
const m = require(process.env.PWD + '/model/MailSender')
const f = require(process.env.PWD + '/model/Find')
const fr = require(process.env.PWD + '/model/FinancialReport')
const g = require(process.env.PWD + '/model/Guest')
const mi = require(process.env.PWD + '/model/MenuItem')
const l = require(process.env.PWD + '/model/Login')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', l.getAllBudgets, function(req, res, next) {
  res.render('financial-report/financial-report',{
    sess: req.session,
    allBudgets: req.allBudgets
  })
}).post('/generate-report', fr.getDistinctBudget, fr.appendEventToBudget, fr.appendProductToEvent, function(req,res,next){
  // console.log('entrei')
  // console.log(req.body)
  // console.log('hhahahahaha')
  // console.log('hhahahahaha')
  // console.log('hhahahahaha')
  // console.log('hhahahahaha')
  // console.log('hhahahahaha')

  m.financialReport(req)
  res.json(req.body)
})

module.exports = router;
