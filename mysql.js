const mysql = require('mysql2')

var pool = mysql.createPool({
    "user":  "root",
    "password":"Csgo075?",
    "database": "appstore",
    "host":"localhost",
    "port":  "3306"
});

exports.pool = pool;