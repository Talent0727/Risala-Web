const mysql = require('mysql');

const mysql_database = mysql.createPool({
    host:       process.env.DATA_BASE_HOST,
    user:       process.env.DATA_BASE_USER,
    password:   process.env.DATA_BASE_PASSWORD,
    database:   process.env.DB,
    port:       3306,
    charset:    'utf8mb4'
})
mysql_database.getConnection((err) => {
    if(err) throw err
})

module.exports = mysql_database;