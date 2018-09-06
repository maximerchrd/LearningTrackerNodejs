var express = require('express');
var router = express.Router();
var i18n = require('i18n');

/* GET home page. */
router.post('/', function (req, res) {
    i18n.setLocale(req.body.language);
    res.redirect('back');
});

module.exports = router;