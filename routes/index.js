var express = require('express');
var router = express.Router();

/* GET home page. */
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
  res.render('index', { sign_in_out: signString, sign_in_out_url: signUrl });
});

module.exports = router;
