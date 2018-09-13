var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var multer  = require('multer');
var fs = require('fs');
var upload = multer({ dest: 'public/users_files/' })
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

var questSelectedFilter = ["All questions", "My questions", "Other questions"];
const regions = ["All Regions", "International", "Suisse (PER)"];
const resourcesTypes = ["Whole Teaching Sequence", "Evaluation / Exercise", "Activity", "Other"];   //corresponding codes: 3, 4, 5, 6
var mainSubjects = [["Main subjects", "All regions"]];
var allSubjects = ["All subjects"];
var questionsArray = [];
var resourceIdsForUser = [];
var ratingForResource = [];
var signString = "";
var signUrl = "";
var data;
var translation;
var currentUser = "";

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'koeko_website'
});

//define question object
function Question(questionID, questionText, answers, nbCorrectAnswers, questionType, imageName, rating, userSelected) {
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
}


/* GET questions page. */
router.get('/', function (req, res, next) {
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
    con.connect(function (err) {
        if (err) throw err;
        //reinitialize array
        mainSubjects = [["Main subjects", "All regions"]];
        con.query("SELECT SUBJECT, PROPERTY2 FROM subjects WHERE LANGUAGE=? AND PROPERTY1=?;", [getLanguage(req), "main"], function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                mainSubjects.push([rows[i].SUBJECT, rows[i].PROPERTY2]);
            }
        });
        allSubjects = ["All subjects"];
        con.query("SELECT SUBJECT FROM subjects WHERE LANGUAGE=? AND PROPERTY1!=?;", [getLanguage(req), "main"], function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                allSubjects.push(rows[i].SUBJECT);
            }
        });

        //get the relations between questions and user
        var ratingForResourceDictonary = {}
        if (req.user) {
            con.query("SELECT * FROM relation_resource_user WHERE IDENTIFIER_USER=?",req.user, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    resourceIdsForUser.push(rows[i].IDENTIFIER_RESOURCE)
                }
            });

            //get user rating
            con.query("SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_USER=?",req.user, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    ratingForResourceDictonary[rows[i].IDENTIFIER_RESOURCE] = rows[i].RATING
                }
            });
        }

        var sqlQuery = "SELECT t1.*,t3.SUBJECT FROM question t1 " +
            "LEFT JOIN (SELECT DISTINCT IDENTIFIER_QUESTION, IDENTIFIER_SUBJECT FROM relation_question_subject WHERE ID IN (SELECT MAX(ID) FROM relation_question_subject GROUP BY IDENTIFIER_QUESTION)) t2" +
            " ON t1.IDENTIFIER = t2.IDENTIFIER_QUESTION " +
            " LEFT JOIN subjects t3 ON t2.IDENTIFIER_SUBJECT = t3.IDENTIFIER " +
             "WHERE t1.LANGUAGE = '" + getLanguage(req) + "' LIMIT 500;";
        con.query(sqlQuery, function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (req.user && resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else if (rows[i].QUESTION_TYPE == 1) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else {
                        var questionTypeString = intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                } else {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else if (rows[i].QUESTION_TYPE == 1){
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else {
                        var questionTypeString = intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                }
            }


            if (req.user) {
                signString = i18n.__('sign out');
                signUrl = "signout";
                currentUser = req.user;
            } else {
                signString = i18n.__('sign in');
                signUrl = "signin";
                currentUser = "";
            }

            //fill array containing the rating for each question using the dictionary as source
            ratingForResource = [];
            for (var i in questionsArray) {
                if (questionsArray[i].questionID in ratingForResourceDictonary) {
                    ratingForResource.push(ratingForResourceDictonary[questionsArray[i].questionID])
                } else {
                    ratingForResource.push(0)
                }
            }
            data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
                language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
            translation = setTranslation();
            res.render('questions', {
                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
            });
        });
    });
});

