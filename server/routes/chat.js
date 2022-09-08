const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysql_database = require('../config');
const multer = require('multer')
const uuid = require('uuid')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/', (req, res) => {
    if(req.body.id){
        var id = req.body.id
        let sql = `SELECT * FROM unique_chats WHERE JSON_CONTAINS(members, '{"id": "${id}"}', '$') order by recent_message->"$.timestamp" desc`
        mysql_database.query(sql, [id], (err, result) => {
            if(!err){
                res.status(200).send(result)
            } else{
                throw err
            }
        })
    } else{
        res.send("User-id missing, please try again").status(400)
    }
})
router.post('/search', (req, res) => {
    if(req.body.search && req.body.search !== ""){
        var search = req.body.search; //the name you typed, the search query
        var user = req.body.user //your id

        if(req.body.selected){
            var selected = req.body.selected
            selected.push(user);
        } else {
            var selected = [req.body.user]
        }

        //Break up search into array if space exists
        var searchArray = search.split(' ');

        if(searchArray.length > 1){
            let sql = 
            `select firstname, lastname, account_id, username, profile_picture 
            from Accounts where (firstname like '%${searchArray[0]}%' 
            AND lastname like '%${searchArray[1]}%') and account_id not in (${selected.map(id => `'${id}'`)})`;

            mysql_database.query(sql, [user], (err, result) => {
                if(result){
                    res.status(200).send(result)
                } else if(err) throw err
            })
        } else {
            let sql = 
            `select firstname, lastname, account_id, username, profile_picture 
            from Accounts where (firstname like '%${search}%' OR lastname like '%${search}%') 
            and account_id not in (${selected.map(id => `'${id}'`)})`;
            mysql_database.query(sql, (err, result) => {
                if(result){
                    res.status(200).send(result)
                } else if(err) throw err
            })
        }
    } else {
        res.status(200).send("")
    }
})
router.post('/conv', (req, res) => {
    if(req.body.id && req.body.id.length > 1){
        var id = req.body.id

        if(id.length === 2){
            var sql = `SELECT * FROM unique_chats WHERE 
            JSON_CONTAINS(members, '{"id": "${id[0]}"}', '$') and 
            JSON_CONTAINS(members, '{"id": "${id[1]}"}', '$') 
            and (id = '${id[0]}-${id[1]}' or id = '${id[1]}-${id[0]}')
            order by recent_message->"$.timestamp" desc`
            mysql_database.query(sql, (err, result) => {
                if(!err){
                    res.send(result).status(200)
                } else throw err
            })
        } else if(id.length > 2){
            mysql_database.query(`select * from unique_chats where ${id.map((e, i) => {
                if(i === 0){
                    return `JSON_CONTAINS(members, '{"id": "${e}"}', '$')`
                } else {
                    return ` and JSON_CONTAINS(members, '{"id": "${e}"}', '$')`
                }
            }).join('')}`, (err, result) => {
                if(!err){
                    res.send(result).status(200)
                } else throw err
            })
        }

    } else {
        throw new Error("ID(s) was not provided")
    }
})
router.post('/chat', (req, res) => {
    if(req.body.chat_id){
        var chat_id = req.body.chat_id

        if(req.body.offset){
            console.log(req.body.offset)
            var offset = req.body.offset
            let sql = `select * from chat where id = ? order by timestamp desc limit ? offset ?`
            mysql_database.query(sql, [chat_id, 100, offset], (err, result) => {
                if(!err){
                    res.status(200).send(result)
                } else throw err
            })
        } else {
            let sql = `select * from chat where id = ? order by timestamp desc limit ?`
            mysql_database.query(sql, [chat_id, 100], (err, result) => {
                if(!err){
                    res.send(result).status(200)
                } else throw err
            })
        }


    } else {
        res.status(400).send("No ID was sent")
    }
})

