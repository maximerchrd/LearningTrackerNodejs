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
    var questionsArray = [];

    //do mysql stuffs
    var sql = "";
    if (req.user) {
        sql = "SELECT * FROM multiple_choice_questions WHERE ID=1;"
    } else {
        sql = "SELECT * FROM multiple_choice_questions;"
    }

    // First you need to create a connection to the db
    const con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'NodeJSLearningTracker'
    });
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query(sql, function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                console.log(rows[i].IMAGE_PATH);
                var question = new Question(rows[i].QUESTION, "MCQ", rows[i].IMAGE_PATH, 3);
                questionsArray.push(question);
            }
            var data = {questions: questionsArray};
            res.render('questions', { title: 'Questions', data: data});
        });
    });
});

module.exports = router;