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
  this.genPDF = function(req, res, next){
    fs.readFile(process.env.PWD + '/views/report/internal-event.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err;
          callback(err);
      }else{
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            $('#eventName').text(Util.toTitleCase(req.findEventByCode.title))
            $('#eventcode').text(req.findEventByCode.EventCode)
            $('#eventstatus').text(Util.toTitleCase(req.findEventByCode.StatusName))
            $('#createdBy').text(Util.toTitleCase(req.findEventByCode.CreatedByName))
            $('#responsibleBy').text(Util.toTitleCase(req.findEventByCode.ResponsibleByName))
            $('#departamento').text(Util.toTitleCase('departamento buscar'))
            $('#startendtime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm') + '\n' +  moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))

            $('#needDataShow').text(Util.toTitleCase(req.findEventByCode.NeedDataShow))
            $('#needComputer').text(Util.toTitleCase(req.findEventByCode.NeedComputer))
            $('#videoConferencia').text('From: ' + req.findEventByCode.VideoFrom + ' To: ' + req.findEventByCode.VideoTo)

            $('#Nparent').text(req.findEventByCode.Nparent)
            $('#Npupil').text(req.findEventByCode.Npupil)
            $('#Nstaff').text(req.findEventByCode.Nstaff)
            $('#Nvisitor').text(req.findEventByCode.Nvisitor)

            $('#AdditionalInformation').text(Util.toTitleCase(req.findEventByCode.AdditionalInformation))


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
            $('#bodyProducts').html(products.tabelaProd)


            //guest
            let guests = req.findEventByCode.guests.reduce(function(acc,ele){
              acc.tabelaGuest = acc.tabelaGuest + '<tr style="line-height: 15px;">'+
                                                  '<td style="border:1px solid black;">'+ ele.Type +' </td>'+
                                                  '<td style="border:1px solid black;">'+ ele.NameGuest +'</td>'+
                                                '</tr>'
              return acc
            },{tabelaGuest:''})

            $('#bodyGuests').html(guests.tabelaGuest)


            fs.readFile(process.env.PWD + '/views/report/headerTemplate.html', {encoding: 'utf-8'}, function (err, header) {
              A4option.header.contents = header
              fs.readFile(process.env.PWD + '/views/report/footerTemplate.html', {encoding: 'utf-8'}, function (err, footer) {
                A4option.footer.contents.default = footer
                pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
                  if (err) return console.log(err);
                  res.download(pdfFile.filename, new Date() + 'report.pdf')                  
                });
              })
            })
          })
      }
    })
  }

}

module.exports = new HtmlPDF()
