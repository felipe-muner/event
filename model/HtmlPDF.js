const conn = require(process.env.PWD + '/conn');
const moment = require('moment')
const cheerio = require('cheerio')
const fs = require('fs')
const Styliner = require('styliner')
const Util = require(process.env.PWD + '/util/Util.js')
var styliner = new Styliner(__dirname);
var pdf = require('html-pdf');
var A4option = require(process.env.PWD + '/views/report/A4config')

function HtmlPDF(){
  this.genPDFInternal = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/internal-event.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err
          callback(err)
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)
            console.log('____event printado')
            console.log(req.findEventByCode)
            console.log('____event printado')

            $('#eventName').text(Util.toTitleCase(req.findEventByCode.title || 'Not Reported'))
            $('#Type').text('Internal')
            $('#eventcode').text(req.findEventByCode.EventCode)
            $('#eventstatus').text(Util.toTitleCase(req.findEventByCode.StatusName || 'Not Reported'))
            $('#createdBy').text(Util.toTitleCase(req.findEventByCode.CreatedByName || 'Not Reported'))
            $('#responsibleBy').text(Util.toTitleCase(req.findEventByCode.ResponsibleByName || 'Not Reported'))
            $('#departamento').text(Util.toTitleCase('departamento buscar'))

            $('#startTime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm'))
            $('#endTime').text(moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))
            // $('#startendtime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm') + '\n' +  moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))

            $('#needDataShow').text(Util.toTitleCase(req.findEventByCode.NeedDataShow || 'Not Reported'))
            $('#needComputer').text(Util.toTitleCase(req.findEventByCode.NeedComputer || 'Not Reported'))
            if (null !== req.findEventByCode.VideoFrom){
              $('#videoConferencia').text('From: ' + req.findEventByCode.VideoFrom + ' To: ' + req.findEventByCode.VideoTo)
            }else {
              $('#videoConferencia').text('Not Reported')
            }

            $('#Nparent').text(req.findEventByCode.Nparent || 'Not Reported')
            $('#Npupil').text(req.findEventByCode.Npupil || 'Not Reported')
            $('#Nstaff').text(req.findEventByCode.Nstaff || 'Not Reported')
            $('#Nvisitor').text(req.findEventByCode.Nvisitor || 'Not Reported')

            $('#AdditionalInformation').text(Util.toTitleCase(req.findEventByCode.AdditionalInformation || 'Not Reported'))

            //prod
            let products = req.findEventByCode.products.reduce(function(acc,ele){
              acc.total = acc.total + (ele.Price * ele.Amount * 1.14)
              acc.tabelaProd = acc.tabelaProd + '<tr style="line-height: 15px;">'+
                                        '  <td style="border:1px solid black;">'+ ele.ProductNameEnglish + '/' + ele.ProductNamePort + '(' + ele.UnitInEnglish + '/' + ele.UnitInPort + ')' + '</td>'+
                                        '  <td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Amount + '</td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Price.toFixed(2) +' </td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ (ele.Price * ele.Amount * 1.14).toFixed(2) +'</td>'+
                                        '</tr>'
              return acc
            },{tabelaProd:'',total:0})

            let footerTableProd = '<tr style="line-height: 15px;"><td colspan="4" style="padding-right:3px;text-align:right;">'+ (products.total).toFixed(2) +'</td></tr>'
            products.tabelaProd = products.tabelaProd + footerTableProd

            if(req.findEventByCode.products.length > 0){
              $('#bodyProducts').html(products.tabelaProd)
            }else{
              $('#bodyProducts').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have products</td></tr>')
            }

            //guest
            console.log(req.findEventByCode.guests)
            console.log('________________________')
            let guests = req.findEventByCode.guests.reduce(function(acc,ele){
              acc.tabelaGuest = acc.tabelaGuest + '<tr style="line-height: 15px;">'+
                                                  '<td style="border:1px solid black;">'+ ele.Type +' </td>'+
                                                  '<td style="border:1px solid black;">'+ ele.NameGuest +'</td>'+
                                                '</tr>'
              return acc
            },{tabelaGuest:''})

            if(req.findEventByCode.guests.length > 0){
              $('#bodyGuests').html(guests.tabelaGuest)
            }else{
              $('#bodyGuests').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have guests</td></tr>')
            }

            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              res.download(pdfFile.filename, new Date() + 'report.pdf')
            })
          })
      }
    })
  }
  this.genPDFExternal = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/external-event.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err
          callback(err)
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            console.log('____event printado')
            console.log(req.findEventByCode)
            console.log('____event printado')

            $('#eventName').text(Util.toTitleCase(req.findEventByCode.title || 'Not Reported'))
            $('#Type').text('External')
            $('#eventcode').text(req.findEventByCode.EventCode)
            $('#eventstatus').text(Util.toTitleCase(req.findEventByCode.StatusName || 'Not Reported'))
            $('#createdBy').text(Util.toTitleCase(req.findEventByCode.CreatedByName || 'Not Reported'))
            $('#responsibleBy').text(Util.toTitleCase(req.findEventByCode.ResponsibleByName || 'Not Reported'))
            $('#departamento').text(Util.toTitleCase('departamento buscar'))

            $('#startTime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm'))
            $('#endTime').text(moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))
            // $('#startendtime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm') + '\n' +  moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))

            $('#LeavingTheEvent').text(Util.toTitleCase(moment(req.findEventByCode.LeavingFromEvent).format('DD/MM/YYYY HH:mm') || 'Not Reported'))
            $('#LocationName').text(Util.toTitleCase(req.findEventByCode.LocationEvent || 'Not Reported'))

            $('#DepartureLocation').text(req.findEventByCode.DepartureFrom || 'Not Reported')
            $('#NPassenger').text(req.findEventByCode.AmountPerson || 'Not Reported')

            if(req.findEventByCode.MeansOfTransport){
              $('#MeansOfTransport').text(req.findEventByCode.TypeVehicleEnglish + '/' + req.findEventByCode.TypeVehiclePort)
            }else{
              $('#MeansOfTransport').text('Not Reported')
            }

            $('#WaitInAvenue').text(req.findEventByCode.TransportWaitAvenue || 'Not Reported')

            if(req.findEventByCode.setor){
              $('#Budget').text(req.findEventByCode.setor + ' ' + req.findEventByCode.grupo + ' ' + req.findEventByCode.conta)
            }else{
              $('#Budget').text('Not Reported')
            }


            $('#Nparent').text(req.findEventByCode.Nparent || 'Not Reported')
            $('#Npupil').text(req.findEventByCode.Npupil || 'Not Reported')
            $('#Nstaff').text(req.findEventByCode.Nstaff || 'Not Reported')
            $('#Nvisitor').text(req.findEventByCode.Nvisitor || 'Not Reported')

            $('#AdditionalInformation').text(Util.toTitleCase(req.findEventByCode.AdditionalInformation || 'Not Reported'))

            //prod
            let products = req.findEventByCode.products.reduce(function(acc,ele){
              acc.total = acc.total + (ele.Price * ele.Amount * 1.14)
              acc.tabelaProd = acc.tabelaProd + '<tr style="line-height: 15px;">'+
                                        '  <td style="border:1px solid black;">'+ ele.ProductNameEnglish + '/' + ele.ProductNamePort + '(' + ele.UnitInEnglish + '/' + ele.UnitInPort + ')' + '</td>'+
                                        '  <td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Amount + '</td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ ele.Price.toFixed(2) +' </td>'+
                                          '<td style="padding-right:3px;border:1px solid black;text-align:right;">'+ (ele.Price * ele.Amount * 1.14).toFixed(2) +'</td>'+
                                        '</tr>'
              return acc
            },{tabelaProd:'',total:0})

            let footerTableProd = '<tr style="line-height: 15px;"><td colspan="4" style="padding-right:3px;text-align:right;">'+ (products.total).toFixed(2) +'</td></tr>'
            products.tabelaProd = products.tabelaProd + footerTableProd

            if(req.findEventByCode.products.length > 0){
              $('#bodyProducts').html(products.tabelaProd)
            }else{
              $('#bodyProducts').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have products</td></tr>')
            }

            //guest
            console.log(req.findEventByCode.guests)
            console.log('________________________')
            let guests = req.findEventByCode.guests.reduce(function(acc,ele){
              acc.tabelaGuest = acc.tabelaGuest + '<tr style="line-height: 15px;">'+
                                                  '<td style="border:1px solid black;">'+ ele.Type +' </td>'+
                                                  '<td style="border:1px solid black;">'+ ele.NameGuest +'</td>'+
                                                '</tr>'
              return acc
            },{tabelaGuest:''})

            if(req.findEventByCode.guests.length > 0){
              $('#bodyGuests').html(guests.tabelaGuest)
            }else{
              $('#bodyGuests').html('<tr style="line-height: 15px;text-align:center;"><td colspan="4">Don\'t have guests</td></tr>')
            }

            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              console.log(pdfFile);
              res.download(pdfFile.filename, new Date() + 'report.pdf')
            })
          })
      }
    })
  }
}

module.exports = new HtmlPDF()
