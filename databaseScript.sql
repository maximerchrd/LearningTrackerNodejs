DROP DATABASE IF EXISTS koeko_website;
CREATE DATABASE koeko_website;
USE koeko_website;
CREATE TABLE IF NOT EXISTS multiple_choice_questions (ID INT NOT NULL AUTO_INCREMENT, IDENTIFIER VARCHAR(15),
    DIFFICULTY_LEVEL DOUBLE,
    QUESTION TEXT NOT NULL,
    OPTION0 TEXT,OPTION1 TEXT, OPTION2 TEXT,OPTION3 TEXT,OPTION4 TEXT ,OPTION5 TEXT,
    OPTION6 TEXT,OPTION7 TEXT,OPTION8 TEXT,OPTION9 TEXT,
    NB_CORRECT_ANS INT,
    IMAGE_PATH TEXT,
    RATING FLOAT,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS short_answer_questions (ID INT NOT NULL AUTO_INCREMENT, IDENTIFIER VARCHAR(15),
    DIFFICULTY_LEVEL DOUBLE,
    QUESTION TEXT NOT NULL,
    IMAGE_PATH TEXT,
    MODIF_DATE TEXT,
    RATING FLOAT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS users (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    username VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    password VARCHAR(100) NOT NULL,
    UNIQUE (username),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS answer_options (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    ANSWER_OPTION TEXT,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS learning_objectives (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    OBJECTIVE TEXT,
    LEVEL_COGNITIVE_ABILITY INT,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS subjects (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    SUBJECT TEXT,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS tests (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    TITLE TEXT,
    TEST_MODE INT,
    DIFFICULTY_LEVEL DOUBLE,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS languages (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    LANGUAGE TEXT,
    MODIF_DATE TEXT,
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_test_learning_objectives (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_TEST VARCHAR(15),
    IDENTIFIER_LEARNING_OBJECTIVE VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_TEST, IDENTIFIER_LEARNING_OBJECTIVE),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_question_answer_option (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_QUESTION VARCHAR(15),
    IDENTIFIER_ANSWER_OPTION VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_QUESTION, IDENTIFIER_ANSWER_OPTION),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_question_objective (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_QUESTION VARCHAR(15),
    IDENTIFIER_LEARNING_OBJECTIVE VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_QUESTION, IDENTIFIER_LEARNING_OBJECTIVE),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_question_question (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_QUESTION_1 VARCHAR(15),
    IDENTIFIER_QUESTION_2 VARCHAR(15),
    IDENTIFIER_TEST VARCHAR(15),
    RELATION_CONDITION TEXT,
    CONSTRAINT unq UNIQUE (IDENTIFIER_QUESTION_1, IDENTIFIER_QUESTION_2, IDENTIFIER_TEST),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_question_subject (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_QUESTION VARCHAR(15),
    IDENTIFIER_SUBJECT VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_QUESTION, IDENTIFIER_SUBJECT),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_question_test (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_QUESTION VARCHAR(15),
    IDENTIFIER_TEST VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_QUESTION, IDENTIFIER_TEST),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_subject_subject (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    IDENTIFIER_SUBJECT_1 VARCHAR(15),
    IDENTIFIER_SUBJECT_2 VARCHAR(15),
    CONSTRAINT unq UNIQUE (IDENTIFIER_SUBJECT_1, IDENTIFIER_SUBJECT_2),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_resource_user (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER VARCHAR(15),
    RESOURCE_TYPE VARCHAR(4),
    IDENTIFIER_RESOURCE VARCHAR(15),
    IDENTIFIER_USER VARCHAR(15),
    MODIF_DATE TEXT,
    CONSTRAINT unq UNIQUE (IDENTIFIER_RESOURCE, IDENTIFIER_USER),
    PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS relation_resource_user_rating (ID INT NOT NULL AUTO_INCREMENT,
    IDENTIFIER_RESOURCE VARCHAR(15),
    IDENTIFIER_USER VARCHAR(15),
    RATING INT,
    MODIF_DATE TEXT,
    CONSTRAINT unq UNIQUE (IDENTIFIER_RESOURCE, IDENTIFIER_USER),
    PRIMARY KEY (ID));



INSERT INTO multiple_choice_questions (QUESTION,OPTION0,OPTION1,OPTION2,OPTION3,OPTION4,OPTION5,OPTION6,OPTION7,OPTION8,OPTION9,NB_CORRECT_ANS,IMAGE_PATH,RATING,IDENTIFIER)
VALUES("What alternative to mice experimentation was recently improved by the EPFL?",
"nematodes","monkeys","rats","bacterias","cats","","","","","","1","app-image_1.jpg","4.64","123456789101237");

INSERT INTO short_answer_questions (QUESTION,IMAGE_PATH,RATING,IDENTIFIER)
VALUES("What are the closest planets to earth?","goal.jpg","4","123456789101230");

INSERT INTO short_answer_questions (QUESTION,IMAGE_PATH,RATING,IDENTIFIER)
VALUES("Try to answer nothing to this","goal.jpg","2.36","223456789101230");

INSERT INTO answer_options (ANSWER_OPTION,IDENTIFIER)
VALUES("Venus","123456789101231");

INSERT INTO answer_options (ANSWER_OPTION,IDENTIFIER)
VALUES("Mars","123456789101232");

INSERT INTO relation_question_answer_option (IDENTIFIER_QUESTION,IDENTIFIER_ANSWER_OPTION)
VALUES("123456789101230","123456789101231");

INSERT INTO relation_question_answer_option (IDENTIFIER_QUESTION,IDENTIFIER_ANSWER_OPTION)
VALUES("123456789101230","123456789101232");

INSERT INTO subjects (SUBJECT,IDENTIFIER)
VALUES("Astronomy","123456789101233");

INSERT INTO subjects (SUBJECT,IDENTIFIER)
VALUES("Biology","123456789101234");

INSERT INTO learning_objectives (OBJECTIVE,LEVEL_COGNITIVE_ABILITY,IDENTIFIER)
VALUES("The student is able to remember the names of the planets in the solar system and has an idea of their location","1","123456789101235");

INSERT INTO learning_objectives (OBJECTIVE,LEVEL_COGNITIVE_ABILITY,IDENTIFIER)
VALUES("Is interested into science and keeps up with the news","2","123456789101236");

INSERT INTO relation_question_subject (IDENTIFIER_QUESTION,IDENTIFIER_SUBJECT)
VALUES("123456789101237","12345678910124");

INSERT INTO relation_question_subject (IDENTIFIER_QUESTION,IDENTIFIER_SUBJECT)
VALUES("123456789101230","123456789101233");

INSERT INTO relation_question_objective (IDENTIFIER_QUESTION,IDENTIFIER_LEARNING_OBJECTIVE)
VALUES("123456789101237","123456789101236");

INSERT INTO relation_question_objective (IDENTIFIER_QUESTION,IDENTIFIER_LEARNING_OBJECTIVE)
VALUES("123456789101230","123456789101235");

INSERT INTO users(IDENTIFIER, username,email,password) VALUES ("AJDkdneDqwifhdn", "Ali Baba", "alibaba@mail.com","$2a$12$8.qr34yWBP9SNWF5dl4ji.SRpbrxstLQMUsP1C8az1x7b6N00t3/q");


delimiter //

CREATE procedure koeko_website.repeat_loop_example()
wholeblock:BEGIN
  DECLARE x INT;
  DECLARE y INT;
  DECLARE str VARCHAR(255);
  SET x = 20000;
  SET str = '';

  REPEAT
    SET x = x - 1;
    SET y = x % 5;
    INSERT INTO multiple_choice_questions (QUESTION,OPTION0,OPTION1,OPTION2,OPTION3,OPTION4,OPTION5,OPTION6,OPTION7,OPTION8,OPTION9,NB_CORRECT_ANS,IMAGE_PATH,RATING,IDENTIFIER)
        VALUES(x,
        "nematodes","monkeys","rats","bacterias","cats","","","","","","1","app-image_1.jpg",y,x);
    UNTIL x <= 0
  END REPEAT;
END//
call repeat_loop_example();