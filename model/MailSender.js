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

  this.emailRecoverPassword = function(newPassword, userEmail, matricula) {
    fs.readFile(process.env.PWD + '/views/email/emailRecoverPassword.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            let qs = '?m=' + matricula + '&p=' + newPassword + '&recoveremail=true'
            $("#linkchangepassword").attr("href", "http://localhost:3000/change-password" + qs)
            console.log($('body').html());
            let mailOptions = {};
            mailOptions.from = '"British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
            mailOptions.to = userEmail
            mailOptions.subject = 'System Recover Password'
            mailOptions.text = 'Recover Password'
            mailOptions.html = $('body').html()

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
            });
          });
      }
    })
  }

  this.finishEvent = function(eventFinded){

    let listRecipientsEmail = this.generateListEmail(eventFinded)

    fs.readFile(process.env.PWD + '/views/email/finishEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            $('#EventCode').text(eventFinded.EventCode)
            $('#EventName').text(Util.toTitleCase(eventFinded.title))
            $('#StatusName').text(eventFinded.StatusName)
            if (eventFinded.Type === 'I') {
              $('#TypeEvent').text('Internal')
            }else {
              $('#TypeEvent').text('External')
            }
            $('#CreatedBy').text(Util.toTitleCase(eventFinded.CreatedByName))
            $('#ResponsibleBy').text(Util.toTitleCase(eventFinded.ResponsibleByName))
            $('#StartEvent').text(moment(eventFinded.start).format('DD/MM/YYYY HH:mm'))
            $('#EndEvent').text(moment(eventFinded.end).format('DD/MM/YYYY HH:mm'))
            $('#Departament').text(Util.toTitleCase(eventFinded.nomedepartamento) || 'Not Reported')
            if(eventFinded.conta){
              $('#Budget').text(eventFinded.setor + ' ' + eventFinded.grupo + ' ' + eventFinded.conta)
            }else{
              $('#Budget').text('Not Reported')
            }
            $('#AdditionalInformation').text(eventFinded.AdditionalInformation || 'Not Reported')

            if(eventFinded.products.length === 0){
              $('#tableProducts').append('<tr><td style="text-align:center;" colspan="4">Don\'t have products.</td></tr>')
            }else{
              eventFinded.products.map(function(e){
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.UsedAmount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Amount +'</td>'+
                                          '</tr>')
              })
            }


            let subjectConcat = 'Event ' + eventFinded.EventCode + ' - ' + eventFinded.StatusName

            let mailOptions = {};
            mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System - Finish Event" <noreply@britishschool.g12.br>'
            mailOptions.to = listRecipientsEmail
            mailOptions.subject = subjectConcat
            mailOptions.text = 'Finish Event'
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

  this.approveEvent = function(eventFinded){

    (eventFinded.Type === 'I') ? this.internalEvent(eventFinded) : this.externalEvent(eventFinded)
  }

  this.cancelEvent = function(eventFinded){
    (eventFinded.Type === 'I') ? this.internalEvent(eventFinded) : this.externalEvent(eventFinded)
  }

  this.generateListEmail = function(eventFinded){
    let filteredList = []
    filteredList.push(eventFinded.EmailCreateBy)
    filteredList.push(eventFinded.EmailResponsibleBy)
    filteredList.push('adm_ict@britishschool.g12.br')
    eventFinded.RecipientsEmail.map(function(e){
      filteredList.push(e.email)
    })
    return filteredList
  }

  this.internalEvent = function(eventFinded){

    console.log('cancelando____');
    console.log(eventFinded);
    console.log('cancelando____213');

    let listRecipientsEmail = this.generateListEmail(eventFinded)

    console.log(listRecipientsEmail);
    console.log('cancelando____213');
    console.log(eventFinded);
    console.log('cancelando____');

    fs.readFile(process.env.PWD + '/views/email/internalEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            // let qs = '?m=' + matricula + '&p=' + newPassword + '&recoveremail=true'
            $('#EventCode').text(eventFinded.EventCode)
            $('#EventName').text(Util.toTitleCase(eventFinded.title))
            $('#RoomName').text(Util.toTitleCase(eventFinded.RoomName))
            $('#StatusName').text(eventFinded.StatusName)
            $('#CreatedBy').text(Util.toTitleCase(eventFinded.CreatedByName))
            $('#ResponsibleBy').text(Util.toTitleCase(eventFinded.ResponsibleByName))
            $('#StartEvent').text(moment(eventFinded.start).format('DD/MM/YYYY HH:mm'))
            $('#EndEvent').text(moment(eventFinded.end).format('DD/MM/YYYY HH:mm'))
            $('#Departament').text(Util.toTitleCase(eventFinded.nomedepartamento) || 'Not Reported')
            if(eventFinded.conta){
              $('#Budget').text(eventFinded.setor + ' ' + eventFinded.grupo + ' ' + eventFinded.conta)
            }else{
              $('#Budget').text('Not Reported')
            }
            $('#Nparent').text(eventFinded.Nparent || 'Not Reported')
            $('#Npupil').text(eventFinded.Npupil || 'Not Reported')
            $('#Nstaff').text(eventFinded.Nstaff || 'Not Reported')
            $('#Nvisitor').text(eventFinded.Nvisitor || 'Not Reported')
            $('#NeedComputer').text(eventFinded.NeedComputer || 'Not Reported')
            $('#NeedDataShow').text(eventFinded.NeedDataShow || 'Not Reported')
            if(eventFinded.VideoFrom){
              $('#VideoConference').text(eventFinded.VideoFrom + ' to ' + eventFinded.VideoTo)
            }else{
              $('#VideoConference').text('Not Reported')
            }
            $('#AdditionalInformation').text(eventFinded.AdditionalInformation || 'Not Reported')

            if(eventFinded.products.length === 0){
              $('#tableProducts').append('<tr><td style="text-align:center;" colspan="4">Don\'t have products.</td></tr>')
            }else{
              let totalProduct = 0
              eventFinded.products.map(function(e){
                totalProduct += (e.Amount * e.Price * 1.14)
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Amount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Price +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ (e.Amount * e.Price * 1.14).toFixed(2) +'</td>'+
                                          '</tr>')
              })
              $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                          '<td colspan="4" style="border:1px solid black;text-align:right;">'+ totalProduct.toFixed(2) +'</td>'+
                                        '</tr>')
            }

            if(eventFinded.guests.length === 0){
              $('#tableGuests').append('<tr><td style="text-align:center;" colspan="2">Don\'t have guests.</td></tr>')
            }else{
              eventFinded.guests.map(function(e){
                $('#tableGuests').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="width:20%;border:1px solid black;padding-left:3px;">'+ Util.toTitleCase(e.Type) +'</td>'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ Util.toTitleCase(e.NameGuest)   +'</td>'+
                                          '</tr>')
              })
            }

            console.log('vou mandar emailll !');
            let subjectConcat = 'Event ' + eventFinded.EventCode + ' - ' + eventFinded.StatusName + ' - Created by ' + Util.toTitleCase(eventFinded.CreatedByName) + ' - Responsible by ' + Util.toTitleCase(eventFinded.ResponsibleByName)
            let mailOptions = {}
            mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System" <noreply@britishschool.g12.br>'
            mailOptions.to = listRecipientsEmail
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

  this.externalEvent = function(eventFinded){

    let listRecipientsEmail = this.generateListEmail(eventFinded)

    console.log('_________PARAAA EMAIL EXTERNO')
    console.log(listRecipientsEmail)
    console.log('_________PARAAA EMAIL EXTERNO')
    console.log(eventFinded.RecipientsEmail)
    console.log('_________PARAAA EMAIL EXTERNO')


    fs.readFile(process.env.PWD + '/views/email/externalEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            // let qs = '?m=' + matricula + '&p=' + newPassword + '&recoveremail=true'
            $('#EventCode').text(eventFinded.EventCode)
            $('#EventName').text(Util.toTitleCase(eventFinded.title))
            $('#StatusName').text(eventFinded.StatusName)
            $('#CreatedBy').text(Util.toTitleCase(eventFinded.CreatedByName))
            $('#ResponsibleBy').text(Util.toTitleCase(eventFinded.ResponsibleByName))
            $('#StartEvent').text(moment(eventFinded.start).format('DD/MM/YYYY HH:mm'))
            $('#LeavingFromEvent').text(moment(eventFinded.LeavingFromEvent).format('DD/MM/YYYY HH:mm'))
            $('#EndEvent').text(moment(eventFinded.end).format('DD/MM/YYYY HH:mm'))
            $('#Departament').text(Util.toTitleCase(eventFinded.nomedepartamento) || 'Not Reported')
            if(eventFinded.conta){
              $('#Budget').text(eventFinded.setor + ' ' + eventFinded.grupo + ' ' + eventFinded.conta)
            }else{
              $('#Budget').text('Not Reported')
            }
            $('#Nparent').text(eventFinded.Nparent || 'Not Reported')
            $('#Npupil').text(eventFinded.Npupil || 'Not Reported')
            $('#Nstaff').text(eventFinded.Nstaff || 'Not Reported')
            $('#Nvisitor').text(eventFinded.Nvisitor || 'Not Reported')
            $('#LocationName').text(eventFinded.LocationEvent || 'Not Reported')
            $('#DepartureLocation').text(eventFinded.DepartureFrom || 'Not Reported')
            $('#NPassenger').text(eventFinded.AmountPerson || 'Not Reported')
            if(eventFinded.MeansOfTransport){
              $('#MeansOfTransport').text(eventFinded.TypeVehicleEnglish + '/' + eventFinded.TypeVehiclePort + ' (' + eventFinded.AmountSeat + ' Seats)')
            }else{
              $('#MeansOfTransport').text('Not Reported')
            }
            $('#WaitAvenue').text(eventFinded.TransportWaitAvenue || 'Not Reported')
            $('#AdditionalInformation').text(eventFinded.AdditionalInformation || 'Not Reported')

            if(eventFinded.products.length === 0){
              $('#tableProducts').append('<tr><td style="text-align:center;" colspan="4">Don\'t have products.</td></tr>')
            }else{
              let totalProduct = 0
              eventFinded.products.map(function(e){
                totalProduct += (e.Amount * e.Price * 1.14)
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Amount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Price +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ (e.Amount * e.Price * 1.14).toFixed(2) +'</td>'+
                                          '</tr>')
              })
              $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                          '<td colspan="4" style="border:1px solid black;text-align:right;">'+ totalProduct.toFixed(2) +'</td>'+
                                        '</tr>')
            }

            if(eventFinded.guests.length === 0){
              $('#tableGuests').append('<tr><td style="text-align:center;" colspan="2">Don\'t have guests.</td></tr>')
            }else{
              eventFinded.guests.map(function(e){
                $('#tableGuests').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="width:20%;border:1px solid black;padding-left:3px;">'+ Util.toTitleCase(e.Type) +'</td>'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ Util.toTitleCase(e.NameGuest)   +'</td>'+
                                          '</tr>')
              })
            }

            // console.log(eventFinded)
            console.log('vou mandar emailll !');
            let subjectConcat = 'Event ' + eventFinded.EventCode + ' - ' + eventFinded.StatusName + ' - Created by ' + Util.toTitleCase(eventFinded.CreatedByName) + ' - Responsible by ' + Util.toTitleCase(eventFinded.ResponsibleByName)
            let mailOptions = {}
            mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System" <noreply@britishschool.g12.br>'
            mailOptions.to = listRecipientsEmail
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
    mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System - Recover Password" <noreply@britishschool.g12.br>'
    mailOptions.to = listRecipientsEmail
    mailOptions.subject = 'felipe muner teste'
    mailOptions.text = 'Recover Password'
    mailOptions.html = '<b>erro event</b>'

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    })
  }
}

module.exports = new MailSender()
