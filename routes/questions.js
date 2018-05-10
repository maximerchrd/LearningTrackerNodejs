var express = require('express');
var router = express.Router();
const mysql = require('mysql');

//define question object
function Question(questionText, questionType, imageName, rating, userSelected) {
    this.questionText = questionText;
    this.questionType = questionType;
    this.imageName = imageName;
    this.rating = rating;
    this.userSelected = userSelected
}


/* GET questions page. */
router.get('/', function(req, res, next) {
    var questSelectedFilter = ["All questions", "My questions", "Other questions"];
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
                if (req.user) {
                    var question = new Question(rows[i].QUESTION, "Short Answer", rows[i].IMAGE_PATH, 3, "selected.png");
                    questionsArray.push(question);
                } else {
                    var question = new Question(rows[i].QUESTION, "Short Answer", rows[i].IMAGE_PATH, 3, "notselected.png");
                    questionsArray.push(question);
                }
            }

        });
        con.query("SELECT * FROM multiple_choice_questions;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (req.user) {
                    var question = new Question(rows[i].QUESTION, "Multiple Choice", rows[i].IMAGE_PATH, 3, "selected.png");
                    questionsArray.push(question);
                } else {
                    var question = new Question(rows[i].QUESTION, "Multiple Choice", rows[i].IMAGE_PATH, 3, "notselected.png");
                    questionsArray.push(question);
                }
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
                mainSubjects: mainSubjects, questSelectedFilter: questSelectedFilter});
        });
    });
});

module.exports = router;