var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var questSelectedFilter = ["All questions", "My questions", "Other questions"];
var mainSubjects = [];
var questionsArray = [];
var signString = ""
var signUrl = ""
var data;

//define question object
function Question(questionID, questionText, questionType, imageName, rating, userSelected) {
    this.questionID = questionID;
    this.questionText = questionText;
    this.questionType = questionType;
    this.imageName = imageName;
    this.rating = rating;
    this.userSelected = userSelected
}


/* GET questions page. */
router.get('/', function(req, res, next) {
    //reinit question array
    questionsArray = [];


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
        con.query("SELECT SUBJECT FROM subjects;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                mainSubjects.push(rows[i].SUBJECT);
            }

        });

        //get the relations between questions and user
        var resourceIdsForUser  = [];
        if (req.user) {
            con.query("SELECT * FROM relation_resource_user WHERE IDENTIFIER_USER='" + req.user + "';", function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    resourceIdsForUser.push(rows[i].IDENTIFIER_RESOURCE)
                }

            });
        }

        con.query("SELECT * FROM short_answer_questions;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, "Short Answer", rows[i].IMAGE_PATH, 3, "selected.png");
                    questionsArray.push(question);
                } else {
                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, "Short Answer", rows[i].IMAGE_PATH, 3, "notselected.png");
                    questionsArray.push(question);
                }
            }
        });

        con.query("SELECT * FROM multiple_choice_questions;", function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, "Multiple Choice", rows[i].IMAGE_PATH, 3, "selected.png");
                    questionsArray.push(question);
                } else {
                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, "Multiple Choice", rows[i].IMAGE_PATH, 3, "notselected.png");
                    questionsArray.push(question);
                }
            }


            if (req.user) {
                signString = "Sign Out"
                signUrl = "signout"
            } else {
                signString = "Sign In"
                signUrl = "signin"
            }

            data = {questions: questionsArray};
            res.render('questions', { sign_in_out: signString, sign_in_out_url: signUrl, data: data,
                mainSubjects: mainSubjects, questSelectedFilter: questSelectedFilter});
        });
    });
});

router.post('/', function(req, res) {
    console.log(req.body)

    //parse the post request to a 2d array
    var date = new Date();
    var questionsNotParsed = req.body.selectedQuestions.split(",")
    questionsNotParsed.shift()
    var questions = [];
    var i;
    for (i = 0; (i + 1) < questionsNotParsed.length; i = i + 2) {
        questions.push([questionsNotParsed[i], questionsNotParsed[i+1]])
    }
    console.log(questions)
    for (i = 0; i < questions.length; i++) {
        questions[i].push(req.user)
        questions[i].push(date.getDate())
    }
    //do mysql stuffs

    // First you need to create a connection to the db
    const con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'koeko_website'
    });

    if (questions.length > 0) {
        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");

            var sql = "INSERT INTO relation_resource_user (IDENTIFIER_RESOURCE, RESOURCE_TYPE, IDENTIFIER_USER, MODIF_DATE) VALUES ?";
            con.query(sql, [questions], function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
            });
        });
    }

    //change the user selection for the corresponding questions in array
    var questionIDs = []
    var i;
    for (i = 0; i < questions.length; i++) {
        questionIDs.push(questions[i][0])
    }
    for (i = 0; i < questionsArray.length; i++) {
        if (questionIDs.indexOf(questionsArray[i].questionID) != -1) {
            questionsArray[i].userSelected = "selected.png"
        }
    }
    data = {questions: questionsArray};
    res.render('questions', { sign_in_out: signString, sign_in_out_url: signUrl, data: data,
        mainSubjects: mainSubjects, questSelectedFilter: questSelectedFilter});
});

module.exports = router;