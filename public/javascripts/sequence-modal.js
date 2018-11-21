function setModalValues(question, userRating, user) {
    var resourceTitle = document.getElementById("resourceTitle");
    var resourceType = document.getElementById("resourceType");
    var resourceDescription = document.getElementById("resourceDescription");
    var mainSubject = document.getElementById("mainSubject");
    var filename1 = document.getElementById("filename1");
    var filename2 = document.getElementById("filename2");
    var filename3 = document.getElementById("filename3");
    var filename4 = document.getElementById("filename4");
    var file1 = document.getElementById("filetoupload1");
    var file2 = document.getElementById("filetoupload2");
    var file3 = document.getElementById("filetoupload3");
    var file4 = document.getElementById("filetoupload4");
    var download1 = document.getElementById("download1");
    var download2 = document.getElementById("download2");
    var download3 = document.getElementById("download3");
    var download4 = document.getElementById("download4");

    resourceTitle.value = question.questionText;
    if (question.questionType == 3) {
        resourceType.value = "Whole Teaching Sequence";
    } else if (question.questionType == 4) {
        resourceType.value = "Evaluation / Exercise";
    }
    if (question.answers[0]) {
        resourceDescription.value = question.answers[0];
    }
    if (question.mainSubject) {
        mainSubject.value = question.mainSubject;
    }
    if (question.answers[1] && question.answers[1] != "none") {
        filename1.value = question.answers[1].split("___")[1];
        download1.innerHTML = question.answers[1].split("___")[1];
        download1.download = question.answers[1].split("___")[1];
        download1.href = "users_files/" + question.answers[1].split("___")[0];
    }
    if (question.answers[2] && question.answers[2] != "none") {
        filename2.value = question.answers[2].split("___")[1];
        download2.innerHTML = question.answers[2].split("___")[1];
        download2.download = question.answers[2].split("___")[1];
        download2.href = "users_files/" + question.answers[2].split("___")[0];
    }
    if (question.answers[3] && question.answers[3] != "none") {
        filename3.value = question.answers[3].split("___")[1];
        download3.innerHTML = question.answers[3].split("___")[1];
        download3.download = question.answers[3].split("___")[1];
        download3.href = "users_files/" + question.answers[3].split("___")[0];
    }
    if (question.answers[4] && question.answers[4] != "none") {
        filename4.value = question.answers[4].split("___")[1];
        download4.innerHTML = question.answers[4].split("___")[1];
        download4.download = question.answers[4].split("___")[1];
        download4.href = "users_files/" + question.answers[4].split("___")[0];
    }

    //set the average rating
    var stars = ['rstar1', 'rstar2', 'rstar3', 'rstar4', 'rstar5'];
    setRating(stars, question.rating);

    //set the user rating
    var ustars = ['rustar1', 'rustar2', 'rustar3', 'rustar4', 'rustar5'];
    setRating(ustars, userRating);

    //make resource editable if user = resource owner
    if (question.editAvailable) {
        document.getElementById("edit-button").style.visibility = "visible";
    }

    if (user == "") {
        document.getElementById("rSubmitRating").disabled = true;
        document.getElementById("rSubmitRating").style.background = "#A9F5D0";
    }
}

function rateResource1Stars() {
    rateResourceNStars(1, questionsArray[currentQuestionIndex]);
}
function rateResource2Stars() {
    rateResourceNStars(2, questionsArray[currentQuestionIndex]);
}
function rateResource3Stars() {
    rateResourceNStars(3, questionsArray[currentQuestionIndex]);
}
function rateResource4Stars() {
    rateResourceNStars(4, questionsArray[currentQuestionIndex]);
}
function rateResource5Stars() {
    rateResourceNStars(5, questionsArray[currentQuestionIndex]);
}

function startEditResource() {
    document.getElementById("filename1").style.visibility = "visible";
    document.getElementById("filename2").style.visibility = "visible";
    document.getElementById("filename3").style.visibility = "visible";
    document.getElementById("filename4").style.visibility = "visible";
    document.getElementById("filetoupload1").style.visibility = "visible";
    document.getElementById("filetoupload2").style.visibility = "visible";
    document.getElementById("filetoupload3").style.visibility = "visible";
    document.getElementById("filetoupload4").style.visibility = "visible";
    document.getElementById("download1").style.visibility = "hidden";
    document.getElementById("download2").style.visibility = "hidden";
    document.getElementById("download3").style.visibility = "hidden";
    document.getElementById("download4").style.visibility = "hidden";
    document.getElementById("edit-button").style.visibility = "hidden";
    document.getElementById("imageFileLabel").style.visibility = "visible";
    document.getElementById("imagefile").style.visibility = "visible";
    document.getElementById("createResource").style.visibility = "visible";

    document.getElementById("resourceTitle").disabled = false;
    document.getElementById("resourceType").disabled = false;
    document.getElementById("resourceDescription").disabled = false;
    document.getElementById("mainSubject").disabled = false;
}