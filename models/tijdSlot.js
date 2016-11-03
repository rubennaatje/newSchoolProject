/**
 * Created by ruben on 11/10/2016.
 */

var mysql = require('./db.js');

var tijdSlot = function () {
};


tijdSlot.vraagAan = function (post, callback) {

    var queryMemes = "INSERT INTO `tijdslot` (`id`, `tijdZaalNummer`, `dag`, `spreker`, `status`) VALUES (NULL, '" + post.slot1 + "', '" + post.dag + "', '" + post.email + "', 2),\n(null, '" + post.slot2 + "', '" + post.dag + "', " +
        "'" + post.email + "', 2)," +
        "(NULL, '" + post.slot3 + "', '" + post.dag + "', '" + post.email + "', 2);";
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* Begin transaction */
        conn.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            conn.query('select * from spreker where email = ?', [post.email], function (err, result) {
                console.log(JSON.stringify(result) + ' xDDDDD');
                if (err) {
                    conn.rollback(function () {
                        throw err;
                    });
                }
                else if (result.length > 0) {
                    console.log('ok bestaat al maar is ok ;) ')
                }
                else if (result.length === 0) {
                    conn.query('INSERT INTO `spreker` (`email`, `omschrijving`, `naam`, `onderwerp`) VALUES (?, ?, ?, ?);', [post.email, post.omschrijving, post.naam, post.onderwerp], function (err, result) {
                        if (err) {
                            conn.rollback(function () {
                                throw err;
                            });
                        }
                    });
                }

                conn.query(queryMemes, [],
                    function (err, result) {
                        if (err) {
                            conn.rollback(function () {
                                throw err;
                            });
                        }

                        conn.query("INSERT INTO `aanvraag` (`aanvraagId`, `Spreker`, `tijdSlot1`, `tijdSlot2`, `tijdSlot3`) VALUES (NULL, ?, ?, ?, ?);",
                            [post.email, post.slot1, post.slot2, post.slot3],
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
                    }
                );
            });
        });
        /* End transaction */
    });
};

tijdSlot.getSlots = function (dag,callback) {
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }


        conn.query('select tijdZaalNummer,status,naam,dag,onderwerp,omschrijving from tijdslot,spreker where dag = ? and spreker = email;',[dag], function (err, rows) {
            if (err) return callback(err, null);

            else {
                console.log(rows[0].tijdZaalNummer);
                return callback(null, rows);
            }
        })
    });
};
tijdSlot.programma = function (dag,callback) {
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }


        conn.query('select tijdslot.id,tijdZaalNummer,status,naam,tijdslot.dag,onderwerp,omschrijving from tijdslot,spreker where tijdslot.status = 3 and spreker = email;', function (err, rows) {
            if (err) return callback(err, null);

            else {
                console.log(rows[0].tijdZaalNummer);
                return callback(null, rows);
            }
        })
    });
};
tijdSlot.stuurContact = function(req,res){
    var post = {
        to: req.body.to,
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
    res.render('error2', {message:'gelukt!',session:req.session});
};
tijdSlot.getSlot = function (id, callback) {
    var query = " ";
    var query2 = "";
    console.log('uh1234');
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        console.log('uh123');

        conn.query('select * from tijdslot,spreker where tijdslot.id = ? AND tijdslot.spreker = spreker.email;', [id], function (err, rows) {
            if (err) return callback(err, null);

            else {
                console.log('uh');
                var spreker = rows;
                conn.query('select count(*) as aantal from voorreservering where presentatie = ?;', [id], function (err2, rows) {
                    if (err2) {
                        return callback(err2, null);
                    }

                    else {
                        return callback(null, {spreker: spreker, aantal: rows[0].aantal});
                    }
                });
            }
        })
    });
};

tijdSlot.reserveerSpreker = function (post, callback) {
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        conn.query('select count(*) as aantal from voorreservering where ticket = ? AND dag = ?;', [post.idTicket, post.dag], function (err, rows) {
            if (err) return callback(err, null);
            else {
                console.log(rows[0].aantal + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaah');
                if (rows[0].aantal > 3) {
                    return callback(null, 2);
                }
                else {
                    conn.query('select count(*) as aantal from voorreservering where presentatie = ?;', [post.idSlot], function (err, rows) {
                        if (err) return callback(err, null);
                        else {
                            if (rows[0].aantal > 74) {
                                return callback(null, 3);
                            }
                            else {
                                conn.query('select count(*) as aantal from voorreservering,tijdslot where presentatie = tijdslot.id AND (lower(tijdZaalNummer) LIKE '+conn.escape(post.tijdzaal+'%')+') AND voorreservering.ticket = ? AND voorreservering.dag =?;', [ post.idTicket, post.dag], function (err, rows) {
                                    if (err) return callback(err, null);
                                    else {
                                        console.log(rows[0].aantal + 'baaaaaaaaaaaaaaaaaaaaaaaaaaaaah '+conn.escape(post.tijdzaal+'%'));
                                        if (rows[0].aantal >=1) {
                                            return callback(null, 4);
                                        }
                                        else {
                                            conn.query('INSERT INTO `voorreservering` (`id`, `presentatie`, `ticket`, `dag`) VALUES (NULL, ?,?,?);', [post.idSlot, post.idTicket, post.dag], function (err, rows) {
                                                if (err) return callback(err, null);

                                                else {
                                                    return callback(null, 1);
                                                }
                                            });
                                        }
                                    }
                                });

                            }
                        }
                    });
                }
            }
        });

    });
};

module.exports = tijdSlot;