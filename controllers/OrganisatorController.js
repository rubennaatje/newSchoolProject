/**
 * Created by ruben on 12/10/2016.
 */
/**
 * Created by ruben on 11/10/2016.
 */
var express = require('express');
var qr = require('qr-image');

var sendgrid = require('sendgrid')("rubennaatje", process.env.wachtwoordSendGrid);


var organisator = require('../models/Organisator');

var organisatorController = function () {
};

organisatorController.login = function(req, res) {
    var post = {
      "email":req.body.email, 
      "wachtwoord":req.body.wachtwoord 
    };
    organisator.logIn(post,function (error,callback) {
        if(error){
            throw error;
        }
        else if(callback == false){
            res.render('login',{message:"Fout wachtwoord/email combinatie ",session:req.session});
        }
        else {
            req.session.email = req.body.email;
            organisator.bekijkAanvragen(function (error,callback) {
                if(error){
                    throw error;
                }
                else {
                    console.log(callback);
                    res.render('organisatorHome',{aanvragen:callback,session:req.session});
                }
            });
        }
    });

};
organisatorController.logout = function(req, res) {
    req.session.destroy(function(err) {

    });
    res.render('error2',{message:"Je bent uitgelogd",session:req.session});

};
organisatorController.loginForm = function(req, res) {
    if (typeof(req.session.email) == "undefined"||typeof(req.session.email) == "null") {
        res.render('login',{session:req.session});
    }
    else {
        res.render('error2',{message:"Je bent al ingelogd als "+req.session.email ,status: null, link: '/logout', linkTest: 'klik hier om uit te loggen',session:req.session});
    }

};
organisatorController.aanvragen = function (req,res) {
    organisator.bekijkAanvragen(function (error,callback) {
        if(error){
            throw error;
        }
        else {
            console.log(callback);
            res.render('organisatorHome',{aanvragen:callback,session:req.session});
        }
    });
};
organisatorController.updatenAanvraag = function (req,res) {
    var post = {
        email:req.params.spreker,
        tijdZaalNummer: req.params.id
    };
    organisator.updateAanvraag(post,function (error,callback) {
        if(error){
            throw error;
        }
        else {
            console.log(callback);
            res.send(callback);
        }
    });

};
//Database is aangemaakt. Het wachtwoord voor databasegebruiker u246741079_admin is tester database: 246741079_test

organisatorController.home = function (req,res) {
    res.render('organisatorHome2',{session:res.session});
};
organisatorController.mailReservatie = function (req,res) {
    var post = {
        onderwerp: req.body.onderwerp,
        bericht: req.body.bericht
    };

    //res.render('organisatorHome2',{session:res.session});
    organisator.updateReservatie(function (error,callback) {
        if(error){
            throw error;
        }
        else {
            var emails = [];
            for(var i = 0; i<callback.length;i++){
                emails.push(callback[i].email);
            }

            console.log(callback);
            res.send(emails);
            sendgrid.send({
                to: emails,
                from: 'info@projectRubenSoerdien.nl',
                subject: post.onderwerp,
                text: post.bericht

            }, function (err, json) {
                if (err) {
                    return console.error(err);
                }
                console.log(json);
                console.log(emails);
            });
        }
    });
};
module.exports = organisatorController;