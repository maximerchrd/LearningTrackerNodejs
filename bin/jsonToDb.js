var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mysql = require('mysql');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//POST request
router.post('*', function(req, res) {
    console.log("received something:" + req);
}