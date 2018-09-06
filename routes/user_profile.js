var express = require('express');
var router = express.Router();
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const crypto = require("crypto");
var i18n = require('i18n');

/* POST login. */

router.post('/',
    function (req, res) {

        if (req.user) {
            //do mysql stuffs
            var sql = "SELECT * FROM users WHERE IDENTIFIER = ?";
            var sqlArg = [req.user];

            var username = "";
            // First you need to create a connection to the db
            const con = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'koeko_website'
            });
            con.connect(function (err) {
                if (err) throw err;
                con.query(sql, sqlArg, function (err, rows) {
                    if (err) throw err;

                    for (var i in rows) {
                        username = rows[i].username;
                    }

                    var signString = "";
                    var signUrl = "";
                    if (req.user) {
                        signString = i18n.__('sign out');
                        signUrl = "signout";
                    } else {
                        signString = i18n.__('sign in');
                        signUrl = "signin";
                    }

                    const synckey = crypto.randomBytes(10).toString("hex");

                    const sqlUpdate = "UPDATE users SET SYNC_KEY = ?, KEY_DATE = now() WHERE IDENTIFIER = ?";
                    const sqlUpdateArgs = [synckey, req.user];
                    con.query(sqlUpdate, sqlUpdateArgs, function (err, rows) {
                        if (err) throw err;
                    });


                    var data = {language: i18n.getLocale(req), user: username, synckey: synckey};
                    var translation = setTranslation();

                    res.render('user_profile', {
                        sign_in_out: signString,
                        sign_in_out_url: signUrl,
                        data: data,
                        translation: translation
                    });
                });
            });
        } else {
            res.redirect('signin');
        }

    });

/* GET sign in page. */
router.get('/', function (req, res, next) {

    if (req.user) {
        //do mysql stuffs
        var sql = "SELECT * FROM users WHERE IDENTIFIER = ?";
        var sqlArg = [req.user];

        var username = "";
        var synckey = "";
        // First you need to create a connection to the db
        const con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'koeko_website'
        });
        con.connect(function (err) {
            if (err) throw err;
            con.query(sql, sqlArg, function (err, rows) {
                if (err) throw err;

                for (var i in rows) {
                    username = rows[i].username;
                    synckey = rows[i].SYNC_KEY;
                }

                var signString = "";
                var signUrl = "";
                if (req.user) {
                    signString = i18n.__('sign out');
                    signUrl = "signout";
                } else {
                    signString = i18n.__('sign in');
                    signUrl = "signin";
                }

                if (synckey == null) {
                    synckey = "";
                }

                var language = i18n.getLocale();
                if (language == "noinit") {
                    language = i18n.getLocale(req);
                }

                var data = {language: language, user: username, synckey: synckey};
                var translation = setTranslation();

                res.render('user_profile', {
                    sign_in_out: signString,
                    sign_in_out_url: signUrl,
                    data: data,
                    translation: translation
                });
            });
        });
    } else {
        res.redirect('signin');
    }


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