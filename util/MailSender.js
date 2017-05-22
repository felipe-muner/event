const nodemailer = require('nodemailer');

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
    let mailOptions = {};
    mailOptions.from = '"Company Recover Password 👻" <foo@blurdybloop.com>'
    mailOptions.to = userEmail
    mailOptions.subject = 'Olar'
    mailOptions.text = 'Hello world ?'
    mailOptions.html = '<style>div { color:red; }</style><div style="color:red;">'+ newPassword +'</div>'
    mailOptions.attachments = [
                          {   // utf-8 string as an attachment
                            filename: 'text1.txt',
                            content: 'hello world!'
                          },
                          {   // binary buffer as an attachment
                            filename: 'text2.txt',
                            content: new Buffer('hello world!','utf-8')
                          }
                        ]
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
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
