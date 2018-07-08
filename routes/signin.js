var express = require('express');
var router = express.Router();
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const mysql = require('mysql');

/* POST login. */

router.post('/',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
    })
);
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.use(new LocalStrategy(function (username, password, done) {
        var dbPassword = "";

        //do mysql stuffs
        var sql = "SELECT * FROM users WHERE username = ?"
        var sqlArg = [username]
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

                if (rows.length < 1) {
                    return done(null, false, {message: 'No user found or password not correct'});
                } else {
                    dbPassword = rows[0].password;
                    var identifier = rows[0].IDENTIFIER;
                    bcrypt.compare(password, dbPassword, function (err, res) {
                        if (err) return done(err);
                        if (res === false) {
                            return done(null, false, {message: 'No user found or password not correct'});
                        } else {
                            return done(null, identifier);
                        }
                    });
                }
            });
        });
    }
));
/* GET sign in page. */
router.get('/', function (req, res, next) {
    var signString = ""
    var signUrl = ""
    var message = req.flash('error')[0]
    if (req.user) {
        signString = "Sign Out"
        signUrl = "signout"
    } else {
        signString = "Sign In"
        signUrl = "signin"
    }
    res.render('signin', {sign_in_out: signString, sign_in_out_url: signUrl, message: message});
    //next()
});

module.exports = router;