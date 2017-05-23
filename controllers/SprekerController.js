/**
 * Created by ruben on 11/10/2016.
 */
var express = require('express');
var qr = require('qr-image');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);


var spreker = require('../models/tijdSlot');

var sprekerController = function ()  {};
sprekerController.sprekerContact = function (req, res) {
    var post = {
        onderwerp: req.body.onderwerp,
        bericht: req.body.bericht
    };
    sendgrid.send({
        to: req.body.toEmail,
        from: 'organisatie@projectRubenSoerdien.nl',
        subject: post.onderwerp,
        html : post.bericht + '<br><br> beantwoord deze email naar: '+ req.body.email

    }, function (err, json) {
        if (err) {
            return console.error(err);
        }
        sendgrid.send({
            to: req.body.email,
            from: 'organisatie@projectRubenSoerdien.nl',
            subject: post.onderwerp,
            html: 'geachte heer/mevrouw, <br> uw bericht is ontvangen, u zult zo snel mogelijk antwoord krijgen van de spreker. '

        }, function (err, json) {
            if (err) {
                return console.error(err);
            }
        });
    });

    res.render('error2', {message:'gelukt!',session:req.session});
};

sprekerController.agenda = function (req, res) {
    spreker.getSlots(req.params.dag,function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            res.render('sprekerAgenda', {dag:req.params.dag,rows: callback,session:req.session});
        }
    });
};
sprekerController.programma = function (req, res) {
    spreker.programma(1,function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            res.render('programma', {rows: callback,session:req.session});
        }
    });
};
sprekerController.vraagAanSlot = function (req, res) {
    var post = {
        naam: req.body.naam,
        email: req.body.email,
        omschrijving: req.body.omschrijving,
        onderwerp: req.body.onderwerp,
        slot1: req.body.slot1 + '' + req.body.dag,
        slot2: req.body.slot2 + '' + req.body.dag,
        slot3: req.body.slot3 + '' + req.body.dag,
        dag: req.body.dag
    };
    spreker.vraagAan(post, function (err, callback) {
        if (err) {
            throw err;
        }
        else {
            var text2 = "u heeft sloten aangevraagd, u zult zo snel mogelijk antwoord krijgen op uw aanvraag.";
            sendgrid.send({
                to: req.body.email,
                from: 'info@projectRubenSoerdien.nl',
                subject: 'Aanvraag tijdslot project conferentie',
                text: 'Beste ' + req.body.naam + '\n' + text2
            }, function (err, json) {
                if (err) {
                    return console.error(err);
                }
                console.log(callback.insertId);
            });
            res.render('error2',{message:'gelukt, u zult nu een mail ontvangen en een wanneer deze is geaccepteerd',session:req.session});
        }
    });

};
sprekerController.reserveerSpreker = function (req, res) {
    var tijdzaal = ''+req.body.tijdzaal.charAt(0) + req.body.tijdzaal.charAt(1);
    post = {
        idTicket: req.body.id,
        idSlot: req.params.id,
        dag: req.body.dag,
        tijdzaal: tijdzaal
    };
    spreker.reserveerSpreker(post, function (err, result) {
        if (err)console.log(err);

        else {
            if(result === 1){
                res.render('error2',{message:'alles gelukt',session:req.session});
            }
            if(result === 2){
                res.render('error2',{message:'Je hebt al 4 presentaties op die dag gekozen',session:req.session});
            }
            if(result === 3){
                res.render('error2',{message:'Deze presentatie is vol, je kan er niet meer voor reserveren',session:req.session});
            }
            if(result === 4){
                res.render('error2',{message:'Je hebt al een presentatie op het zelfde tijdstip',session:req.session});
            }
        }
    });
};
sprekerController.showSpreker = function (req, res) {

};
sprekerController.showSpreker = function (req, res) {
    var spreker1 = {
        "naam": "ruben",
        "onderwerp": "html4",
        "omschrijving": "balblab balb l balbalablab",
        "dag": "zaterdag",
        "tijd": "12:00",
        "zaal": 1,
        "plaatsen": 75
    };

    spreker.getSlot(req.params.id, function (err, result) {
        if (err)console.log('uh');

        else {

            var dag = ['vrijdag', 'zaterdag', 'zondag'];
            var tijd = '' + result.spreker[0].tijdZaalNummer.charAt(0) + result.spreker[0].tijdZaalNummer.charAt(1) + ':00';
            var zaal = '' + result.spreker[0].tijdZaalNummer.charAt(2);
            var tijdzaal = result.spreker[0].tijdZaalNummer;
            resultSpreker = {
                naam: result.spreker[0].naam,
                onderwerp: result.spreker[0].onderwerp,
                omschrijving: result.spreker[0].omschrijving,
                tijd: tijd,
                zaal: zaal,
                dag: dag[result.spreker[0].dag],
                dag2: result.spreker[0].dag,
                plaatsen: (75 - result.aantal),
                tijdzaal: tijdzaal,
                reserveerbaar: result.spreker[0].reserveerbaar,
                email: result.spreker[0].email
            };
            if (result.spreker.length != 1) {
                res.render('error2', {message: "geen presentatie gevonden met dat id",session:req.session});
            }
            else {
                //res.send(result);
                res.render('spreker', {spreker: resultSpreker,session:req.session});
            }
        }
    });
};

module.exports = sprekerController;