var express = require('express');
var router = express.Router();
const mysql = require('mysql');

//define question object
function Question(questionText, questionType, imageName, rating) {
    this.questionText = questionText;
    this.questionType = questionType;
    this.imageName = imageName;
    this.rating = rating;
}


/* GET questions page. */
router.get('/', function(req, res, next) {
    var mainSubjects = [];
    var questionsArray = [];

    //do mysql stuffs

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
        con.query("SELECT SUBJECT FROM subjects;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                mainSubjects.push(rows[i].SUBJECT);
            }

        });
        con.query("SELECT * FROM short_answer_questions;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                var question = new Question(rows[i].QUESTION, "Short Answer", rows[i].IMAGE_PATH, 3);
                questionsArray.push(question);
            }

        });
        con.query("SELECT * FROM multiple_choice_questions;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                var question = new Question(rows[i].QUESTION, "Multiple Choice", rows[i].IMAGE_PATH, 3);
                questionsArray.push(question);
            }

            var signString = ""
            var signUrl = ""
            if (req.user) {
                signString = "Sign Out"
                signUrl = "signout"
            } else {
                signString = "Sign In"
                signUrl = "signin"
            }

            var data = {questions: questionsArray};
            res.render('questions', { sign_in_out: signString, sign_in_out_url: signUrl, data: data,
                mainSubjects: mainSubjects});
        });
    });
});

module.exports = router;