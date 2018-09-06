function setRating (stars, rating) {
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
}

function rateNStars(nStars, question) {
    document.getElementById('userRating').value = nStars
    document.getElementById('questionRated').value = question.questionID;
    document.getElementById('questionType').value = question.questionType;
    rateButton.disabled = false;
    var ustars = ['ustar1', 'ustar2', 'ustar3', 'ustar4', 'ustar5'];
    setRating(ustars, nStars);
}

function rateResourceNStars(nStars, question) {
    document.getElementById('ruserRating').value = nStars
    document.getElementById('rquestionRated').value = question.questionID;
    document.getElementById('rquestionType').value = question.questionType;
    rateButton.disabled = false;
    var ustars = ['rustar1', 'rustar2', 'rustar3', 'rustar4', 'rustar5'];
    setRating(ustars, nStars);
}