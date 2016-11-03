/**
 * Created by ruben on 12/10/2016.
 */
/**
 * Created by ruben on 11/10/2016.
 */
var express = require('express');
var qr = require('qr-image');

var sendgrid = require('sendgrid')("rubennaatje", process.env.wachtwoordSendGrid);
var fs = require('fs');

var organisator = require('../models/Organisator');
var ticket = require('../models/ticket');

var organisatorController = function () {
};
organisatorController.contact = function (req, res) {
    res.render('contactPagina', {session: req.session})
};
organisatorController.stuurContact = function (req, res) {
    var post = {
        onderwerp: req.body.onderwerp,
        bericht: req.body.bericht
    };
    sendgrid.send({
        to: 'ruben.soerdien@hotmail.com',
        from: req.body.email,
        subject: post.onderwerp,
        text: post.bericht

    }, function (err, json) {
        if (err) {
            return console.error(err);
        }
    });
    sendgrid.send({
        to: req.body.email,
        from: 'organisatie@projectRubenSoerdien.nl',
        subject: post.onderwerp,
        html: 'geachte heer/mevrouw, <br> uw bericht is ontvangen, u zult zo snel mogelijk antwoord krijgen. '

    }, function (err, json) {
        if (err) {
            return console.error(err);
        }
    });
    res.render('error2', {message: 'gelukt!', session: req.session});
};
organisatorController.login = function (req, res) {
    var post = {
        "email": req.body.email,
        "wachtwoord": req.body.wachtwoord
    };
    organisator.logIn(post, function (error, callback) {
        if (error) {
            throw error;
        }
        else if (callback == false) {
            res.render('login', {message: "Fout wachtwoord/email combinatie ", session: req.session});
        }
        else {
            req.session.email = req.body.email;
            organisator.bekijkAanvragen(function (error, callback) {
                if (error) {
                    throw error;
                }
                else {
                    console.log(callback);
                    res.render('organisatorHome', {aanvragen: callback, session: req.session});
                }
            });
        }
    });

};
organisatorController.logout = function (req, res) {
    req.session.destroy(function (err) {

    });
    res.render('error2', {message: "Je bent uitgelogd", session: req.session});

};
organisatorController.about = function (req, res) {
    res.render('about', {session: req.session});

};
organisatorController.loginForm = function (req, res) {
    if (typeof(req.session.email) == "undefined" || typeof(req.session.email) == "null") {
        res.render('login', {session: req.session});
    }
    else {
        res.render('error2', {
            message: "Je bent al ingelogd als " + req.session.email,
            status: null,
            link: '/logout',
            linkTest: 'klik hier om uit te loggen',
            session: req.session
        });
    }

};
organisatorController.aanvragen = function (req, res) {
    organisator.bekijkAanvragen(function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            console.log(callback);
            res.render('organisatorHome', {aanvragen: callback, session: req.session});
        }
    });
};
organisatorController.bekijkSprekers = function (req, res) {
    organisator.lijstSpreker(function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            console.log(callback);
            res.render('sprekerlijst', {rows: callback, session: req.session});
            //  res.send(callback);
        }
    });
};
organisatorController.updatenAanvraag = function (req, res) {
    var post = {
        email: req.params.spreker,
        tijdZaalNummer: req.params.id

    };
    var stringg = post.tijdZaalNummer.charAt(1) + ":00 zaal " + post.tijdZaalNummer.charAt(2)

    organisator.updateAanvraag(post, function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            console.log(callback);
            var post2 = {
                naam: 'spreker',
                email: post.email,
                soortTicket: 'passe partout',
                aantalTicketsNummer: 1,
                dinner: false,
                lunch: false
            };
            ticket.buyTicket(post2, function (err, callback) {
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
                            for (var i = 0; i < callback.result.length; i++) {
                                ticketids += ', ' + callback.result[i];
                            }
                            console.log(ticketids + 'ticketids');
                            setTimeout(function () {
                                fs.readFile('./out.pdf', function (err, data) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log(data);
                                    sendgrid.send({
                                        to: post.email,
                                        from: 'info@projectRubenSoerdien.nl',
                                        subject: 'Uw slot is geaccepteerd',
                                        text: 'Beste spreker, uw slot is geaccepteerd op ' + stringg + ' ' + ticketids + '\n ' + 'hier zijn uw tickets in de bijlage.',
                                        files: [{
                                            filename: 'Report.pdf',
                                            content: new Buffer(data.toString('base64'), 'base64'),
                                            contentType: 'application/pdf'
                                        }]

                                    }, function (err, json) {
                                        if (err) {
                                            console.log(path.resolve(process.cwd(), 'out.pdf'));
                                            return console.error(err);
                                        }
                                        console.log(callback.insertId);
                                    });
                                    //res.send(callback);
                                    res.render('error2', {message: "gelukt!"});

                                });
                            }, 3000);
                        }

                    });
                }
            });
        }
    });
};
//Database is aangemaakt. Het wachtwoord voor databasegebruiker u246741079_admin is tester database: 246741079_test

organisatorController.home = function (req, res) {
    res.render('organisatorHome2', {session: res.session});
};
organisatorController.mailReservatie = function (req, res) {
    var post = {
        onderwerp: req.body.onderwerp,
        bericht: req.body.bericht
    };

    //res.render('organisatorHome2',{session:res.session});
    organisator.updateReservatie(function (error, callback) {
        if (error) {
            throw error;
        }
        else {
            var emails = [];
            for (var i = 0; i < callback.length; i++) {
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