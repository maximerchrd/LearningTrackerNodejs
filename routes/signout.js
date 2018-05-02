var express = require('express');
var router = express.Router();
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const mysql = require('mysql');

/* GET sign in page. */
router.get('/', function(req, res, next) {
    req.logout();
    res.redirect('/');
    next()
});

module.exports = router;