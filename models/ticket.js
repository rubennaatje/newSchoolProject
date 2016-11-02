/**
 * Created by ruben on 04-Oct-16.
 */
/**
 * Created by ruben on 03-Oct-16.
 */
var mysql = require('./db.js');
var qr = require('qr-image');
var PDFDocument = require('pdfkit');
var fileExistSync = require('./existsCheck');


var fs = require('fs');
var ticket = function () {
};


ticket.buyTicket = function (post,callback) {
    var queryTickets = ''  ;
    console.log(post.soortTicket);
    console.log(post.aantalTicketsNummer + " xd");


    console.log(post.soortTicket);
    console.log(queryTickets);

    var query ="select * from bezoeker;";
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* Begin transaction */
        conn.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            conn.query('select * from bezoeker where email = ?', [post.email], function (err, result) {
                console.log(JSON.stringify(result)+' xDDDDD');
                if (err) {
                    conn.rollback(function () {
                        throw err;
                    });
                }

                else if (result.length > 0) {
                    console.log('ok bestaat al maar is ok ;) ')
                }
                else if (result.length === 0) {
                    conn.query('insert into `bezoeker` (`email`, `volledigeNaam`) VALUES (?, ?);', [post.email, post.naam], function (err, result) {
                        if (err) {
                            conn.rollback(function () {
                                throw err;
                            });
                        }
                    });
                }
                conn.query("INSERT INTO `order` (`orderId`, `orderDatum`, `bezoeker`) VALUES (NULL, NULL, ?);", [post.email], function (err, result) {
                    console.log(JSON.stringify(result) + ' xDDDDD');
                    if (err) {
                        conn.rollback(function () {
                            throw err;
                        });
                    }
                    var orderId = result.insertId;
                    var randomId = Math.random() * 10000000;
                    var idlist = [];
                    for(var i = 0; i<post.aantalTicketsNummer;i++ ){
                        queryTickets += ' insert into `ticket` (`idTicket`, `soortTicket`, `orderid`, `geactiveerd`) VALUES ("'+randomId+'", "'+post.soortTicket+'", "'+result.insertId+'", "0");\n';
                        idlist.push(Math.floor(randomId));
                        if(post.dinner ==='on'){
                            queryTickets += 'INSERT INTO `maaltijd` (`idMaaltijd`, `soortMaaltijd`, `order`) VALUES ("'+(randomId+1 )+'","Dinner", "'+result.insertId+'");\n';
                        }
                        if(post.lunch ==='on'){
                            queryTickets += 'INSERT INTO `maaltijd` (`idMaaltijd`, `soortMaaltijd`, `order`) VALUES ("'+(randomId+2 )+'","Lunch", "'+result.insertId+'");\n';
                        }
                        randomId+=4;
                    }
                    conn.query(queryTickets, [],
                        function (err, result) {
                            if (err) {
                                conn.rollback(function () {
                                    throw err;
                                });
                            }
                            conn.commit(function (err) {
                                if (err) {
                                    conn.rollback(function () {
                                        throw err;
                                    });
                                }
                                console.log('Transaction Complete.');

                                conn.release();
                                return callback(null, {result:idlist, orderId:orderId});
                            });
                        }
                    );
                });
            });
        });
        /* End transaction */
    });
};
ticket.getTickets = function (post, callback) {
    var query ="select * from ticket where `orderId` = ?;";
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        conn.query(query,[post.orderId], function (err, rows){
            if(err) return callback(err, null);
            else{
                var doc = new PDFDocument;
                doc.pipe( fs.createWriteStream('out.pdf') );
                for(var i=0;i<rows.length;i++){
                    console.log('uh');
                    var test = qr.imageSync((rows[i].idTicket),{ type: 'png' });
                    doc.image(test, 0, 0, { fit: [205, 205] });
                    doc.text('naam'); //verdere info toevoegen !!
                    doc.text(rows[i].soortTicket, 210, 0);
                    doc.addPage();
                   /* var code = qr.image((rows[i].idTicket), { type: 'png' });
                    // res.type('svg');
                    var output = fs.createWriteStream('memes.png');
                    code.pipe(output);

                    setTimeout(function () {
                        doc.image('memes.png', 0, 0, { fit: [205, 205] });
                        doc.text('naam'); //verdere info toevoegen !!
                        doc.text(rows[i].soortTicket, 210, 0);
                    },1000);*/
                   /* ticket.createQrCode(rows[i].idTicket,function (err,callback,id) {
                        if(err){
                            console.log('uh');
                            return callback(err,null);
                        }
                        else{
                            console.log('uh');
                            doc.image(callback, 0, 0, { fit: [205, 205] });
                            doc.text('naam'); //verdere info toevoegen !!
                            doc.text(id, 210, 0);
                            doc.addPage();
                        }
                    });
                  /*  var code = qr.image('test', { type: 'png' });
                    var buffer = qr.imageSync('test', { type: 'png' });
                    doc.image(code, 0, 0, { fit: [205, 205] });*/
                    //maaltijdQR toevoegen


                }
                console.log('test1');
                doc.end();


                return callback(err,doc);

            }
        })
    });
};
ticket.getAvailable = function(id,callback){
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* Begin transaction */
        conn.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            conn.query("select count(*) from ticket where soortTicket = 'zondag' or soortTicket='passe partout';", function (err, result) {

                if (err) {
                    conn.rollback(function () {
                        throw err;
                    });
                }
                console.log(post.tijdZaalNummer + ' ' + post.email);

                conn.query("UPDATE `tijdslot` SET `status` = '1' WHERE (`tijdslot`.`tijdZaalNummer` != ?   and `tijdslot`.`spreker` = ?) OR (tijdZaalnummer = ? and status = '2');",[post.tijdZaalNummer,post.email,post.tijdZaalNummer],
                    function (err, result) {
                        if (err) {
                            conn.rollback(function () {
                                throw err;
                            });
                        }
                        conn.commit(function (err) {
                            if (err) {
                                conn.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('Transaction Complete.');

                            conn.release();
                            return callback(null, result);
                        });
                    }
                );
            });
        });
        /* End transaction */
    });
};

ticket.getAvailableTickets = function (callback) {
    var query =["select count(*) as a from ticket where `soortTicket` = ('vrijdag') OR `soortTicket` = 'passe partout'",
                "select count(*) as a from ticket where `soortTicket` = ('zaterdag') OR `soortTicket` = 'passe partout'",
                "select count(*) as a from ticket where `soortTicket` = ('zondag') OR `soortTicket` = 'passe partout'"];

    mysql.connection(function (err, conn){
        var rows2 = [];
        if(err) {
            return callback(err);
        }
        for(var i = 0; i<3;i++){
            conn.query(query[i], function (err, rows){
                if(err) return callback(err, null);
                else{
                    //console.log(rows[0]);
                    rows2.push(rows[0].a);
                }
               // console.log(rows2);
                if(rows2.length == 3){
                    return callback(null, rows2);
                }
            });
        }
    });
};
module.exports = ticket;