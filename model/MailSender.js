const nodemailer = require('nodemailer')
const conn = require(process.env.PWD + '/conn')
const fs = require('fs')
const Styliner = require('styliner')
const cheerio = require('cheerio')
const Util = require(process.env.PWD + '/util/Util.js')
const moment = require('moment')
var styliner = new Styliner(__dirname)

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
})

function MailSender(){
  this.createEvent = function(req, res, next){
    let mailOptions = {};
    mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = 'fmuner@britishschool.g12.br'
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>create event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
    next()
  }

  this.finishEvent = function(req, res, next){
    let mailOptions = {};
    mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = 'fmuner@britishschool.g12.br'
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>finish event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
    next()
  }

  this.approveEvent = function(req, res, next){
    let mailOptions = {};
    mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = 'fmuner@britishschool.g12.br'
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>approve event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
    next()
  }

  this.cancelEvent = function(req, res, next){
    let mailOptions = {};
    mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = 'fmuner@britishschool.g12.br'
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>cancel event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
    next()
  }

  this.testeMuner = function(eventFinded){
    fs.readFile(process.env.PWD + '/views/email/internalEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            // let qs = '?m=' + matricula + '&p=' + newPassword + '&recoveremail=true'
            $('#EventCode').text(eventFinded.EventCode)
            $('#EventName').text(eventFinded.title)
            $('#StatusName').text(eventFinded.StatusName)
            $('#CreatedBy').text(eventFinded.CreatedByName)
            $('#ResponsibleBy').text(eventFinded.ResponsibleByName)
            $('#StartEvent').text(moment(eventFinded.start).format('DD/MM/YYYY HH:mm'))
            $('#EndEvent').text(moment(eventFinded.end).format('DD/MM/YYYY HH:mm'))
            $('#Departament').text(eventFinded.Departament_ID)
            $('#Budget').text(eventFinded.setor + ' ' + eventFinded.grupo + ' ' + eventFinded.conta)
            $('#Nparent').text(eventFinded.Nparent)
            $('#Npupil').text(eventFinded.Npupil)
            $('#Nstaff').text(eventFinded.Nstaff)
            $('#Nvisitor').text(eventFinded.Nvisitor)
            $('#NeedComputer').text(eventFinded.NeedComputer)
            $('#NeedDataShow').text(eventFinded.NeedDataShow)
            $('#VideoConference').text(eventFinded.VideoFrom + ' to: ' + eventFinded.VideoTo)

            if(eventFinded.products.length === 0){
              $('#tableProducts').append('<tr><td style="text-align:center;" colspan="2">Don\'t have products.</td></tr>')
            }else{
               eventFinded.products.map(function(e){
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td class="olar">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="text-align:right;">'+ e.Amount +'</td>'+
                                            '<td style="text-align:right;">'+ e.Price +'</td>'+
                                            '<td style="text-align:right;">'+ (e.Amount * e.Price * 1.14).toFixed(2) +'</td>'+
                                          '</tr>')
              })
            }

            // if(eventFinded.guests.length === 0){
            //   $('#tableGuests').append('<tr><td style="text-align:center;" colspan="2">Don\'t have guests.</td></tr>')
            // }else{
              // let guests = req.findEventByCode.guests.reduce(function(acc,ele){
              //   acc.tabelaGuest = acc.tabelaGuest + '<tr style="line-height: 15px;">'+
              //                                       '<td style="border:1px solid black;">'+ ele.Type +' </td>'+
              //                                       '<td style="border:1px solid black;">'+ ele.NameGuest +'</td>'+
              //                                     '</tr>'
              //   return acc
              // },{tabelaGuest:''})
              //
              // if(req.findEventByCode.guests.length > 0){
              //   $('#bodyGuests').html(guests.tabelaGuest)
              // }else{
              //   $('#bodyGuests').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have guests</td></tr>')
              // }
            //   $('#tableGuests').append('<tr><td colspan="2">tem guest</td></tr>')
            // }

            console.log(eventFinded)
            console.log('vou mandar emailll !');

            let subjectConcat = 'Event ' + eventFinded.EventCode + ' - ' + eventFinded.StatusName + ' - Created by ' + Util.toTitleCase(eventFinded.CreatedByName) + ' - Responsible by ' + Util.toTitleCase(eventFinded.ResponsibleByName)
            let mailOptions = {}
            mailOptions.from = '"British School - Event System" <noreply@britishschool.g12.br>'
            mailOptions.to = 'fmuner@britishschool.g12.br'
            mailOptions.subject = subjectConcat
            mailOptions.text = 'Recover Password'
            mailOptions.html = $('body').html()

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
            })
          })
      }
    })
  }

  this.errorEvent = function(req, res, next){
    let mailOptions = {};
    mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = 'fmuner@britishschool.g12.br'
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>create event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
  }
}

module.exports = new MailSender()
