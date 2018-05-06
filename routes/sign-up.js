var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mysql = require('mysql');
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

            //do mysql stuffs
            var sql = "INSERT IGNORE INTO users (username, email, password) VALUES ('" + req.body.username +
                "', '" + req.body.email + "', '" + hashedPassword + "');"
            // First you need to create a connection to the db
            const con = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'koeko_website'
            });
            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected!");
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Result: " + result);
                });
            });


            res.render('sign-up-success', { title: 'Sign Up' });
        } else {
            res.render('sign-up', { title: 'PW MISMATCH' });
        }
    } else {
        res.render('sign-up', { title: 'ERROR' });
    }

});

/* GET sign up page. */
router.get('/', function(req, res, next) {
    var signString = ""
    var signUrl = ""
    if (req.user) {
        signString = "Sign Out"
        signUrl = "signout"
    } else {
        signString = "Sign In"
        signUrl = "signin"
    }
    res.render('sign-up', { sign_in_out: signString, sign_in_out_url: signUrl });
});

module.exports = router;