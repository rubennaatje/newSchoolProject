module.exports = {
    "database": process.env.DATABASE,
    "user":     process.env.DBUSER,
    "password": process.env.DBPASSWORD,
    "dbport": 3306,
    "port":  process.env.PORT || 3000,
    "host": process.env.DBHOST
};