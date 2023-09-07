var createError = require('http-errors');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var {createS3Bucket} = require("./helpers/S3Manager");

const bucketName = process.env.BUCKET_NAME;
createS3Bucket(bucketName).then(result => {
  console.log("test");
});

var apiKey = require('./helpers/apiKey');
var indexRouter = require('./routes/index');
var gameRouter = require('./routes/game');
var visitCounter = require('./helpers/visitCounter');

var app = express();

//enable handlebars dateformat support
hbs.registerHelper('dateformat', require('handlebars-dateformat'));

//handlebars helper to get icon url from link
hbs.registerHelper('getFavicon', function(url){
  const regex = /^.+?[^\/:](?=[?\/]|$)/gm;
  var string = regex.exec(url);
  return string;
})

hbs.registerHelper('getSite', function(url){
  const regex = /.+\/\/|www.|\..+/gm;
  var string = url.replace(regex, "")
  return string;
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/*', visitCounter);
app.use('*', apiKey.router)
app.use('/', indexRouter);
app.use('/game', gameRouter);

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
