/**
 * Created by ruben on 21/05/2017.
 */
var express = require('express');
var router = express.Router();
var Order = require('../models/Order.js');
var TicketKind = require('../models/TicketKind.js');
var Ticket = require('../models/ticket.js');
var sendgrid = require('sendgrid')("rubennaatje",  process.env.wachtwoordSendGrid);
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {

    /*var newOrder = new Order({
        firstName: 'Ruben',
        lastName: 'Soerdien',
        email: 'Ruben.soerdien@hotmail.com'
    });

    var newTicket = new Ticket({order: newOrder._id});

    newOrder.tickets.push(newTicket._id);

    newOrder.save();
    newTicket.save();

    
    console.log('nice');
    res.send('respond with a resource');*/

    TicketKind
        .find({visible: true})
        .exec(function(err, ticketKinds){
            console.log('ticketKinds');
            res.render('order',{ticketKinds: ticketKinds});
        })

});
router.post('/',function (req, res, next) {

    this.tickets = [];
    var newOrder = new Order();
    this.hasWorked = true;
    this.reqbody = req.body;
    var that = this;
    var counter = 0;
    console.log('length: ', Object.keys(req.body).length);
    var length = Object.keys(req.body).length;

    for( ticket in req.body){

        if( req.body.hasOwnProperty(ticket)&&(req.body[ticket] > 0 &&req.body[ticket] < 5 )){
            // selected[ticket] = req.body[ticket];

            //(^\w{1,20}\+) find the first word
            //(\+\w{1,20}$) find the second word.

            var tickettype = ticket.match(/(^\w{1,20}\+)/g)[0].replace(/\+/g,'');
            var day = ticket.match(/(\+\w{1,20}$)/g)[0].replace(/\+/g,'');
            var checkday = day;
            that.amount = req.body[ticket];
            console.log(tickettype,day, ticket);

            if(day === 'allday'){
                checkday = 'sunday';
            }
            var test = function(checkday,day){
                console.log(day);
                TicketKind
                    .findOne({ticketKind: tickettype})
                    .where('availableOn.'+checkday).gt(1)
                    .exec(function (err, ticketKind) {
                        if (err || ticketKind == null){
                            console.log('error', err);
                            that.hasWorked = false;

                        } else {
                            console.log('yea' , day);
                            // console.log('nice',req.body[ticket]);
                           // console.log(ticketKind);
                            that.ticketKind = ticketKind;
                            //console.log('The id is %s', ticketKind._id);
                            that.dofor(day);

                        }
                    });
            };
            test(checkday,day);
            that.dofor = function(day) {
                for (var i = 0; i < that.amount; i++) {
                    console.log('a', day);
                    // console.log('day', day, 'a');
                    //console.log(that.ticketKind);
                    var newTicket = new Ticket({ticketKind: that.ticketKind._id, order: newOrder._id, day:day});
                    //that.tickets.push(newTicket);
                    newTicket.save();
                    newOrder.tickets.push(newTicket._id);
                    newOrder.save();

                }
            }


        }
        counter++;
        // console.log('counter');
        // console.log(counter , length);

        if(counter >= length ){
            // console.log(that);
            // if(that.hasWorked === false) {
            //     res.render('error2', {message: 'Er is iets foutgegaan in het systeem, probeer het opnieuw.'})
            // } else {
            //     res.send(that.tickets);
            // }
        }

    }
    setTimeout(function () {
        req.session.order = newOrder._id;
        if(that.hasWorked === false) {
            res.render('error2', {message: 'Er is iets foutgegaan in het systeem, probeer het opnieuw.'})
        } else {
            res.redirect('/order/ordersession')
        }
    }, 2000);

});
router.get('/ordersession',function (req,res) {

    // Order
    //     .findOne({_id: req.session.order})
    //     .populate('ticket ticket.ticketKind')
    //     .exec(function (err, order) {
    //         res.send(order);
    //     })

    Order.findOne({_id: req.session.order})
        .populate({
            path: 'tickets',
            model: 'Ticket',
            populate: {
                path: 'ticketKind',
                model: 'TicketKind'
            }
        })
        .exec(function (err, order) {
            if (err || order == null){
                console.log('error', err);
                res.render('error2',{message: 'uh2'});
            } else {
                console.log('___________________________');
                console.log(order.tickets);
                console.log(order.tickets[1]);
                console.log('___________________________');
                var fullPrice = 0;
                for (var i = 0; i< order.tickets.length;i++) {
                    console.log(order.tickets[i].day);
                    console.log('----');
                    if (order.tickets[i].day ==='allday'){
                        console.log('all day nigga');
                        fullPrice += order.tickets[i].ticketKind.ticketPPPrice;

                    }
                    else{
                        console.log('not all day nigga');
                        fullPrice += order.tickets[i].ticketKind.ticketDayPrice;
                    }
                    console.log(fullPrice);
                }
                var errorMessage = null;
                if(req.session.hasOwnProperty('errormessag')&&req.session.errormessag !==null){
                    errorMessage = req.session.errormessag;
                }
                req.session.errormessag = null;
                res.render('confirm',{order: order, fullPrice: fullPrice,errorMessage: errorMessage});
                //res.send(order);
            }

        })


});
router.get('/get', function(req,res){
    Ticket
        .findOne()
        .populate('order') // only return the Persons name
        .exec(function (err, ticket) {
            if (err) return handleError(err);

            console.log('The firstname is %s', ticket.order.firstName);


            console.log('The lastname is %s', ticket.order.lastName);

        }) 
});

router.get('/addTickets', function(req,res){
    var newTicketKind = new TicketKind({
        ticketKind: 'toegang',
        description: 'Toegang voor de conferentie',
        ticketPrice: 9.50,
        visible: true,
        availableOn : {
            Friday: 250,
            Saturday: 250,
            Sunday: 250
        }
    });
    newTicketKind.save();
    res.redirect('/');
});

router.post('/bevestig',function (req, res, next) {
    console.log('ab',req.body.firstName);
    if((!req.body.hasOwnProperty("lastName")||req.body.lastName == "")||(!req.body.hasOwnProperty("firstName")||req.body.firstName == "")||(!req.body.hasOwnProperty("email")||req.body.email == "")){
        //||!req.body.hasOwnProperty("firstName")&&req.body.firstName !== null||!req.body.hasOwnProperty("email")&&req.body.email !== null
        req.session.errormessag = 'U heeft niet alle velden ingevuld';
        res.redirect('/order/ordersession');
    } else{
        Order.findOneAndUpdate({_id: req.session.order},{firstName: req.body.firstName,lastName: req.body.lastName, email:req.body.email},function(err,result){
            if(err){console.log(err);}
            else{

                Order
                    .findOne({_id:req.session.order})
                    .populate({
                        path: 'tickets',
                        model: 'Ticket',
                        populate: {
                            path: 'ticketKind',
                            model: 'TicketKind'
                        }
                    })
                    .exec( function (err, order) {
                        order.getTickets(function (err,res) {
                            if(err)
                                console.log(err);
                            else{
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
                                            text: 'Beste heer / mevrouw ' + req.body.lastName +'\n ' + 'hier zijn uw tickets in de bijlage.',
                                            files     : [{filename: 'tickets.pdf', content: new Buffer(data.toString('base64'), 'base64'), contentType: 'application/pdf'}]

                                        }, function (err, json) {
                                            if (err) {
                                                return console.error(err);
                                            }
                                            console.log(json);
                                        });
                                        //res.send(callback);

                                    });
                                },3000);
                            }
                        });
                    });

                res.render('betaald');
            }
        });

    }
});
module.exports = router;
