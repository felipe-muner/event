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
  emailRecoverPassword: function(newPassword, userEmail) {
    fs.readFile(process.env.PWD + '/views/email/emailRecoverPassword.html', {encoding: 'utf-8'}, function (err, html) {
          if (err) {
              throw err;
              callback(err);
          }else{
            styliner.processHTML(html)
                .then(function(processedSource) {
                  const $ = cheerio.load(processedSource)
                  let qs = '?u=' + userEmail + '&p=' + newPassword + '&recoveremail=true'
                  $("#linkchangepassword").attr("href", "http://localhost:3000/change-password" + qs)
                  console.log($('body').html());

                  let mailOptions = {};
                  mailOptions.from = '"Company - Recover Password 👻" <noreply@company.com>'
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



// // setup email data with unicode symbols
// let mailOptions = {
//     from: '"Company Recover Password 👻" <foo@blurdybloop.com>', // sender address
//     to: 'felipe.muner@gmail.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world ?', // plain text body
//     html: '<b>Hello world ?</b>', // html body
//     attachments: [
//         {   // utf-8 string as an attachment
//             filename: 'text1.txt',
//             content: 'hello world!'
//         },
//         {   // binary buffer as an attachment
//             filename: 'text2.txt',
//             content: new Buffer('hello world!','utf-8')
//         }
//     ]
// };
//
// // send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
// });