router.post('/', upload.any(), function (req, res) {
    console.log(req.body)

    if (req.body.userRating) {
        //save user rating
        if (!req.user) {
            res.render('signin', {sign_in_out: signString, sign_in_out_url: signUrl});
        } else {
            //do mysql stuffs

            // First you need to create a connection to the db
            const con = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'koeko_website'
            });


            con.connect(function (err) {
                if (err) throw err;

                //first replace the user rating with the new rating
                var sql = "REPLACE INTO relation_resource_user_rating (IDENTIFIER_RESOURCE, IDENTIFIER_USER, RATING, MODIF_DATE) " +
                    "VALUES (?, ?, ?, ?)";
                var sqlArgs = [req.body.questionRated, req.user, req.body.userRating, new Date().getTime()]

                con.query(sql, sqlArgs, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);

                    //second calculate the new average rating for the question
                    var sqlGetRatings = "SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_RESOURCE = ?"
                    var sqlGetRatingsArgs = [req.body.questionRated]
                    var newRating = 0.0

                    con.query(sqlGetRatings, sqlGetRatingsArgs, function (err, rows) {
                        if (err) throw err;

                        for (i in rows) {
                            newRating += parseFloat(rows[i].RATING)
                        }
                        newRating = newRating / rows.length


                        //third insert the new rating for the question
                        var sqlSetRating = ""
                        var sqlSetRatingArgs = []

                        sqlSetRating = "UPDATE question SET RATING = ? WHERE IDENTIFIER = ? "
                        sqlSetRatingArgs = [newRating, req.body.questionRated]


                        con.query(sqlSetRating, sqlSetRatingArgs, function (err, result) {
                            if (err) throw err;

                            if (req.user) {
                                signString = i18n.__('sign out');
                                signUrl = "signout"
                                currentUser = req.user
                            } else {
                                signString = i18n.__('sign in');
                                signUrl = "signin"
                                currentUser = ""
                            }

                            var index = -1
                            for (var i in questionsArray) {
                                if (questionsArray[i].questionID == req.body.questionRated) {
                                    index = i
                                    questionsArray[i].rating = newRating
                                }
                            }
                            if (index >= 0) {
                                ratingForResource[index] = req.body.userRating
                            }

                            data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
                                language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
                            translation = setTranslation();
                            res.render('questions', {
                                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
                            });
                        });
                    });
                });
            });
        }
    } else if (req.body.subjectFilter) {
        //handle search request
        console.log("search request");
        //reinit question array
        questionsArray = [];
        var mcqQuery = "SELECT * FROM question ";
        var shrtaqArg = [];
        var mcqArg = [];

        console.log(req.body.subjectFilter);
        var mainSubFilter = req.body.mainSubjectFilter;
        if (mainSubFilter != "Main subjects" || req.body.subjectFilter != "All subjects") {
            mcqQuery = "SELECT question.*,subjects.SUBJECT FROM question ";
            var mainSubFilter = req.body.mainSubjectFilter;
            var subFilter = req.body.subjectFilter;
            if (mainSubFilter == "Main subjects") {
                mainSubFilter = "%";
            }
            if (subFilter == "All subjects") {
                subFilter = "%";
            }
            mcqQuery += "INNER JOIN `relation_question_subject` ON `question`.IDENTIFIER = `relation_question_subject`.`IDENTIFIER_QUESTION` " +
                "INNER JOIN `subjects` ON `relation_question_subject`.`IDENTIFIER_SUBJECT` = `subjects`.`IDENTIFIER` " +
                "WHERE `subjects`.`SUBJECT` LIKE ? AND `subjects`.`SUBJECT` LIKE ?";
            mcqArg.push(mainSubFilter);
            mcqArg.push(subFilter);

            if (req.body.keyword != "") {
                mcqQuery += " AND QUESTION LIKE ? AND question.LANGUAGE = ?";
                mcqArg.push("%" + req.body.keyword + "%")
                mcqArg.push(getLanguage(req));
            } else {
                mcqQuery += " AND question.LANGUAGE = ?";
                mcqArg.push(getLanguage(req));
            }

            mcqQuery += " LIMIT 500"
        } else if (req.body.subjectFilter == "Main subjects" && req.body.keyword != "") {
            mcqQuery = "SELECT question.*,subjects.SUBJECT FROM question ";
            mcqQuery += "WHERE QUESTION LIKE ? AND question.LANGUAGE = ?";
            mcqArg.push("%" + req.body.keyword + "%");
            mcqArg.push(getLanguage(req));
        } else {
            mcqQuery += "WHERE question.LANGUAGE = ?";
            mcqArg.push(getLanguage(req));
        }


        //do mysql stuffs

        // First you need to create a connection to the db
        const con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'koeko_website'
        });
        con.connect(function (err) {
            if (err) throw err;

            questionsArray = [];

            con.query(mcqQuery, mcqArg, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    if (resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                        if (req.user && resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                            if (!req.body.selectionFilter || req.body.selectionFilter == "All questions" || req.body.selectionFilter == "My questions") {
                                if (rows[i].QUESTION_TYPE == 0) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                } else if (rows[i].QUESTION_TYPE == 1) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                } else if (rows[i].QUESTION_TYPE == 3) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Teaching Unit", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                    question.mainSubject = rows[i].SUBJECT;
                                }
                                questionsArray.push(question);
                            }
                        }
                    } else {
                        if (!req.body.selectionFilter || req.body.selectionFilter == "All questions" || req.body.selectionFilter == "Other questions") {
                            if (rows[i].QUESTION_TYPE == 0) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                            } else if (rows[i].QUESTION_TYPE == 1) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                            } else if (rows[i].QUESTION_TYPE == 3) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Teaching Unit", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                                question.mainSubject = rows[i].SUBJECT;
                            }
                            questionsArray.push(question);
                        }
                    }
                }
            });

            //get user rating
            con.query("SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_USER=?",[req.user], function (err, rows) {
                if (err) throw err;

                var ratingForResourceDictonary = {}
                ratingForResource = []
                for (var i in rows) {
                    ratingForResourceDictonary[rows[i].IDENTIFIER_RESOURCE] = rows[i].RATING
                }

                if (req.user) {
                    signString = i18n.__('sign out');
                    signUrl = "signout";
                    currentUser = req.user;
                } else {
                    signString = i18n.__('sign in');
                    signUrl = "signin";
                    currentUser = "";
                }

                //fill array containing the rating for each question using the dictionary as source
                ratingForResource = [];
                for (var i in questionsArray) {
                    if (questionsArray[i].questionID in ratingForResourceDictonary) {
                        ratingForResource.push(ratingForResourceDictonary[questionsArray[i].questionID])
                    } else {
                        ratingForResource.push(0)
                    }
                }

                data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
                    language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
                translation = setTranslation();
                res.render('questions', {
                    sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                    mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
                });
            });
        });
    } else if (req.files) {
        //insert resource into db

        //code the type of resource
        var typeCode = 3;
        if (req.body.resourceType == "Evaluation / Exercise") {
            typeCode = 4;
        } else if (req.body.resourceType == "Activity") {
            typeCode = 5;
        } else if (req.body.resourceType == "Other") {
            typeCode = 6;
        }

        //format the date
        var currentdate = new Date();
        var datetime = currentdate.getUTCFullYear() + "-"
            + (currentdate.getUTCMonth()+1)  + "-"
            + currentdate.getUTCDate() + " "
            + currentdate.getUTCHours() + ":"
            + currentdate.getUTCMinutes() + ":"
            + currentdate.getUTCSeconds() + ":"
            + currentdate.getUTCMilliseconds();
        const uid = new Date().getTime();
        var filename1 = "none";
        var filename2 = "none";
        var filename3 = "none";
        var filename4 = "none";
        var imagename = "none";

        fileTreatment(req.files[0], filename1, req);
        fileTreatment(req.files[1], filename2, req);
        fileTreatment(req.files[2], filename3, req);
        fileTreatment(req.files[3], filename4, req);
        fileTreatment(req.files[4], imagename, req);

        //deal with other possibly empty fields
        var resourceTitle = "none";
        if (req.body.resourceTitle) {
            resourceTitle = req.body.resourceTitle;
        }
        var resourceDescription = "";
        if (req.body.resourceDescription) {
            resourceDescription = req.body.resourceDescription;
        }

        var user = "";
        if (req.user) {
            user = req.user;
        }

        var resource = [uid, typeCode, resourceTitle, resourceDescription,
            filename1, filename2, filename3, filename4, imagename, datetime, global.language, user];
        var sql = "INSERT INTO question (IDENTIFIER, QUESTION_TYPE, QUESTION, OPTION0, OPTION1, OPTION2, OPTION3, OPTION4," +
            "IMAGE_PATH, MODIF_DATE, LANGUAGE, OWNER_IDENTIFIER) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
        mysqlConnection.query(sql, resource, function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });

        //insert subject relation
        var args = [uid, req.body.mainSubject];
        var sql = "INSERT INTO relation_question_subject (IDENTIFIER_QUESTION, IDENTIFIER_SUBJECT) " +
            "SELECT ?,IDENTIFIER FROM subjects WHERE SUBJECT = ?";
        mysqlConnection.query(sql, args, function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });

        //sets empty string in case user is undefined
        if (req.user) {
            currentUser = req.user
        } else {
            currentUser = ""
        }

        data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
            language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
        translation = setTranslation();
        res.render('questions', {
            sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
            mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
        });
    } else if (req.body.selectedQuestions){
        //handle save changes request
        console.log("posted Save my Changes");

        //parse the post request to a 2d array for selected questions
        var questionsNotParsed = req.body.selectedQuestions.split(",")
        questionsNotParsed.shift()
        var questions = [];
        var i;
        for (i = 0; (i + 1) < questionsNotParsed.length; i = i + 2) {
            questions.push([questionsNotParsed[i], questionsNotParsed[i + 1]])
        }
        console.log(questions);
        for (i = 0; i < questions.length; i++) {
            questions[i].push(req.user)
            //questions[i].push(new Date().getTime())
        }

        //parse the post request to an array for unselected questions
        var questionsUnselected = req.body.unselectedQuestions.split(",")


        //do mysql stuffs

        // First you need to create a connection to the db
        const con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'koeko_website'
        });


        con.connect(function (err) {
            if (err) throw err;

            if (questions.length > 0) {
                var sql = "INSERT INTO relation_resource_user (IDENTIFIER_RESOURCE, RESOURCE_TYPE, IDENTIFIER_USER) VALUES ?";
                con.query(sql, [questions], function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);
                });
            }

            if (questionsUnselected.length > 0 && questionsUnselected[0] != "") {
                var i;
                for (i = 0; i < questionsUnselected.length; i++) {
                    var sql = "DELETE FROM relation_resource_user WHERE IDENTIFIER_RESOURCE='" + questionsUnselected[i] + "' AND IDENTIFIER_USER='" + req.user + "';";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("Number of records deleted: " + result.affectedRows);
                    });
                }
            }
        });


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
        //same for unselected questions
        var questionIDsUnselected = []
        for (i = 0; i < questionsUnselected.length; i++) {
            questionIDsUnselected.push(questionsUnselected[i])
        }
        for (i = 0; i < questionsArray.length; i++) {
            if (questionIDsUnselected.indexOf(questionsArray[i].questionID) != -1) {
                questionsArray[i].userSelected = "notselected.png"
            }
        }

        //sets empty string in case user is undefined
        if (req.user) {
            currentUser = req.user
        } else {
            currentUser = ""
        }

        data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
            language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
        translation = setTranslation();
        res.render('questions', {
            sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
            mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
        });
    } else if (req.body.testid) {
        console.log("display test");
        questionsArray = [];
        var sqlQuery = "SELECT t1.IDENTIFIER, t1.QUESTION_TYPE, t1.QUESTION, t1.OPTION0, t1.OPTION1, t1.OPTION2, t1.OPTION3," +
            " t1.OPTION4, t1.OPTION5, t1.OPTION6, t1.OPTION7, t1.OPTION7, t1.OPTION9, t1.NB_CORRECT_ANS, t1.IMAGE_PATH, t1.RATING FROM question t1 " +
            "INNER JOIN relation_question_question t2 ON t1.IDENTIFIER = t2.IDENTIFIER_QUESTION_1 WHERE t2.IDENTIFIER_TEST = " + req.body.testid + " " +
            "UNION DISTINCT SELECT t1.IDENTIFIER, t1.QUESTION_TYPE, t1.QUESTION, t1.OPTION0, t1.OPTION1, t1.OPTION2, t1.OPTION3," +
            " t1.OPTION4, t1.OPTION5, t1.OPTION6, t1.OPTION7, t1.OPTION7, t1.OPTION9, t1.NB_CORRECT_ANS, t1.IMAGE_PATH, t1.RATING FROM question t1 " +
            "INNER JOIN relation_question_question t2 ON t1.IDENTIFIER = t2.IDENTIFIER_QUESTION_2 WHERE t2.IDENTIFIER_TEST = " + req.body.testid;
        mysqlConnection.query(sqlQuery, function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (req.user && resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else if (rows[i].QUESTION_TYPE == 1) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else {
                        var questionTypeString = intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                } else {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else if (rows[i].QUESTION_TYPE == 1){
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else {
                        var questionTypeString = intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                }
            }
        });

        //get user rating
        mysqlConnection.query("SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_USER=?",[req.user], function (err, rows) {
            if (err) throw err;

            var ratingForResourceDictonary = {}
            ratingForResource = []
            for (var i in rows) {
                ratingForResourceDictonary[rows[i].IDENTIFIER_RESOURCE] = rows[i].RATING
            }

            if (req.user) {
                signString = i18n.__('sign out');
                signUrl = "signout";
                currentUser = req.user;
            } else {
                signString = i18n.__('sign in');
                signUrl = "signin";
                currentUser = "";
            }

            //fill array containing the rating for each question using the dictionary as source
            ratingForResource = [];
            for (var i in questionsArray) {
                if (questionsArray[i].questionID in ratingForResourceDictonary) {
                    ratingForResource.push(ratingForResourceDictonary[questionsArray[i].questionID])
                } else {
                    ratingForResource.push(0)
                }
            }

            data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
                language: getLanguage(req), regions: regions, resourcesTypes: resourcesTypes};
            translation = setTranslation();
            res.render('questions', {
                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
            });
        });
    }
});

