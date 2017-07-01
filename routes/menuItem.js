const express = require('express');
const router = express.Router();
const conn = require(process.env.PWD + '/conn');
const Util = require(process.env.PWD + '/util/Util')
const mailSender = require(process.env.PWD + '/util/MailSender')
const MenuItem = require(process.env.PWD + '/model/MenuItem')
const fs = require('fs');
const moment = require('moment');
const md5 = require('md5');
const pdf = require('html-pdf');
const A4option = require(process.env.PWD + '/views/report/A4config')

router.get('/', MenuItem.getAllProduct, MenuItem.getAllUnit ,function(req, res, next) {
  let msgAlert = req.session.msgAlert
  if(msgAlert){
    delete req.session.msgAlert
  }
  res.render('menu-item/menu-item',
    {
      units: req.allUnit,
      allProduct: req.allProduct,
      sess:req.session,
      msgAlert
    }
  )
}).post('/', MenuItem.addProduct, MenuItem.getAllUnit, function(req, res, next) {
  req.session.msgAlert = 'Created successfully. Criado com sucesso.'
  res.redirect('/menu-item')
}).put('/edit-product', function(req, res, next) {
  res.send('vou editar')
}).delete('/', function(req, res, next) {
});



router.get('/product-unit', function(req, res, next) {
  console.log('product-unit');
  res.render('menu-item/product-unit',{dados:'menu item',sess:req.session})
});

module.exports = router;
