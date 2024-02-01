const createError = require('http-errors');
const express = require('express');
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const authHelpers = require('./helpers/auth-helpers')
const logger = require('morgan');
const { engine } = require('express-handlebars')
const hbsHelpers = require('./helpers/handlebars-helpers')
const pages = require('./routes/pages/index');
const apis = require('./routes/apis');

const app = express();
app.use(cors())

// view engine setup
app.engine('hbs', engine({ defaultLayout: 'main', extname: '.hbs', helpers: hbsHelpers }))
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_messages = req.flash('warning_messages')
  res.locals.user = authHelpers.getUser(req)
  next()
})

app.use(methodOverride('_method'))
app.use('/', pages);
app.use('/api', apis);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
