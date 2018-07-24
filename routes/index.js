var express = require('express');
var router = express.Router();
var i18n = require('i18n');

/* GET home page. */
router.get('/', function (req, res, next) {
    setLanguage(req,res);

    var signString = "";
    var signUrl = "";
    if (req.user) {
        signString = i18n.__('sign out');
        signUrl = "signout";
    } else {
        signString = i18n.__('sign in');
        signUrl = "signin";
    }

    var data = {language: global.language};
    translation = setTranslation();
    res.render('index', {sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data});
});

function setLanguage(req,res) {
    i18n.init(req, res);
    if (global.language == "eng") {
        i18n.setLocale('eng');
    } else if (global.language == "fra") {
        i18n.setLocale('fra');
    } else {
        global.language = "eng";
    }
}

function setTranslation() {
    var translation = {
        sign_up: i18n.__('sign up'),
        questions: i18n.__('questions'),
        home: i18n.__('home')
    }
    return translation
}

module.exports = router;