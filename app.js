require('dotenv').config();
const express = require('express');
const helmet = require('helmet')
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const hbs = require('./helpers/handlebars.js')(exphbs);
const expressSession = require('express-session');
const nodemailer = require('nodemailer');
const mailSender = require(process.env.PWD + '/util/MailSender')

var conn = require('./conn');
conn.init();

var index = require('./routes/index');
var user = require('./routes/user');
var manageprofile = require('./routes/manage-profile');

var app = express();

app.use(helmet())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret:'e2r3$r!q0oIl', saveUninitialized:false, resave:false, name:'event'}));

app.use('/', index);
app.use('/user', user);
app.use('/manage-profile', manageprofile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
