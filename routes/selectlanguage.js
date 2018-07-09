var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function (req, res) {
    global.language = req.body.language;
    res.redirect('back');
});

module.exports = router;