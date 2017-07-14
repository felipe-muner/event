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
            $('#departamento').text(Util.toTitleCase('departamento'))
            $('#startendtime').text(moment(req.findEventByCode.start).format('DD/MM/YYYY HH:mm') + '\n' +  moment(req.findEventByCode.end).format('DD/MM/YYYY HH:mm'))



            pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
              if (err) return console.log(err);
              res.download(pdfFile.filename, new Date() + 'report.pdf')
              //res.download(process.env.PWD + '/views/report/internal-event.html')
            });
          })
      }
    })
  }

}

module.exports = new HtmlPDF()
