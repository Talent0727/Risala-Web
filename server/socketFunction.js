const mysql = require('mysql');
const { getConnection } = require('./config');
const env = require('dotenv').config();
const mysql_database = require('./config');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4} = require('uuid');

function sendMessage(data){
    /*********** FILES ******************/
    var files = null;
    var file_paths = null;
    if(data.files && data.file_paths && !data.new){
        files = true
        file_paths = data.file_paths
        updateFileArray(data.id, data.file_paths)
    } else if(!data.files && !data.file_paths && data.text === ""){
        res.send("Error: Can't send empty string").status(400)
    }
    /*********** FILES ******************/

    if(data.new && data.new === true){
        createNewConvo(data, data.id, data.members, file_paths)
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {
            throw err
        })
    }


    if(data.time_separator !== 2 && data.time_separator !== 4){
        //Update recent_message column 
        var recentMessage = JSON.stringify({
            text: data.text,
            files: files,
            file_paths: file_paths,
            sender_id: data.sender_id,
            timestamp: data.timestamp
        })
    
        let query = "update unique_chats set recent_message = ? where id = ?"
        mysql_database.query(query, [recentMessage, data.id], (err, result) => {
            if(err){
                throw err
            }
        })
    } else if(data.time_separator === 4){

        var recentMessage = JSON.stringify(data.recentMessage)
        
        let query = "update unique_chats set recent_message = ? where id = ?"
        mysql_database.query(query, [recentMessage, data.id], (err, result) => {
            if(err){
                throw err
            }
        })
    }


    //var time_data = data.timestamp.substring(0, 10)
    if(data.time_separator === true || data.time_separator === 1){
        var sql = `INSERT INTO chat
        (
            message_id,
            id,
            sender_id,
            reciever_id,
            text,
            files,
            file_paths,
            timestamp,
            time_separator
        ) VALUES ?`;

        var values = [
            [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, getCurrentTime(true), null],
            [data.message_id_time, data.id, null, null, null, null, null, getCurrentTime(), true]
        ]

        mysql_database.query(sql, [values], (err, result) => {
            if(!err){
                return result.insertId
            } else{
                //Resolve the duplicate in uuid manually
                if(err.code === "ER_DUP_ENTRY"){
                    var sql = `INSERT INTO chat
                    (
                        message_id,
                        id,
                        sender_id,
                        reciever_id,
                        text,
                        files,
                        file_paths,
                        timestamp,
                        time_separator
                    ) VALUES ?`;
            
                    var values = [
                        [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, getCurrentTime(true), null],
                        [uuidv4(), data.id, null, null, null, null, null, getCurrentTime(), true]
                    ]

                    mysql_database.query(sql, [values], (err, resultRetry) => {
                        if(!err){
                            return resultRetry.insertId
                        } else{
                            throw err
                        }
                    })
                } else {
                    throw err
                }
            }

            //Duplicate entry '81795155-25db-4350-b689-d5a7409ef94a' for key 'PRIMARY'
        })
    } else if(data.time_separator === 2 || data.time_separator === 3) {
        var sql = `INSERT INTO chat
        (
            message_id,
            id,
            sender_id,
            reciever_id,
            text,
            files,
            file_paths,
            timestamp,
            time_separator
        ) VALUES ?`;

        var values = [
            [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, data.timestamp, data.time_separator],
        ]
        mysql_database.query(sql, [values], (err, result) => {
            if(!err) return result.insertId
            else{
                throw err
            }
        })
    } else if(data.time_separator === 4){
        if(data.isTimeSeparator === true){
            var sql = `INSERT INTO chat
            (
                message_id,
                id,
                sender_id,
                reciever_id,
                text,
                files,
                file_paths,
                timestamp,
                time_separator
            ) VALUES ?`;

            var values = [
                [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, getCurrentTime(true), 4],
                [data.message_id_time, data.id, null, null, null, null, null, getCurrentTime(), true]
            ]
            mysql_database.query(sql, [values], (err, result) => {
                if(!err) return result.insertId
                else{
                    throw err
                }
            })
        } else {
            var sql = `INSERT INTO chat
            (
                message_id,
                id,
                sender_id,
                reciever_id,
                text,
                files,
                file_paths,
                timestamp,
                time_separator
            ) VALUES ?`;
    
            var values = [
                [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, data.timestamp, 4],
            ]
            mysql_database.query(sql, [values], (err, result) => {
                if(!err) return result.insertId
                else{
                    throw err
                }
            })
        }
    } else { //Fixed, do not touch!
        var sql = `INSERT INTO chat
        (
            message_id,
            id,
            sender_id,
            reciever_id,
            text,
            files,
            file_paths,
            timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        var values = [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, data.timestamp]
        mysql_database.query(sql, values, (err, result) => {
            if(!err) return result.rowAffected
            else{
                throw err
            }
        })
    }
}

function sendReply(data){
    console.log("Reply")
    console.log(data)

    var files = null;
    var file_paths = null;
    if(data.files && data.file_paths){

    }

    //Update recent_message column 
    var recentMessage = JSON.stringify({
        text: data.text,
        files: files,
        file_paths: file_paths,
        sender_id: data.sender_id,
        timestamp: data.timestamp
    })

    let query = "update unique_chats set recent_message = ? where id = ?"
    mysql_database.query(query, [recentMessage, data.id], (err, result) => {
        if(err){
            throw err
        }
    })
    

    if(data.time_separator === true && data.reply_text && data.reply_to_id && data.reply_to_message_id && data.reply_to_name){
        var sql = `INSERT INTO chat 
        (
            message_id,
            id, 
            sender_id, 
            reciever_id, 
            text, 
            files, 
            file_paths,
            timestamp,
            reply_to_id,
            reply_text,
            reply_to_message_id,
            reply_to_name,
            time_separator
        ) VALUES ?`;

        var values = [
            [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, getCurrentTime(true), data.reply_to_id, data.reply_text, data.reply_to_message_id, data.reply_to_name, null],
            [data.message_id_time, data.id, null, null, null, null, null, getCurrentTime(), null, null, null, null, true]
        ]
        mysql_database.query(sql, [values], (err, result, fields) => {
            if(!err){
                console.log(result.affectedRows, fields)
                return result
            } else {
                //Add error-handling/management
                throw new Error(`Error for replying 1: ${err}`)
            }
        })
    } else if (data.time_separator !== true && data.reply_text && data.reply_to_id && data.reply_to_message_id && data.reply_to_name) {
        var sql = `INSERT INTO chat 
        (
            message_id,
            id, 
            sender_id, 
            reciever_id, 
            text, 
            files, 
            file_paths,
            timestamp,
            reply_to_id,
            reply_text,
            reply_to_message_id,
            reply_to_name,
            time_separator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        var values = [data.message_id, data.id, data.sender_id, data.reciever_id, data.text, files, file_paths, data.timestamp, data.reply_to_id, data.reply_text, data.reply_to_message_id, data.reply_to_name, null]
        mysql_database.query(sql, values, (err, result, fields) => {
            if(!err){
                console.log(result.affectedRows, fields)
                return result
            }
            else {
                throw err
            }
        })
    }
}

