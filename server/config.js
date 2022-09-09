const mysql = require('mysql');

const mysql_database = mysql.createPool({
    host:       process.env.DATABASE_HOST,
    user:       process.env.DATABASE_USER,
    password:   process.env.DATABASE_PASSWORD,
    database:   process.env.DATABASE_DB,
    port:       3306,
    charset:    'utf8mb4'
})
mysql_database.getConnection((err) => {
    if(err) throw err
})

module.exports = mysql_database;