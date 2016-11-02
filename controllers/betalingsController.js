var express = require('express');
var sendgrid = require('sendgrid')("rubennaatje",  process.env.wachtwoordSendGrid);

var fs = require('fs');
/**
 * Created by ruben on 04-Oct-16.
 */
/**
 * Created by ruben on 03-Oct-16.
 */
var path = require('path');

var qr = require('qr-image');

var ticket = require('../models/ticket');

var betalingsController = function () {
};
betalingsController.first = function (req, res, next) {
    ticket.getAvailableTickets( function (err, callback) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(callback);
            res.render('ticketSelect', {title: 'index', tickets: callback});
        }
    });

};

betalingsController.tweede = function (req, res) {
    var ticketSoortenParse = {1: "passe partout", 2: "vrijdag", 3: "zaterdag", 4: "zondag", 5: "vrijdag en zaterdag"};
    var post = {soortTicket: ticketSoortenParse[req.body.ticket], ticketSoortNummer: req.body.ticket};
    res.render('ticketForm', {ticketSoort: post.soortTicket, ticketNummer: post.ticketSoortNummer});
};
betalingsController.derde = function (req, res) {
    var ticketSoortenParse = {1: "passe partout", 2: "vrijdag", 3: "zaterdag", 4: "zondag", 5: "vrijdag en zaterdag"};
    var post = {
        naam: req.body.naam,
        email: req.body.email,
        soortTicket: ticketSoortenParse[req.body.aantalTickets],
        aantalTicketsNummer: req.body.aantalTickets,
        dinner: req.body.dinner,
        lunch: req.body.lunch
    };
    ticket.buyTicket(post, function (err, callback) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(callback);
            ticket.getTickets({orderId: callback.orderId}, function (err, callback2) {
                if (err) {
                    console.log(err);
                }
                else {
                    var ticketids = '';
                    for(var i = 0; i < callback.result.length;i++){
                        ticketids += ', '+callback.result[i] ;
                    }
                    console.log(ticketids + 'ticketids');
                    setTimeout(function(){
                    fs.readFile('./out.pdf', function(err, data) {
                        if(err){
                            console.log(err);
                        }
                            console.log(data);
                        sendgrid.send({
                            to: req.body.email,
                            from: 'info@projectRubenSoerdien.nl',
                            subject: 'Uw tickets voor de conferentie!!',
                            text: 'Beste ' + req.body.naam + ticketids+'\n ' + 'hier zijn uw tickets in de bijlage.',
                            files     : [{filename: 'Report.pdf', content: new Buffer(data.toString('base64'), 'base64'), contentType: 'application/pdf'}]

                        }, function (err, json) {
                            if (err) {
                                console.log(path.resolve(process.cwd(), 'out.pdf' ));
                                return console.error(err);
                            }
                            console.log(callback.insertId);
                        });
                        //res.send(callback);
                        res.render('betaald');

                        });
                    },3000);
                }

            });
        }
    });
};
betalingsController.vierde = function (req, res) {

    ticket.getTickets({orderId: 23}, function (err, callback) {
        if (err) {
            console.log(err);
        }
        else {
            res.send('nice');
        }
    });
};
betalingsController.xd = function (req, res) {

    ticket.getAvailableTickets( function (err, callback) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(callback);
            var b = callback[1];
            res.sendStatus(b);
        }
    });
};
    module.exports = betalingsController;