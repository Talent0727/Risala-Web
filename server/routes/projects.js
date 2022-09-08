const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const cors = require('cors');
const mysql_database = require('../config');
const fs = require('fs');
const path = require('path');

router.use(cors())

//This route represents /api/projects
router.post('/', (req, res) => {
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    if(req.body.requestid){
        let request_id = req.body.requestid
        if(request_id === 1){
            if(req.body.include){
                let include = String(req.body.include)
    
                let sql = "SELECT * FROM Projects WHERE include = ?"
                mysql_database.query(sql, [include], (err, result) => {
                    if(result){
                        res.status(200).send(result)
                    } else if(err){
                        res.status(500).send(err)
                    } else{
                        res.status(400).send({Error: "Data selection failed!"})
                    }
                })
            } else if(req.body.id){
                //Sometimes, the entire object is sent which is wrong
                //The if statement corrects the value in case it happens
                if(typeof(req.body.id) === "object"){
                    var id = String(req.body.id.project_id)
                } else{
                    var id = String(req.body.id)
                }

                let sql = "SELECT * FROM Projects WHERE project_id = ?"
                mysql_database.query(sql, [id], (err, result) => {
                    if(result){
                        res.status(200).send(result)
                    } else{
                        res.status(400).send({err})
                    }
                })
            } else{
                let sql = "SELECT * FROM Projects ORDER BY date_created DESC"
                mysql_database.query(sql, (err, result) => {
                    if(result){
                        res.status(200).send(result)
                    } else{
                        res.status(400).send({data: "No match!"})
                    }
                })
            }
        } else if(request_id === 2){
            if(req.body.projectid){
                let project_id = req.body.projectid

                let sql = "DELETE FROM Projects WHERE project_id = ?"
                mysql_database.query(sql, [project_id], (err, result) => {
                    if(result){
                        res.status(200).send(result)
                    } else{
                        res.status(400).send(err)
                    }
                })
            }
        }
    } else{
        console.log(req.body)
    }
})
router.post('/delete', (req, res) => {
    if(!req.body.project_id) res.send("Project ID is missing, please provide one in order to delete a project").status(400)

    let project_id = req.body.project_id

    let sql = "SELECT gallery FROM Projects WHERE project_id = ?"
    mysql_database.query(sql, [project_id], (err, result) => {
        if(result){
            deletePath(result)
        }
        else throw err
    })

    function deletePath(filePath){
        var filePath = JSON.parse(filePath[0].gallery)
        for (const [key, value] of Object.entries(filePath)) {
            if(fs.lstatSync(path.resolve(__dirname, value)).isFile()){
                fs.unlinkSync(path.resolve(__dirname, value), (err) => {
                    if(err) throw err
                })
            }
            console.log("File does not exists")
        }

        let sql = "DELETE FROM Projects WHERE project_id = ?"
        mysql_database.query(sql, [project_id], (err, result) => {
            if(result){
                res.status(200).send(result)
            } else{
                throw err
            }
        })
    }
})
router.post('/update', (req, res) => {
    if(req.body.project_id === null) res.send("Project Id is missing, please try again").status(400)

    let sql = `UPDATE Projects SET gallery = ?, titel = ?, description = ?, description_english = ?, languages = ?, hyperlink = ?, project_last_edit = ?, archive_hyperlink = ?, include = ?, feautered_project = ? WHERE project_id = ?`;

    mysql_database.query(sql, 
        [
            req.body.gallery, 
            req.body.titel, 
            req.body.description,
            req.body.description_english,
            req.body.languages,
            req.body.hyperlink,
            req.body.project_last_edit,
            req.body.archive_hyperlink,
            req.body.include,
            req.body.feautered_project,
            req.body.project_id
        ], (err, result) => {
            if(result) res.send(result).status(200)
            else throw err
        }
    )
})
router.post('/insert', (req, res) => {
    let sql = 
    `INSERT INTO Projects (gallery, titel, description, description_english, languages, hyperlink, project_last_edit, archive_hyperlink, include, feautered_project, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    mysql_database.query(sql, 
        [
            req.body.gallery,
            req.body.titel,
            req.body.description,
            req.body.description_english,
            req.body.languages,
            req.body.hyperlink,
            req.body.project_last_edit,
            req.body.archive_hyperlink,
            req.body.include,
            req.body.feautered_project,
            req.body.date_created
        ], (err, result) => {
            if(result) res.send(result).status(200)
            else throw err
        }
    )
})

module.exports = router;