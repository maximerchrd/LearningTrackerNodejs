var currentUser = "";
var selectedQuestions = [];
var unselectedQuestions = [];
var questArray = [];
var automaticAddedQuest = [];

function initTest(test, user, selectedQuest, unselectedQuest, questionsArray) {
    if (test != "") {
        currentUser = user;
        selectedQuestions = selectedQuest;
        unselectedQuestions = unselectedQuest;
        questArray = questionsArray;
        document.getElementById("test_table").style.visibility = "visible";
        document.getElementById("test-name").innerHTML = test[0];
        if (test[2].length > 0) {
            document.getElementById("test-media").href = "users_images/" + test[2];
        } else {
            document.getElementById("test-media").innerHTML = "no media associated";
        }

        //set the average ratings
        var tstars = ['teststar1', 'teststar2', 'teststar3', 'teststar4', 'teststar5'];
        var starDesign = 'star on';
        var rating = parseFloat(test[3]);

        for (var j = 1; j < tstars.length + 1; j++) {
            if (rating > (j - 0.25)) {
                document.getElementById(tstars[j - 1]).className = starDesign;
            } else if (rating > (j - 0.75)) {
                document.getElementById(tstars[j - 1]).className = 'star half';
            } else {
                starDesign = 'star';
                document.getElementById(tstars[j - 1]).className = starDesign;
            }
        }

        //set the user rating
        var tustars = ['testustar1', 'testustar2', 'testustar3', 'testustar4', 'testustar5'];
        var starDesign = 'star on';
        var rating = parseFloat(test[4]);

        for (var j = 1; j < tstars.length + 1; j++) {
            if (rating > (j - 0.25)) {
                document.getElementById(tustars[j - 1]).className = starDesign;
            } else if (rating > (j - 0.75)) {
                document.getElementById(tustars[j - 1]).className = 'star half';
            } else {
                starDesign = 'star';
                document.getElementById(tustars[j - 1]).className = starDesign;
            }
        }

        //set the test selection
        if (test.length == 5) {
            document.getElementById("testCheckboxImage").src = "/images/selected.png";
        }
    }
}

function setTestUserRating(rating) {
    if (currentUser != "") {
        var stars = ['testustar1', 'testustar2', 'testustar3', 'testustar4', 'testustar5'];
        var starDesign = 'star on';
        for (var j = 1; j < stars.length + 1; j++) {
            if (rating > (j - 0.25)) {
                document.getElementById(stars[j - 1]).className = starDesign;
            } else if (rating > (j - 0.75)) {
                document.getElementById(stars[j - 1]).className = 'star half';
            } else {
                starDesign = 'star';
                document.getElementById(stars[j - 1]).className = starDesign;
            }
        }
        rateTestNStars(rating, test[1]);
    }
}

function toggleSelection() {
    if (currentUser != "") {
        if (document.getElementById("testCheckboxImage").src.indexOf("/images/selected.png") !== -1) {
            document.getElementById("testCheckboxImage").src = "/images/notselected.png";
            if (selectedQuestions.includes(test[1])) {
                selectedQuestions.splice(selectedQuestions.indexOf(test[1]), 1);
            } else {
                unselectedQuestions.push(test[1]);
            }
            //remove the questions automatically selected (if present)
            for (var i = 0; i < automaticAddedQuest.length; i++) {
                if (selectedQuestions.includes(automaticAddedQuest[i])) {
                    selectedQuestions.splice(automaticAddedQuest[i], 1);
                }
            }
            automaticAddedQuest = [];
        } else {
            document.getElementById("testCheckboxImage").src = "/images/selected.png";
            if (unselectedQuestions.includes(test[1])) {
                unselectedQuestions.splice(unselectedQuestions.indexOf(test[1]), 1);
            } else {
                selectedQuestions.push([test[1], "TEST"]);
            }
            //select all related questions
            for (var i = 0; i < questArray.length; i++) {
                if (questArray[i].userSelected != "selected.png" && !selectedQuestions.includes(questArray[i].questionID)) {
                    if (questArray.questionType == "Short Answer") {
                        selectedQuestions.push([questArray[i].questionID, "SRTA"]);
                        automaticAddedQuest.push([questArray[i].questionID, "SRTA"]);
                    } else {
                        selectedQuestions.push([questArray[i].questionID, "MLCQ"]);
                        automaticAddedQuest.push([questArray[i].questionID, "MLCQ"]);
                    }
                }
            }
        }

        document.getElementById('selectedQuestionsField').value = selectedQuestions;
        document.getElementById('unselectedQuestionsField').value = unselectedQuestions;
    }
}