//Can't find function that uses this route, needs to be simplified
//Now updated, send also files & media object
router.post('/chat-settings', (req, res) => {
    if(req.body.id){
        let sql = `select settings, files from unique_chats where id = ?`
        mysql_database.query(sql, [req.body.id], (err, result) => {
            if(!err){
                //console.log(result, result.length, result[0])
                if(result.length === 0){
                    var standardSettings = JSON.stringify({
                        color: "#e1872c",
                        emoji: "👍"
                    })
                    var files = JSON.stringify({
                        images: [],
                        files: []
                    })
                    var members = JSON.stringify(req.body.id.split('-'))
                    let sql = "insert into unique_chats (id, members, settings, files) values (?, ?, ?, ?)"
                    mysql_database.query(sql, [req.body.id, members, standardSettings, files], (err, result) => {
                        if(!err){
                            res.send({"color":"#e1872c", "emoji":"👍"}).status(200)
                        } else {
                            console.log(err)
                        }
                    })
                } else {
                    try{
                        res.status(200).send(result[0])
                    } catch(err){
                        //NOTE!: This might need to be fixed since we now implement files as well
    
                        //If conversation is missing in the unique_chat table, make sure to insert it
                        //so that this problem does not happen again in the future
                        if(err instanceof TypeError && err.message === "Cannot read properties of undefined (reading 'settings')"){
                            var standardSettings = JSON.stringify({
                                color: "#e1872c",
                                emoji: "👍"
                            })
                            var files = JSON.stringify({
                                images: [],
                                files: []
                            })
                            var members = JSON.stringify(req.body.id.split('-'))
                            let sql = "insert into unique_chats (id, members, settings) values (?, ?, ?, ?)"
                            mysql_database.query(sql, [req.body.id, members, standardSettings, files], (err, result) => {
                                if(!err){
                                    res.send({"color":"#e1872c", "emoji":"👍"}).status(200)
                                } else {
                                    throw err
                                }
                            })
                        } else {
                            throw err
                        }
                    }
                }
                
            } else {
                throw err
            }
        })
    } else {
        throw new Error("No ID was provided")
    }
})
router.post('/upload', upload.any('image') , (req, res, next) => {
    console.log(req.files)
    //req.body == project-id, only applicable for update of projects
    //else it is empty

    var newPathObject = []
    //For File Upload (new files)
    for (let i = 0; i < Object.keys(req.files).length; i++){
        var fileName = req.files[i].filename
        newPathObject.push(`../uploads/${fileName}`)
    }

    console.log(newPathObject)
    res.status(200).send(newPathObject)
})
router.post('/update-settings', (req, res) => {
    if(req.body.id && req.body.settings){
        let sql = `update unique_chats set settings = ? where id = ?`
        mysql_database.query(sql, [req.body.settings, req.body.id], (err, result) => {
            if(!err){
                res.send(result).status(200)
            } else {
                throw err
            }
        })
    } else {
        throw new Error(`Data missing: ID: ${req.body.id}, Settings: ${req.body.settings}`)
    }
})

//Currently not being used since update of uuid in message_id. Can be removed
router.post('/latest', (req, res) => {
    if(req.body.id && req.body.sender_id){
        let sql = "select message_id from chat where id = ? and sender_id = ? order by timestamp desc limit 1"
        mysql_database.query(sql, [req.body.id, req.body.sender_id], (err, result) => {
            if(!err){
                res.send(result).status(200)
            } else{
                throw new Error("Message ID could not be fetched")
            }
        })
    }
})
router.post('/size', (req, res) => {
    if(req.body.id){
        let sql = "select count(*) as count from chat where id = ?"
        mysql_database.query(sql, [req.body.id], (err, result) => {
            if(!err){
                res.status(200).send(result[0])
            } else {
                throw err
            }
        })
    }
})
//Sends out an array with objects, each one for each account_id in the array that was sent in req.body.members
router.post('/members', (req, res) => {
    if(req.body.id){
        if(req.body.update && req.body.id && req.body.members){

            let sql = "update unique_chats set members = ? where id = ?"
            mysql_database.query(sql, [req.body.members, req.body.id], (err, result) => {
                if(!err){
                    res.status(200).send(result)
                } else{
                    throw err
                }
            })
        } else {
            let sql = "select account_id, username, firstname, lastname, profile_picture from Accounts where account_id in (?)"
            mysql_database.query(sql, [req.body.members], (err, result) => {
                if(!err){
                    res.status(200).send(result)
                } else{
                    throw err
                }
            })
        }
    } else {
        throw new Error("No ID was provided")
    }
})

//Send group-id, and retrieve and array just like in '/members', whereas only group-id is required
router.post('/group-members', (req, res) => {
    if(req.body.chat){
        let sql = "select members from unique_chats where id = ?"
        mysql_database.query(sql, [req.body.chat], (err, result) => {
            if(!err){
                var members = JSON.parse(result[0].members)
                let sql = "select account_id, username, firstname, lastname, profile_picture from Accounts where account_id in (?)"
                mysql_database.query(sql, [members], (err, result_members) => {
                    if(!err){
                        res.status(200).send(result_members)
                    } else{
                        throw err
                    }
                })
            } else {
                throw new Error(err)
            }
        })
    } else {
        throw new Error("No ID was sent")
    }
})

//Updates alias for a groupchat
router.post('/alias', (req, res) => {
    if(!req.body.id && req.body.text){
        throw new Error("No id/alias was provided")
    }

    let sql = "update unique_chats set alias = ? where id = ?"
    mysql_database.query(sql, [req.body.alias, req.body.id], (err, result) => {
        if(!err){
            res.status(200).send(result)
        } else {
            throw err
        }
    })
})
router.post('/nicknames', (req, res) => {
    if(!req.body.id && req.body.nicknames){
        throw new Error("No id/nickname was provided")
    }

    console.log(req.body.nicknames)

    let sql = "update unique_chats set nicknames = ? where id = ?"
    mysql_database.query(sql, [req.body.nicknames, req.body.id], (err, result) => {
        if(!err){
            res.status(200).send(result)
        } else {
            throw err
        }
    })
})

