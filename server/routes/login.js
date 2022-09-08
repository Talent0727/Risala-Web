const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs')
const mysql_database = require('../config');

router.post('/', (req, res) => {
    if(req.body.username && req.body.password){
        var username = req.body.username
        var password = req.body.password

        let sql = "SELECT * FROM Accounts WHERE username = ? and (temp_flag = '' or temp_flag is null) and (temp = '' or temp is null)";
        mysql_database.query(sql, [username], (err, result) => {
            if(result && result.length === 1){
                let hash = result[0].password.replace('$2y$', '$2a$')
                bcrypt.compare(password, hash, (err, data) => {
                    if(!err && data){
                        res.send({
                            account_id: result[0].account_id,
                            firstname: result[0].firstname,
                            lastname: result[0].lastname,
                            profile_picture: result[0].profile_picture,
                            username: result[0].username,
                            privilege: result[0].privilege
                        })
                    } else if(result[0].password === req.body.password) {
                        const saltRounds = 10;
                        var newHash = bcrypt.hashSync(req.body.password, saltRounds)
                        
                        let sql = `update Accounts set password = ? where username = ?`
                        mysql_database.query(sql, [newHash, req.body.username], (err, success) => {
                            if(!err){
                                res.send({
                                    account_id: result[0].account_id,
                                    firstname: result[0].firstname,
                                    lastname: result[0].lastname,
                                    profile_picture: result[0].profile_picture,
                                    username: result[0].username,
                                    privilege: result[0].privilege
                                })
                            } else {
                                throw new Error("Updating password to hash version was unsuccessfull")
                            }
                        })
                    } else {
                        res.send("No match was found").status(400);
                    }
                })
            } else {
                res.send("No match was found").status(400);
            }
        })
    } else{
        throw new Error("Data is missing")
    }
})

module.exports = router;