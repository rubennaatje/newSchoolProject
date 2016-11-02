/**
 * Created by ruben on 12/10/2016.
 */

var mysql = require('./db.js');

var Organisator = function () {
};

Organisator.logIn = function (post, callback) {
    var query = "SELECT * FROM `organisator` where email = ? AND wachtwoord = ?";
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        conn.query(query, [post.email, post.wachtwoord], function (err, rows) {
            if (err) return callback(err, null);
            else {
                if (rows.length > 0) {
                    return callback(null, true);
                }
                if (rows.length === 0) {
                    return callback(null, false);
                }

            }
        })
    });
};
Organisator.bekijkAanvragen = function (callback) {
    var query = "select * from aanvraag,spreker where behandeld = false and Spreker = email ORDER BY `aanvraag`.`behandeld` ASC";
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        conn.query(query, function (err, rows) {
            if (err) return callback(err, null);
            else {

                return callback(null, rows);
            }
        })
    });
};

Organisator.updateAanvraag = function (post, callback) {

    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* Begin transaction */
        conn.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            conn.query("UPDATE `tijdslot` SET `status` = '3' WHERE `tijdslot`.`tijdZaalNummer` = ? and `tijdslot`.`spreker` = ?;", [post.tijdZaalNummer, post.email], function (err, result) {
                console.log(JSON.stringify(result) + ' xDDDDD');
                if (err) {
                    conn.rollback(function () {
                        throw err;
                    });
                }
                console.log(post.tijdZaalNummer + ' ' + post.email);

                conn.query("UPDATE `tijdslot` SET `status` = '1' WHERE (`tijdslot`.`tijdZaalNummer` != ?   and `tijdslot`.`spreker` = ?) OR (tijdZaalnummer = ? and status = '2');", [post.tijdZaalNummer, post.email, post.tijdZaalNummer],
                    function (err, result) {
                        if (err) {
                            conn.rollback(function () {
                                throw err;
                            });
                        }
                        conn.query("UPDATE `aanvraag` SET `behandeld` = '1' WHERE (`spreker` = ? and (`tijdslot1` = ? OR`tijdslot2` = ? OR `tijdslot3` = ?));", [post.email, post.tijdZaalNummer, post.tijdZaalNummer, post.tijdZaalNummer],
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
                            });
                    }
                );
            });
        });
        /* End transaction */
    });
};

Organisator.updateReservatie = function (callback) {
    mysql.connection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        conn.query('update tijdslot set reserveerbaar = true', function (err, rows) {
            if (err) return callback(err, null);
            else {
                conn.query('select email from bezoeker;', function (err, rows) {
                    if (err) return callback(err, null);
                    else {
                        return callback(null, rows);
                    }
                });
            }
        })
    });
};
module.exports = Organisator;

