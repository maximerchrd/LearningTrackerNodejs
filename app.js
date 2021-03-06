var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionsRouter = require('./routes/questions');
var signupRouter = require('./routes/sign-up');
var signinRouter = require('./routes/signin');
var signoutRouter = require('./routes/signout');
var languageRouter = require('./routes/selectlanguage');
var userProfileRouter = require('./routes/user_profile');

//initialize internationalization
var i18n = require("i18n");
i18n.configure({
    locales:['en', 'fr'],
    defaultLocale: 'noinit',
    directory: __dirname + '/locales'
});
//var jsonToDbRouter = require('./bin/jsonToDb');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "whatever",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(i18n.init);

app.use('/', indexRouter);
app.use('/home', indexRouter);
app.use('/users', usersRouter);
app.use('/questions', questionsRouter);
app.use('/sign-up', signupRouter);
app.use('/signin', signinRouter);
app.use('/signout', signoutRouter);
app.use('/selectlanguage', languageRouter);
app.use('/user_profile', userProfileRouter);
//app.use('/post-mcq', jsonToDbRouter);

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
