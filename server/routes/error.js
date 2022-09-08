const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql_database = require('../config');

router.post('/', (req, res) => {
    try {
        if(req.body.message){
            let sql = "insert into error (message) Values (?)"
            mysql_database.query(sql, [req.body.message], (err, result) => {
                if(!err && result.affectedRows === 1){
                    res.status(200).send(result)
                } else {
                    console.log(err)
                    throw err
                }
            })
        } else {
            throw new Error("No error message was provided")
        }
    } catch (err) {
        throw new Error(`An error has occurred: ${err}`)
    }
})
router.post('/bug', (req, res) => {
    try {
        if(req.body.id && req.body.user_id && req.body.text && req.body.date){
            let sql = "insert into bug_reporting (id, user_id, text, date) Values (?, ?, ?, ?)"
            mysql_database.query(sql, [req.body.id, req.body.user_id, req.body.text, req.body.date], (err, result) => {
                if(!err && result.affectedRows === 1){
                    res.status(200).send(result)
                } else {
                    console.log(err)
                    throw err
                }
            })
        } else {
            throw new Error("No error message was provided")
        }
    } catch (err) {
        throw new Error(`An error has occurred: ${err}`)
    }
})

module.exports = router;