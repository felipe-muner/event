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
  console.log(req.session);
  let flashMsg = req.session.flashMsg
  if(flashMsg) delete req.session.flashMsg
  res.render('menu-item/menu-item',{
      units: req.allUnit,
      allProduct: req.allProduct,
      sess:req.session,
      flashMsg
  })
}).post('/', MenuItem.addProduct, MenuItem.getAllUnit, function(req, res, next) {
  req.session.flashMsg = {}
  req.session.flashMsg.txtMsg = 'Created successfully. Criado com sucesso.'
  req.session.flashMsg.styleMsg = 'alert-success'
  res.redirect('/menu-item')
}).get('/edit/:EventProductID', MenuItem.getAllUnit, MenuItem.findById, function(req, res, next) {
  console.log(req.findById);
  res.render('menu-item/edit-item',{
      units: req.allUnit,
      findById: req.findById,
      sess:req.session
  })
}).post('/edit', MenuItem.updateItem,function(req, res, next) {
  req.session.flashMsg = {}
  req.session.flashMsg.txtMsg = 'Product Updated!'
  req.session.flashMsg.styleMsg = 'alert-warning'
  res.redirect('/menu-item')
}).get('/change-active/:EventProductID/:Active', MenuItem.changeActive, function(req, res, next) {
  req.session.flashMsg = {}
  req.session.flashMsg.txtMsg = (parseInt(req.params.Active) === 1) ? 'Product Disabled!' : 'Product Able!'
  req.session.flashMsg.styleMsg = 'alert-warning'
  res.redirect('/menu-item')
});

router.get('/product-unit', function(req, res, next) {
  console.log('product-unit');
  res.render('menu-item/product-unit',{dados:'menu item',sess:req.session})
});

module.exports = router;