function fileTreatment(file, filename, req) {
    if (file) {
        if (file.fieldname == "filetoupload1") {
            filename = file.filename + "***" + req.body.filename1;
        } else if (file.fieldname == "filetoupload1") {
            filename = file.filename + "***" + req.body.filename2;
        } else if (file.fieldname == "filetoupload1") {
            filename = file.filename + "***" + req.body.filename3;
        } else if (file.fieldname == "filetoupload1") {
            filename = file.filename + "***" + req.body.filename4;
        } else if (file.fieldname == "imagefile") {
            filename = file.filename;
            fs.rename("public/users_files/" + filename, "public/users_images/" + filename, function (err) {
                if (err) throw err;
            });
        }
    }
}

function intToResourceType(typeCode) {
    if (typeCode == 2) {
        return "Questions Set";
    } else if (typeCode == 3) {
        return "Whole Teaching Sequence";
    } else if (typeCode == 4) {
        return "Evaluation / Exercise";
    } else if (typeCode == 5) {
        return "Activity";
    } else {
        return "Other";
    }
}

function getLanguage(req) {
    var language = i18n.getLocale();
    if (language == "noinit") {
        language = i18n.getLocale(req);
    }
    return language;
}

function setTranslation() {
    var translation = {
        sign_up: i18n.__('sign up'),
        questions: i18n.__('questions'),
        home: i18n.__('home'),
        save_changes: i18n.__('save changes'),
        search: i18n.__('search'),
        question: i18n.__('question'),
        answer1: i18n.__('answer %s',1),
        answer2: i18n.__('answer %s',2),
        answer3: i18n.__('answer %s',3),
        answer4: i18n.__('answer %s',4),
        answer5: i18n.__('answer %s',5),
        answer6: i18n.__('answer %s',6),
        answer7: i18n.__('answer %s',7),
        answer8: i18n.__('answer %s',8),
        answer9: i18n.__('answer %s',9),
        answer10: i18n.__('answer %s',10),
        question_type: i18n.__('question type'),
        picture: i18n.__('picture'),
        rating: i18n.__('rating'),
        my_questions: i18n.__('my questions'),
        load_more_questions: i18n.__('load more questions'),
        type: i18n.__('type'),
        average_rating: i18n.__('average rating'),
        your_rating: i18n.__('your rating'),
        submit_my_rating: i18n.__('submit my rating'),
        select_question: i18n.__('select question')
    };
    return translation
}

function setAnswers(row) {
    var answers = [];
    if (row.OPTION0 != " ") {
        answers.push(row.OPTION0);
    }
    if (row.OPTION1 != " ") {
        answers.push(row.OPTION1);
    }
    if (row.OPTION2 != " ") {
        answers.push(row.OPTION2);
    }
    if (row.OPTION3 != " ") {
        answers.push(row.OPTION3);
    }
    if (row.OPTION4 != " ") {
        answers.push(row.OPTION4);
    }
    if (row.OPTION5 != " ") {
        answers.push(row.OPTION5);
    }
    if (row.OPTION6 != " ") {
        answers.push(row.OPTION6);
    }
    if (row.OPTION7 != " ") {
        answers.push(row.OPTION7);
    }
    if (row.OPTION8 != " ") {
        answers.push(row.OPTION8);
    }
    if (row.OPTION9 != " ") {
        answers.push(row.OPTION9);
    }
    return answers;
}

module.exports = router;