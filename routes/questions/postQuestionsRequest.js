var questionImport = require('./question');
var miscellaneousTools = require('../tools/miscellaneous');
var languageTools = require('../tools/language_tools');

module.exports = {
    saveUserRating: function(mysqlConnection, mainSubjects, allSubjects, req, res, data, translation,
                             signString, signUrl, i18n, regions, resourcesTypes, questSelectedFilter) {
        //save user rating
        console.log("save user rating");
        if (!req.user) {
            res.render('signin', {sign_in_out: signString, sign_in_out_url: signUrl});
        } else {
            //do mysql stuffs

            mysqlConnection.connect(function (err) {
                if (err) throw err;

                //first replace the user rating with the new rating
                var sql = "REPLACE INTO relation_resource_user_rating (IDENTIFIER_RESOURCE, IDENTIFIER_USER, RATING, MODIF_DATE) " +
                    "VALUES (?, ?, ?, ?)";
                var sqlArgs = [req.body.questionRated, req.user, req.body.userRating, new Date().getTime()]

                mysqlConnection.query(sql, sqlArgs, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);

                    //second calculate the new average rating for the question
                    var sqlGetRatings = "SELECT * FROM relation_resource_user_rating WHERE IDENTIFIER_RESOURCE = ?"
                    var sqlGetRatingsArgs = [req.body.questionRated];
                    var newRating = 0.0;

                    mysqlConnection.query(sqlGetRatings, sqlGetRatingsArgs, function (err, rows) {
                        if (err) throw err;

                        for (i in rows) {
                            newRating += parseFloat(rows[i].RATING)
                        }
                        newRating = newRating / rows.length;


                        //third insert the new rating for the question
                        var sqlSetRating = "UPDATE question SET RATING = ? WHERE IDENTIFIER = ? "
                        var sqlSetRatingArgs = [newRating, req.body.questionRated];


                        mysqlConnection.query(sqlSetRating, sqlSetRatingArgs, function (err, result) {
                            if (err) throw err;

                            if (req.user) {
                                signString = i18n.__('sign out');
                                signUrl = "signout";
                                currentUser = req.user;
                            } else {
                                signString = i18n.__('sign in');
                                signUrl = "signin";
                                currentUser = "";
                            }

                            var index = -1
                            for (var i in questionsArray) {
                                if (questionsArray[i].questionID == req.body.questionRated) {
                                    index = i;
                                    questionsArray[i].rating = newRating;
                                }
                            }
                            if (index >= 0) {
                                ratingForResource[index] = req.body.userRating;
                            }

                            data = {questions: questionsArray, currentUser: currentUser, ratingForResource: ratingForResource,
                                language: languageTools.getLanguage(req,i18n), regions: regions, resourcesTypes: resourcesTypes, testName: ""};
                            translation = languageTools.setTranslation(i18n);
                            res.render('questions', {
                                sign_in_out: signString, sign_in_out_url: signUrl, translation: translation, data: data,
                                mainSubjects: mainSubjects, allSubjects: allSubjects, questSelectedFilter: questSelectedFilter
                            });
                        });
                    });
                });
            });
        }
    }
};