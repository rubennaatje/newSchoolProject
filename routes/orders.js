/**
 * Created by ruben on 21/05/2017.
 */
var express = require('express');
var router = express.Router();
var Order = require('../models/Order.js');
var TicketKind = require('../models/TicketKind.js');
var Ticket = require('../models/ticket.js');

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
    console.log('length: ', Object.keys(req.body).length)
    var length = Object.keys(req.body).length;

    for( ticket in req.body){

        if( req.body.hasOwnProperty(ticket)&&(req.body[ticket] > 0 &&req.body[ticket] < 5 )){
            // selected[ticket] = req.body[ticket];

            //(^\w{1,20}\+) find the first word
            //(\+\w{1,20}$) find the second word.

            that.tickettype = ticket.match(/(^\w{1,20}\+)/g)[0].replace(/\+/g,'');
            that.day = ticket.match(/(\+\w{1,20}$)/g)[0].replace(/\+/g,'');
            that.amount = req.body[ticket];
            TicketKind
                .findOne({ticketKind: tickettype})
                .where('availableOn.'+that.day).gt(1)
                .exec(function (err, ticket) {
                    if (err || ticket == null){
                        console.log('error', err);
                        that.hasWorked = false;

                    } else {
                        // console.log('nice',req.body[ticket]);
                        for(var i = 0; i < that.amount;i++){
                            var newTicket = new Ticket({ticketKind: ticket._id, order: newOrder._id});
                            //that.tickets.push(newTicket);
                            newTicket.save();
                            newOrder.tickets.push(newTicket._id);
                            newOrder.save();
                            console.log('day',that.day);

                        }

                        console.log('The id is %s', ticket._id);

                    }
                });
        }
        counter++;
        console.log('counter');
        console.log(counter , length);

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
        if(that.hasWorked === false) {
            res.render('error2', {message: 'Er is iets foutgegaan in het systeem, probeer het opnieuw.'})
        } else {
            res.send(that.tickets);
        }
    }, 5000);

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
module.exports = router;
