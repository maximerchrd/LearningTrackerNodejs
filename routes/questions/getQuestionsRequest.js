var questionImport = require('./question');
var miscellaneousTools = require('../tools/miscellaneous');
var languageTools = require('../tools/language_tools');

module.exports = {
    getQuestions: function (mysqlConnection, mainSubjects, allSubjects, req, res, data, translation,
                            signString, signUrl, i18n, regions, resourcesTypes, questSelectedFilter, resourceIdsForUser) {
        //reinit question array
        questionsArray = [];


        //reinitialize array
        mainSubjects = [["Main subjects", "All regions"]];
        mysqlConnection.query("SELECT SUBJECT, PROPERTY2 FROM subjects WHERE LANGUAGE=? AND PROPERTY1=?;",
            [languageTools.getLanguage(req, i18n), "main"], function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    mainSubjects.push([rows[i].SUBJECT, rows[i].PROPERTY2]);
                }
            });
        allSubjects = ["All subjects"];
        mysqlConnection.query("SELECT SUBJECT FROM subjects WHERE LANGUAGE=? AND PROPERTY1!=?;",
            [languageTools.getLanguage(req, i18n), "main"], function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    allSubjects.push(rows[i].SUBJECT);
                }
            });

        //get the relations between questions and user
        var ratingForResourceDictonary = {}
        if (req.user) {
            mysqlConnection.query("SELECT * FROM relation_resource_user WHERE IDENTIFIER_USER=?", req.user, function (err, rows) {
                if (err) throw err;
                for (var i in rows) {
                    resourceIdsForUser.push(rows[i].IDENTIFIER_RESOURCE)
                }
            });

            //get user rating
            mysqlConnection.query("SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_USER=?", req.user, function (err, rows) {
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
            "WHERE t1.LANGUAGE = '" + languageTools.getLanguage(req, i18n) + "' LIMIT 500;";
        mysqlConnection.query(sqlQuery, function (err, rows) {
            if (err) throw err;
            for (var i in rows) {
                if (req.user && resourceIdsForUser.indexOf(rows[i].IDENTIFIER) != -1) {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else if (rows[i].QUESTION_TYPE == 1) {
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                    } else {
                        var questionTypeString = miscellaneousTools.intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "selected.png");
                        question.mainSubject = rows[i].SUBJECT;
                        if (req.user == rows[i].OWNER_IDENTIFIER) {
                            question.editAvailable = true;
                        }
                    }
                    questionsArray.push(question);
                } else {
                    if (rows[i].QUESTION_TYPE == 0) {
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Multiple Choice", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else if (rows[i].QUESTION_TYPE == 1) {
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, "Short Answer", rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
                    } else {
                        var questionTypeString = miscellaneousTools.intToResourceType(rows[i].QUESTION_TYPE);
                        var question = new questionImport.Question(rows[i].IDENTIFIER, rows[i].QUESTION, miscellaneousTools.setAnswers(rows[i]), rows[i].NB_CORRECT_ANS, questionTypeString, rows[i].IMAGE_PATH, rows[i].RATING, "notselected.png");
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
            data = {
                questions: questionsArray,
                currentUser: currentUser,
                ratingForResource: ratingForResource,
                language: languageTools.getLanguage(req, i18n),
                regions: regions,
                resourcesTypes: resourcesTypes,
                test: ""
            };
            translation = languageTools.setTranslation(i18n);
            res.render('questions', {
                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
            });
        });
    }
};