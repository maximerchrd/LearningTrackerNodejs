module.exports = {
    Question: function (questionID, questionText, answers, nbCorrectAnswers, questionType, imageName, rating, userSelected) {
        this.questionID = questionID;
        this.questionText = questionText;
        this.answers = answers;
        this.nbCorrectAnswers = nbCorrectAnswers;
        this.questionType = questionType;   // 0: multiple choice; 1: short answer, 2: test, 3: teaching sequence
        this.imageName = imageName;
        this.rating = rating;
        this.userSelected = userSelected;
        this.mainSubject = "";
        this.editAvailable = false;
        this.equivalenceId = -1;
        this.version = -1;
    }
};