router.post('/conv-search', (req, res) => {

    if(req.body.id){
        var id = req.body.id
        var search = req.body.search
        console.log(req.body.search)

        let sql = `SELECT * FROM unique_chats WHERE 
        JSON_CONTAINS(members, '{"id": "${id}"}', '$') and 
        (
            (JSON_CONTAINS(members, '{"firstname": "${search[0]}"}') or JSON_CONTAINS(members, '{"lastname": "${search[1]}"}'))
            or
            (JSON_CONTAINS(members, '{"firstname": "${search[1]}"}') or JSON_CONTAINS(members, '{"lastname": "${search[0]}"}'))
        ) 
        order by recent_message->"$.timestamp" desc`
        mysql_database.query(sql, (err, result) => {
            if(!err){
                res.status(200).send(result)
            } else {
                throw err
            }
        })
    }
})

router.post('/delete-conv', (req, res) => {
    if(req.body.id){

        Promise.allSettled([deleteFiles, deleteChat, deleteConversation])
        .then((response) => {
            res.status(200).send(true)
        })
        .catch((err) => {
            throw err
        })

        var deleteFiles = new Promise((resolve, reject) => {
            var sql = "select file_paths from chat where id = ? and file_paths is not null"
            mysql_database.query(sql, [req.body.id], (err, result) => {
                if(!err){
                    if(result.length !== 0){
                        console.log(`FILES: ${result[0]}`)
                        var files = result[0]
                        for (let i = 0; i < req.body.files.length; i++){
                            if(fs.lstatSync(path.resolve(process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads', `${filess[i]}`))).isFile()){
                                fs.unlinkSync(path.resolve(path.resolve(process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads', `${files[i]}`))), (err) => {
                                    if(err){
                                        throw err
                                    } else {
                                        resolve(true)
                                    }
                                })
                            }
                        }
                    } else {
                        resolve(true)
                    }
                } else {
                    throw err
                }
            })
        })

        var deleteChat = new Promise((resolve, reject) => {
            var sql = "delete from chat where id = ?"
            mysql_database.query(sql, [req.body.id], (err) => {
                if(!err){
                    resolve(true)
                } else {
                    reject(err)
                }
            })
        })

        var deleteConversation = new Promise((resolve, reject) => {
            var sql = "delete from unique_chats where id = ?"
            mysql_database.query(sql, [req.body.id], (err) => {
                if(!err){
                    resolve(true)
                } else {
                    reject(err)
                }
            })
        })

    } else {
        throw new Error("Chat ID is missing")
    }
})

router.post('/roles', (req, res) => {
    if(req.body.roles && req.body.id){
        let sql = "update unique_chats set roles = ? where id = ?"
        mysql_database.query(sql, [req.body.roles, req.body.id], (err, result) => {
            if(!err){
                res.send(result)
            } else {
                throw err
            }
        })
    } else {
        throw new Error(`Missing parameters, please try again`)
    }
})

//New approach
//Might be redundant, moved to socketFunctions
/*
router.post('/delete', (req, res) => {
    if(req.body.message_id && req.body.current_id && req.body.recent_message){
        
        //Delete messages
        let sql = "delete from chat where id = ? and message_id in (?)"
        mysql_database.query(sql, [req.body.current_id, req.body.message_id], (err, result) => {
            if(err){
                throw err
            }
        })
        
        //Delete files
        if(req.body.filePaths){
            for (let i = 0; i < req.body.filePaths.length; i++){
                if(fs.lstatSync(path.resolve(process.env.UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads', `${req.body.filePaths[i]}`))).isFile()){
                    fs.unlinkSync(path.resolve(path.resolve(process.env.UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads', `${req.body.filePaths[i]}`))), (err) => {
                        if(err){
                            throw err
                        }
                    })
                }
            }
        }

        //Update recent message & files
        if(req.body.filePaths){
            let sql2 = "update unique_chats set recent_message = ?, files = ? where id = ?"
            mysql_database.query(sql2, [req.body.recent_message, req.body.file, req.body.current_id], (err, result) => {
                if(!err){
                    res.status(200).send(true)
                } else {
                    throw err
                }
            })
        } else {
            let sql2 = "update unique_chats set recent_message = ? where id = ?"
            mysql_database.query(sql2, [req.body.recent_message, req.body.current_id], (err, result) => {
                if(!err){
                    res.status(200).send(true)
                } else {
                    throw err
                }
            })
        }
        
    } else {
        throw new Error(`Parameters are missing. Recieved parameters; Message ID: ${req.body.message_id}, Current ID: ${req.body.current_id}, Recent Message: ${req.body.recent_message}, File Paths: ${req.body.filePaths}`)
    }
})
*/

module.exports = router;