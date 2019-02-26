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

var languageTools = require('./tools/language_tools');
var miscellaneousTools = require('./tools/miscellaneous');
var getQuestionsResquest = require('./questions/getQuestionsRequest');
var postQuestionsRequest = require('./questions/postQuestionsRequest');
var Question = require('./questions/question');

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'koeko_website'
});

/* GET questions page. */
router.get('/', function (req, res, next) {
    getQuestionsResquest.getQuestions(mysqlConnection, mainSubjects, allSubjects, req, res, data, translation,
        signString, signUrl, i18n, regions, resourcesTypes, questSelectedFilter, resourceIdsForUser);
});

router.post('/', upload.any(), function (req, res) {
    console.log(req.body);

    if (req.body.userRating) {
        postQuestionsRequest.saveUserRating(mysqlConnection, mainSubjects, allSubjects, req, res, data, translation,
            signString, signUrl, i18n, regions, resourcesTypes, questSelectedFilter);
    } else if (req.body.subjectFilter) {
        //handle search request
        console.log("search request");
        //reinit question array
        questionsArray = [];
        var mcqQuery = "SELECT * FROM question ";
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
                mcqArg.push(languageTools.getLanguage(req,i18n));
            } else {
                mcqQuery += " AND question.LANGUAGE = ?";
                mcqArg.push(languageTools.getLanguage(req,i18n));
            }

            mcqQuery += " LIMIT 500"
        } else if (req.body.subjectFilter == "Main subjects" && req.body.keyword != "") {
            mcqQuery = "SELECT question.*,subjects.SUBJECT FROM question ";
            mcqQuery += "WHERE QUESTION LIKE ? AND question.LANGUAGE = ?";
            mcqArg.push("%" + req.body.keyword + "%");
            mcqArg.push(languageTools.getLanguage(req,i18n));
        } else {
            mcqQuery += "WHERE question.LANGUAGE = ?";
            mcqArg.push(languageTools.getLanguage(req,i18n));
        }


        //do mysql stuffs

        // First you need to create a connection to the db
        mysqlConnection.connect(function (err) {
            if (err) throw err;

            questionsArray = [];

            mysqlConnection.query(mcqQuery, mcqArg, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    if (resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                        if (req.user && resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                            if (!req.body.selectionFilter || req.body.selectionFilter == "All questions" || req.body.selectionFilter == "My questions") {
                                if (rows[i].QUESTION_TYPE == 0) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                } else if (rows[i].QUESTION_TYPE == 1) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                } else if (rows[i].QUESTION_TYPE == 3) {
                                    var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Teaching Unit", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                                    question.mainSubject = rows[i].SUBJECT;
                                }
                                questionsArray.push(question);
                            }
                        }
                    } else {
                        if (!req.body.selectionFilter || req.body.selectionFilter == "All questions" || req.body.selectionFilter == "Other questions") {
                            if (rows[i].QUESTION_TYPE == 0) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                            } else if (rows[i].QUESTION_TYPE == 1) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                            } else if (rows[i].QUESTION_TYPE == 3) {
                                var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Teaching Unit", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                                question.mainSubject = rows[i].SUBJECT;
                            }
                            questionsArray.push(question);
                        }
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
                    language: languageTools.getLanguage(req,i18n), regions: regions, resourcesTypes: resourcesTypes, test: ""};
                translation = languageTools.setTranslation(i18n);
                res.render('questions', {
                    sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                    mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
                });
            });
        });
    } else if (req.files) {
        //insert resource into db
        console.log("insert Resource");
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
        const equivalenceId = uid;

        var filename1 = "none";
        var filename2 = "none";
        var filename3 = "none";
        var filename4 = "none";
        var imagename = "none";
        var filenames = [filename1, filename2, filename3, filename4, imagename];
        filenames = miscellaneousTools.fileTreatment(req.files[0], filenames, req);
        filenames = miscellaneousTools.fileTreatment(req.files[1], filenames, req);
        filenames = miscellaneousTools.fileTreatment(req.files[2], filenames, req);
        filenames = miscellaneousTools.fileTreatment(req.files[3], filenames, req);
        filenames = miscellaneousTools.fileTreatment(req.files[4], filenames, req);

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

        var resource = [uid, equivalenceId, typeCode, resourceTitle, resourceDescription,
            filenames[0], filenames[1], filenames[2], filenames[3], filenames[4], datetime, languageTools.getLanguage(req,i18n), user];
        var sql = "INSERT INTO question (IDENTIFIER, EQUIVALENCE_ID, QUESTION_TYPE, QUESTION, OPTION0, OPTION1, OPTION2, OPTION3, OPTION4," +
            "IMAGE_PATH, MODIF_DATE, LANGUAGE, OWNER_IDENTIFIER) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
            language: languageTools.getLanguage(req,i18n), regions: regions, resourcesTypes: resourcesTypes, test: ""};
        translation = languageTools.setTranslation(i18n);
        res.render('questions', {
            sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
            mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
        });
    } else if (req.body.selectedQuestions || req.body.unselectedQuestions) {
        //handle save changes request
        console.log("posted Save my Changes");

        //parse the post request to a 2d array for selected questions
        var questionsNotParsed = req.body.selectedQuestions.split(",");
        questionsNotParsed.shift();
        var questions = [];
        var i;
        for (i = 0; (i + 1) < questionsNotParsed.length; i = i + 2) {
            questions.push([questionsNotParsed[i], questionsNotParsed[i + 1]]);
        }
        console.log(questions);
        for (i = 0; i < questions.length; i++) {
            questions[i].push(req.user);
        }

        //parse the post request to an array for unselected questions
        var questionsUnselected = req.body.unselectedQuestions.split(",")


        //do mysql stuffs

        // First you need to create a connection to the db
        mysqlConnection.connect(function (err) {
            if (err) throw err;

            if (questions.length > 0) {
                var sql = "REPLACE INTO relation_resource_user (IDENTIFIER_RESOURCE, RESOURCE_TYPE, IDENTIFIER_USER) VALUES ?";
                mysqlConnection.query(sql, [questions], function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);
                });
            }

            if (questionsUnselected.length > 0 && questionsUnselected[0] != "") {
                var i;
                for (i = 0; i < questionsUnselected.length; i++) {
                    var sql = "DELETE FROM relation_resource_user WHERE IDENTIFIER_RESOURCE='" + questionsUnselected[i] + "' AND IDENTIFIER_USER='" + req.user + "';";
                    mysqlConnection.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("Number of records deleted: " + result.affectedRows);
                    });
                }
            }
        });


        //change the user selection for the corresponding questions in array
        var questionIDs = [];
        var i;
        for (i = 0; i < questions.length; i++) {
            questionIDs.push(questions[i][0]);
        }
        for (i = 0; i < questionsArray.length; i++) {
            if (questionIDs.indexOf(questionsArray[i].questionID) != -1) {
                questionsArray[i].userSelected = "selected.png";
            }
        }
        //same for unselected questions
        var questionIDsUnselected = [];
        for (i = 0; i < questionsUnselected.length; i++) {
            questionIDsUnselected.push(questionsUnselected[i])
        }
        for (i = 0; i < questionsArray.length; i++) {
            if (questionIDsUnselected.indexOf(questionsArray[i].questionID) != -1) {
                questionsArray[i].userSelected = "notselected.png";
            }
        }

        //sets empty string in case user is undefined
        if (req.user) {
            currentUser = req.user;
        } else {
            currentUser = "";
        }

        data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
            language: languageTools.getLanguage(req,i18n), regions: regions, resourcesTypes: resourcesTypes, test: ""};
        translation = languageTools.setTranslation(i18n);
        res.render('questions', {
            sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
            mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
        });
    } else if (req.body.testid) {
        console.log("display test");
        var test = [];
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
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else if (rows[i].QUESTION_TYPE == 1) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else {
                        var questionTypeString = miscellaneousTools.intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                } else {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else if (rows[i].QUESTION_TYPE == 1){
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else {
                        var questionTypeString = miscellaneousTools.intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                }
            }
        });

        //select data to display test name, ratings and selection
        sqlQuery = "SELECT * FROM question WHERE IDENTIFIER=" + req.body.testid;
        mysqlConnection.query(sqlQuery, function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                test.push(rows[i].QUESTION);
                test.push(req.body.testid);
                test.push(rows[i].IMAGE_PATH);
                test.push(rows[i].RATING);
            }
        });

        if (req.user) {
            sqlQuery = "SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_RESOURCE=" + req.body.testid +
                " AND IDENTIFIER_USER='" + req.user + "'";
            mysqlConnection.query(sqlQuery, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    test.push(rows[i].RATING);
                }
            });

            sqlQuery = "SELECT * FROM relation_resource_user WHERE IDENTIFIER_RESOURCE=" + req.body.testid +
                " AND IDENTIFIER_USER='" + req.user + "'";
            mysqlConnection.query(sqlQuery, function (err, rows) {
                if (err) throw err;
                if (rows.length > 0) {
                    test.push("selected");
                }
            });
        }
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
                language: languageTools.getLanguage(req,i18n), regions: regions, resourcesTypes: resourcesTypes, test: test};
            translation = languageTools.setTranslation(i18n);
            res.render('questions', {
                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
            });
        });
    } else {
        res.redirect("/questions");
    }
});

module.exports = router;