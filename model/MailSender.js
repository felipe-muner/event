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

  this.financialReport = function(req){
    fs.readFile(process.env.PWD + '/views/email/financialReport.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            // console.log(JSON.stringify(req.getDistinctBudget,null,1))
            let contentHTML = ''


            req.getDistinctBudget.map(function(budget){
              console.log(budget);
              if(0 !== budget.events.length){
                contentHTML += '<table cellspacing="0" style="width:100%;">'
                contentHTML += '<tr style="background-color:#3F51B5;color:white;"><td style="text-align:center;padding:7px;font-weight:bold;" colspan="4">'+ budget.nconta +'</td></tr>'
                budget.events.map(function(evento, indexEvent){
                  contentHTML += '<tr style="background-color:#00BCD4;color:white;"><td style="padding:5px;" colspan="4">'+ evento.EventCode + ' - ' + evento.Name +'</td></tr>'
                  contentHTML += '<tr>'
                    contentHTML += '<td style="width:55%;">Name</td>'
                    contentHTML += '<td style="">Price</td>'
                    contentHTML += '<td style="">Amount Used/Requested</td>'
                    contentHTML += '<td style="">Total</td>'
                  contentHTML += '</tr>'
                  let totEvent = 0;
                  evento.products.map(function(p, indexProduct){
                    totEvent += (p.UsedAmount * p.Price)
                    contentHTML += '<tr>'
                      contentHTML += '<td style="width:55%;">'+ p.ProductNameEnglish + '/' + p.ProductNamePort + ' ('+ p.UnitInEnglish + '/' + p.UnitInPort +')' +'</td>'
                      contentHTML += '<td style="">'+ (p.Price).toFixed(2) +'</td>'
                      contentHTML += '<td style="">'+ p.UsedAmount + '/' + p.Amount +'</td>'
                      contentHTML += '<td style="text-align:right;">'+ (p.UsedAmount * p.Price).toFixed(2) +'</td>'
                    contentHTML += '</tr>'
                  })
                  contentHTML += '<tr>'
                    contentHTML += '<td colspan="4" style="font-weight:bold;text-align:right;background-color:#EEE;">'+ totEvent.toFixed(2) +'</td>'
                  contentHTML += '</tr>'
                })
                contentHTML += '</table>'
                contentHTML += '<br>'
              }
            })

            console.log('----HTML')
            // console.log(contentHTML)
            console.log('----HTML')


            $('#startDateReport').text(moment(req.body.startDate).format('DD/MM/YYYY'))
            $('#endDateReport').text(moment(req.body.endDate).format('DD/MM/YYYY'))

            $('#analitico').html(contentHTML)

            let subjectConcat = 'Financial Report '
            let mailOptions = {};
            mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System - Financial Report" <noreply@britishschool.g12.br>'
            // mailOptions.to = listRecipientsEmail
            mailOptions.to = 'adm_ict@britishschool.g12.br'
            mailOptions.subject = subjectConcat
            mailOptions.text = 'Financial Report'
            // mailOptions.html = $('body').html()
            mailOptions.html = $('body').html()

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
            })

          })
      }
    })
  }

  this.finishEvent = function(eventFinded){

    console.log('______typerota')
    console.log(eventFinded.typeRoute)
    console.log('______typerota')
    let listRecipientsEmail = this.generateListEmail(eventFinded)

    fs.readFile(process.env.PWD + '/views/email/finishEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            $('#infoDefault').text(eventFinded.msgDefault)

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
              let total = 0
              eventFinded.products.map(function(e){
                total += (e.Price * e.UsedAmount)
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Price.toFixed(2) +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.UsedAmount + ' / ' + e.Amount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ (e.Price * e.UsedAmount).toFixed(2) +'</td>'+
                                          '</tr>')
              })
              $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                          '<td colspan="5" style="text-align:right;">'+ total.toFixed(2) +'</td>'+
                                         '</tr>')
            }


            let subjectConcat = 'Event ' + eventFinded.EventCode + ' - ' + eventFinded.StatusName

            let mailOptions = {};
            mailOptions.from = '"- PLEASE DISREGARD -  ---- British School - Event System - Finish Event" <noreply@britishschool.g12.br>'
            // mailOptions.to = listRecipientsEmail
            mailOptions.to = 'adm_ict@britishschool.g12.br'
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

  this.editEvent = function(eventFinded){
    (eventFinded.Type === 'I') ? this.internalEvent(eventFinded) : this.externalEvent(eventFinded)
  }

  this.internalEvent = function(eventFinded){

    console.log('______typerota')
    console.log(eventFinded.typeRoute)
    console.log('______typerota')

    let listRecipientsEmail = this.generateListEmail(eventFinded)
    console.log('___emails')
    console.log(listRecipientsEmail.join('\n'))
    console.log('___emails')

    fs.readFile(process.env.PWD + '/views/email/internalEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            // if ('edit' === eventFinded.typeRoute) {
            //   $('#infoDefault').text('This event was edited.')
            // }else if('approved' === eventFinded.typeRoute){
            //   $('#infoDefault').text('Approved.')
            // }else if('cancel' === eventFinded.typeRoute){
            //   $('#infoDefault').text('Cancel.')
            // }
            $('#infoDefault').text(eventFinded.msgDefault)
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
                totalProduct += (e.Amount * e.Price)
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Amount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Price +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ (e.Amount * e.Price).toFixed(2) +'</td>'+
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
            // mailOptions.to = listRecipientsEmail
            mailOptions.to = 'adm_ict@britishschool.g12.br'
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

    console.log('______typerota')
    console.log(eventFinded.typeRoute)
    console.log('______typerota')

    let listRecipientsEmail = this.generateListEmail(eventFinded)

    console.log('___emails')
    console.log(listRecipientsEmail.join('\n'))
    console.log('___emails')


    fs.readFile(process.env.PWD + '/views/email/externalEvent.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        throw err;
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            // $('#infoDefault')


            $('#infoDefault').text(eventFinded.msgDefault)
            // if ('edit' === eventFinded.typeRoute) {
            //   $('#infoDefault').text('This event was edited.')
            // }else if('approved' === eventFinded.typeRoute){
            //   $('#infoDefault').text('Approved.')
            // }else if('cancel' === eventFinded.typeRoute){
            //   $('#infoDefault').text('Cancel.')
            // }

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
                totalProduct += (e.Amount * e.Price)
                $('#tableProducts').append('<tr style="border-bottom:1px solid black;">'+
                                            '<td style="border:1px solid black;padding-left:3px;">'+ e.ProductNameEnglish + '/' + e.ProductNamePort + ' - ' + e.UnitInEnglish + '/' + e.UnitInPort +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Amount +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ e.Price +'</td>'+
                                            '<td style="border:1px solid black;padding-right:3px;text-align:right;">'+ (e.Amount * e.Price).toFixed(2) +'</td>'+
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
            // mailOptions.to = listRecipientsEmail
            mailOptions.to = 'adm_ict@britishschool.g12.br'
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
    // mailOptions.to = listRecipientsEmail
    mailOptions.to = 'adm_ict@britishschool.g12.br'
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

  this.generateListEmail = function(eventFinded){
    let filteredList = []
    filteredList.push(eventFinded.EmailCreateBy)
    filteredList.push(eventFinded.EmailResponsibleBy)
    filteredList.push('adm_ict@britishschool.g12.br')
    eventFinded.RecipientsEmail.map(function(e){
      filteredList.push(e.email)
    })
    console.log(filteredList.join('\n'))
    return filteredList
  }
}

module.exports = new MailSender()
