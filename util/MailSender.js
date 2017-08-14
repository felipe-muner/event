require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs')
const Styliner = require('styliner')
const cheerio = require('cheerio')
var styliner = new Styliner(__dirname);

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = {
  emailRecoverPassword: function(newPassword, userEmail, matricula) {
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
}
