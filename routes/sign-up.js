var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mysql = require('mysql');
var i18n = require('i18n');
var shortid = require('shortid');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

//POST request
router.post('/', function(req, res) {
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.confirmPassword) {
        if (req.body.password === req.body.confirmPassword) {
            var hashedPassword = bcrypt.hashSync(req.body.password, 12);

            var uniqueId = shortid.generate();

            //do mysql stuffs
            var sql = "INSERT IGNORE INTO users (IDENTIFIER, username, email, password) VALUES (?, ?, ?, ?);";
            var sqlArgs = [uniqueId, req.body.username, req.body.email, hashedPassword];
            // First you need to create a connection to the db
            const con = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'koeko_website'
            });
            con.connect(function(err) {
                if (err) throw err;
                con.query(sql, sqlArgs, function (err, result) {
                    if (err) throw err;
                    console.log("Result: " + result);
                });
            });

            var data = {language: i18n.getLocale(req)};
            var translation = setTranslation();
            res.render('signin', { title: 'Sign Up' , message: 'You registered successfully!', sign_in_out: i18n.__('sign in'), data: data, translation: translation});
        } else {
            var data = {language: i18n.getLocale(req)};
            var translation = setTranslation();
            res.render('sign-up', { title: 'PW MISMATCH', sign_in_out: i18n.__('sign in'), data: data, translation: translation});
        }
    } else {
        var data = {language: i18n.getLocale(req)};
        var translation = setTranslation();
        res.render('sign-up', { title: 'ERROR', sign_in_out: i18n.__('sign in'), data: data, translation: translation});
    }

});

/* GET sign up page. */
router.get('/', function(req, res, next) {
    var signString = "";
    var signUrl = "";
    if (req.user) {
        signString = i18n.__('sign out');
        signUrl = "signout"
    } else {
        signString = i18n.__('sign in');
        signUrl = "signin"
    }

    var language = i18n.getLocale();
    if (language == "noinit") {
        language = i18n.getLocale(req);
    }

    var data = {language: language};
    var translation = setTranslation();
    res.render('sign-up', { sign_in_out: signString, sign_in_out_url: signUrl, data: data, translation: translation});
});

function setTranslation() {
    var translation = {
        sign_up: i18n.__('sign up'),
        questions: i18n.__('questions'),
        home: i18n.__('home'),
        user_name: i18n.__('user name'),
        password: i18n.__('password'),
        email: i18n.__('email'),
        confirm_password: i18n.__('confirm_password')
    }
    return translation
}

module.exports = router;