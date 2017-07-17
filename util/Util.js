const moment = require('moment')
const cheerio = require('cheerio')
const fs = require('fs')
const Styliner = require('styliner')
var styliner = new Styliner(__dirname);
var pdf = require('html-pdf');
var A4option = require(process.env.PWD + '/views/report/A4config')

module.exports = {
  randomAlphaNumeric: function (length) {
    let chars = '0123456789abcdefghij'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  },
  toTitleCase: function (str) {
    if (!str) str = ''
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
  },
  generateHTMLReport: function(res, query, fields) {
    fs.readFile(process.env.PWD + '/views/report/RepUser.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err;
          callback(err);
      }else{
        var begin = new Date()
        styliner.processHTML(html)
          .then(function(processedSource) {
            const $ = cheerio.load(processedSource)

            fields.map(function(e){
              $('#headerTable').append('<th>'+ e +'</th>')
            })

            query.map(function(e){
              $('#bodyTable').append('<tr>')
              //fields.map((f) => $('#bodyTable').append('<td>' + e[f] + '</td>'))
              fields.map(function(f){
                if(Object.prototype.toString.call( e[f] ) === '[object Date]'){
                  e[f] = moment(e[f]).format("DD/MM/YYYY")
                }
                $('#bodyTable').append('<td>' + e[f] + '</td>')
              })
              $('#bodyTable').append('</tr>')
            })
            fs.readFile(process.env.PWD + '/views/report/headerTemplate.html', {encoding: 'utf-8'}, function (err, header) {
              A4option.header.contents = header
              fs.readFile(process.env.PWD + '/views/report/footerTemplate.html', {encoding: 'utf-8'}, function (err, footer) {
                A4option.footer.contents.default = footer
                pdf.create($.html(), A4option).toFile(function(err, pdfFile) {
                  if (err) return console.log(err);
                  res.download(pdfFile.filename, new Date() + 'report.pdf')
                  var end = new Date()
                  console.log('tempo : ', end - begin );
                });
              })
            })
          });
      }
    })


    //console.log(typeof moment(new Date()).format("DD/MM/YYYY"))
    // let html = 'html'
    // const $ = cheerio.load(html)
    //$('table').append('<tr><th>UserID</th><th>Matricula</th><th>Name</th><th>DateBirth</th><th>PasswordChanged</th></tr>')

    // for (let i = 0; i < query.length; i++) {
    //   let row = '<tr>';
    //   for (let j = 0; j < fields.length; j++) {
        //console.log( fields[j] + ' valor ' + query[i][fields[j]])
    //     if(Object.prototype.toString.call( query[i][fields[j]] ) === '[object Date]'){
    //       query[i][fields[j]] = moment(query[i][fields[j]]).format("DD/MM/YYYY")
    //     }
    //     row = row + '<td>' + query[i][fields[j]] + '</td>'
    //   }
    //   $('table').append( row )
    // }

    //return $('#contentReport').html()

    //for (var i = 0;i < query.length; i++) {
      // var str = JSON.stringify(query);
      // var rows = JSON.parse(str);
      // console.log(rows[0]);
      // objs.push(query[i]);
    //}
    // console.log(objs);
  }
}


// let i = 10
// while(i > 0){
//   console.log(randomAlphaNumeric(i));
//   i--
//}
// exports.sayHelloInEnglish = function() {
//   return "HELLO";
// };
