const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', function(req, res, next) {
  console.log('entrei evento routa interno');
  res.render('create-internal-event/panel-internal-event',{dados:'felipe interno evento',sess:req.session})
});

module.exports = router;
