/**
 * Created by ruben on 03-Oct-16.
 */
var express = require('express');
var testmysql = require('../models/testmysql');

var test1 = function () {
};
test1.homeController = function(req, res, next) {
    res.render('index', { title: 'index' });
};
test1.test2 = function (req, res) {
    testmysql.getBezoekers(function (err, callback) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('ticketSelect', { title: 'index' });
        }
    });
};

module.exports = test1;