function createNewConvo(data, id, members, file_paths){
    return new Promise((resolve, reject) => {

        console.log(members)

        var standardSettings = JSON.stringify({
            color: "#e1872c",
            emoji: "👍"
        })
        var recentMessage = JSON.stringify({
            text: data.text,
            files: data.files,
            file_paths: file_paths,
            sender_id: data.sender_id,
            timestamp: data.timestamp
        })

        if(members.length > 2){
            var roles = JSON.stringify({
                admin: data.sender_id,
                creator: data.sender_id
            })
        } else {
            var roles = null;
        }

        //If file_paths is not NULL, otherwise create empty skeleton object, and stringify
        if(file_paths){
            var filesObjects = {
                images:  [],
                files: []
            }
            for(let i = 0; i < uploadedFiles.length; i++){

                var fileExtension = uploadedFiles[i].type.split('/')[0]
                console.log(fileExtension)

                if(fileExtension === "image" || fileExtension === "video"){
                    filesObjects.images.push(uploadedFiles[i])
                } else {
                    filesObjects.files.push(uploadedFiles[i])
                }
            }

            filesObjects = JSON.stringify(filesObjects)
        } else {
            var files = JSON.stringify({
                images: [],
                files: []
            })
        }


        var sql = "INSERT INTO unique_chats (id, members, settings, files, recent_message, roles) VALUES (?, ?, ?, ?, ?, ?)"
        mysql_database.query(sql, [id, members, standardSettings, files, recentMessage, roles], (err, result) => {
            if(!err){
                resolve(true)
            } else if (err){
                if(err.code === "ER_DUP_ENTRY"){
                    var sql = "delete from unique_chats where id = ?"
                    mysql_database.query(sql, [id], (err, result) => {
                        if(!err){
                            var sql = "INSERT INTO unique_chats (id, members, settings, files, recent_message, roles) VALUES (?, ?, ?, ?, ?, ?)"
                            mysql_database.query(sql, [id, members, standardSettings, files, recentMessage, roles], (err, result) => {
                                if(!err){
                                    resolve(true)
                                } else((err) => {
                                    reject(err)
                                })
                            })
                        } else((err) => {
                            reject(err)
                        })
                    })
                }
            }
        })
    })

}

