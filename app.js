const createError = require('http-errors');
const express = require('express');
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { engine } = require('express-handlebars')
const hbsHelpers = require('./config/handlebars-helpers')
const indexRouter = require('./routes/index');
const apisRouter = require('./routes/apis');
const adminRouter = require('./routes/admin')

const app = express();

// view engine setup
app.engine('hbs', engine({ defaultLayout: 'main', extname: '.hbs', helpers: hbsHelpers}))
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'))
app.use('/', indexRouter);
app.use('/api', apisRouter);
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
