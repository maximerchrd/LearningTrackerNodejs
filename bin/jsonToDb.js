/*var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var queryString = require('querystring');
const mysql = require('mysql');
var fs = require('fs');
var sharp = require('sharp');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());



//POST request
router.post('/', function(req, res) {
    var quest = req.param("question_text");
    var answers = req.param("question_answer", "no answer");
    var type = req.param("question_type");
    var imageName = req.param("question_image_name", "no image");
    var imageString = req.param("question_image", "no image");
    console.log("received something:" + quest + "/" + answers + "/" + type + "/" + imageString);

    var img = imageString;
    var buf = new Buffer(img, 'base64');
    fs.writeFile("public/images/" + imageName, buf);

    res.send("200");

    sharp(buf)
        .resize(100, 100, {
            kernel: sharp.kernel.nearest
        })
        .background('white')
        .embed()
        .toFile("public/images/mini_" + imageName)
        .then(function() {

        });

    //do mysql stuffs
    var sql = "INSERT INTO multiple_choice_questions (QUESTION, IMAGE_PATH) VALUES ('" + quest +
        "', '" + imageName + "');"
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
});

module.exports = router;
*/