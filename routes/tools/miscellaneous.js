module.exports = {
    fileTreatment: function (file, filenames, req) {
        if (file) {
            if (file.fieldname == "filetoupload1") {
                filenames[0] = file.filename + "___" + req.body.filename1.replace(" ", "_");
                fs.rename("public/users_files/" + file.filename, "public/users_files/" + filenames[0], function (err) {
                    if (err) throw err;
                });
            } else if (file.fieldname == "filetoupload1") {
                filenames[1] = file.filename + "___" + req.body.filename2.replace(" ", "_");
                fs.rename("public/users_files/" + file.filename, "public/users_files/" + filenames[1], function (err) {
                    if (err) throw err;
                });
            } else if (file.fieldname == "filetoupload1") {
                filenames[2] = file.filename + "___" + req.body.filename3.replace(" ", "_");
                fs.rename("public/users_files/" + file.filename, "public/users_files/" + filenames[2], function (err) {
                    if (err) throw err;
                });
            } else if (file.fieldname == "filetoupload1") {
                filenames[3] = file.filename + "___" + req.body.filename4.replace(" ", "_");
                fs.rename("public/users_files/" + file.filename, "public/users_files/" + filenames[3], function (err) {
                    if (err) throw err;
                });
            } else if (file.fieldname == "imagefile") {
                filenames[4] = file.filename.replace(" ", "_");
                fs.rename("public/users_files/" + file.filename, "public/users_images/" + filenames[4], function (err) {
                    if (err) throw err;
                });
            }
            return filenames;
        } else {
            return filenames;
        }
    },

    intToResourceType: function (typeCode) {
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
    },

    setAnswers: function (row) {
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
};