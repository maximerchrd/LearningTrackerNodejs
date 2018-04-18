var express = require('express');
var router = express.Router();

//define question object
function Question(questionText, questionType, rating) {
    this.questionText = questionText;
    this.questionType = questionType;
    this.rating = rating;
}


/* GET questions page. */
router.get('/', function(req, res, next) {
    var questionsArray = [];
    var question1 = new Question("What?", "MCQ", 3)
    var question2 = new Question("When?", "SHRTAQ", 2)
    questionsArray.push(question1);
    questionsArray.push(question2);
    var data = {questions: questionsArray};
    res.render('questions', { title: 'Questions', data: data});
});

module.exports = router;