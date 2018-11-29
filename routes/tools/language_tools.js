module.exports = {
    getLanguage: function (req, i18n) {
        var language = i18n.getLocale();
        if (language == "noinit") {
            language = i18n.getLocale(req);
        }
        return language;
    },
    setTranslation: function (i18n) {
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
};