var express = require('express');
var router = express.Router();
var i18n = require('i18n');

/* GET home page. */
router.get('/', function (req, res, next) {

    var signString = "";
    var signUrl = "";
    if (req.user) {
        signString = i18n.__('sign out');
        signUrl = "signout";
    } else {
        signString = i18n.__('sign in');
        signUrl = "signin";
    }

    var language = i18n.getLocale();
    if (language == "noinit") {
        language = i18n.getLocale(req);
    }

    var data = {language: language};
    translation = setTranslation();
    res.render('index', {sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data});
});


function setTranslation() {
    var translation = {
        sign_up: i18n.__('sign up'),
        questions: i18n.__('questions'),
        home: i18n.__('home')
    }
    return translation
}

module.exports = router;