function removeMessage(data){
    if(data.message_id && data.current_id && data.recent_message){
        console.log('Line 298', data.message_id, data.filePaths, data.newFile)

        try{
            var filePaths = JSON.parse(data.filePaths)
        } catch (e){
            var filePaths = false
        }
        
        //Delete messages
        let sql = `delete from chat where id = ? and message_id in ?`
        mysql_database.query(sql, [data.current_id, [data.message_id]], (err, result) => {
            if(err){
                throw err
            } else {
                return true
            }
        })
        
        //Delete files
        if(data.filePaths && filePaths){
            for (let i = 0; i < filePaths.length; i++){
                if(fs.lstatSync(path.resolve(process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'Risala', 'app', 'public', 'uploads', `${filePaths[i]}`))).isFile()){
                    fs.unlinkSync(path.resolve(path.resolve(process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'Risala', 'app', 'public', 'uploads', `${filePaths[i]}`))), (err) => {
                        if(err){
                            throw err
                        } else {
                            return true
                        }
                    })
                }
            }
        }

        //Update recent message & files
        if(data.filePaths){
            let sql2 = "update unique_chats set recent_message = ?, files = ? where id = ?"
            mysql_database.query(sql2, [data.recent_message, data.newFile, data.current_id], (err, result) => {
                if(!err){
                    return true
                } else {
                    throw err
                }
            })
        } else {
            let sql2 = "update unique_chats set recent_message = ? where id = ?"
            mysql_database.query(sql2, [data.recent_message, data.current_id], (err, result) => {
                if(!err){
                    return true
                } else {
                    throw err
                }
            })
        }
        
    } else {
        //Most likely that the message removed was the last message in a conversation
        return true
    }
}

//Updates the file object that exists in unique_chats
//The object stores files in arrays that exist either as "IMAGES" or "FILES"
/*
    {
        images: [],
        files: []
    }
*/
async function updateFileArray(id, files){

    getFiles(id)
    .then((response) => {

        var uploadedFiles = JSON.parse(files)
        if(response.length === 0 || response === "" || response === undefined || response === null){
            var filesObjects = {
                images:  [],
                files: []
            }
            for(let i = 0; i < uploadedFiles.length; i++){

                var fileExtension = uploadedFiles[i].type.split('/')[0]

                if(fileExtension === 'image' || fileExtension === "video"){
                    filesObjects.images.push(uploadedFiles[i])
                } else {
                    filesObjects.files.push(uploadedFiles[i])
                }
            } 
    
            console.log(filesObjects, id)
            var filesObjects = JSON.stringify(filesObjects)
    
            var sql = "update unique_chats set files = ? where id = ?"
            mysql_database.query(sql, [filesObjects, id], (err, result) => {
                if(!err && result.rowAffected === 1){
                    console.log("Success")
                } else((err) => {
                    throw err
                })
            })
        } else {
            var settings = JSON.parse(response) 
            for(let i = 0; i < uploadedFiles.length; i++){

                var fileExtension = uploadedFiles[i].type.split('/')[0]
                console.log(fileExtension)

                if(fileExtension === 'image' || fileExtension === "video"){
                    settings.images.push(uploadedFiles[i])
                } else {
                    settings.files.push(uploadedFiles[i])
                }
            }
    
            var newFile = JSON.stringify(settings)
    
            var sql = "update unique_chats set files = ? where id = ?"
            mysql_database.query(sql, [newFile, id], (err, result) => {
                if(!err && result.rowAffected === 1){
                    
                } else((err) => {
                    throw err
                })
            })
        }
    })
    .catch((err) => {
        throw err
    })

    function getFiles(id){
        return new Promise((resolve, reject) => {
            var sql = "select files from unique_chats where id = ?"
            mysql_database.query(sql, [id], (err, result) => {
                if(!err){
                    resolve(result[0].files) 
                } else((err) => {
                    reject(err)
                })
            })
        })
    }
}

function getCurrentTime(delay){
    var date = new Date();
    var year = date.getFullYear();
    var month = leadingZeroFixer(date.getMonth() + 1);
    var day = leadingZeroFixer(date.getDate())
    var hours = leadingZeroFixer(date.getHours());
    var minutes = leadingZeroFixer(date.getMinutes());
    if(delay){
        var seconds = leadingZeroFixer(date.getSeconds() + 2);
    } else {
        var seconds = leadingZeroFixer(date.getSeconds());
    }
    

    function leadingZeroFixer(value){
        if(value < 10){
            var leadingZero = `0${value}`;
            return leadingZero;
        }
        else{
            return value;
        }
    }

    var fullDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return fullDate;
}

module.exports = { sendMessage, sendReply, removeMessage };