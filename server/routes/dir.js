const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


router.get('/', (req, res) => {

    console.log(req.headers.referer, req.cookies)

    if(req.headers.referer === "https://codenoury.se/admin/" || req.headers.referer === "https://codenoury.se/admin"){
        var dir = "/var/www/html"

        res.send(getDirectory(dir)).status(200)

    } else if(req.headers.referer === "http://localhost:8000/" || req.headers.referer === "http://localhost:8000"){ //Local development
        var dir = '../../GatsbyJS' 

        res.send(getDirectory(dir)).status(200)
    } else{
        res.send([req.headers.origin, req.headers, "Access Denied"]).status(401)
    }
})
router.post('/', (req, res) => {
    var dir = req.body.path

    res.send(getDirectory(dir)).status(200)
})
router.post('/open', (req, res) => {
    var path = req.body.newPath
    var filePath = req.body.filePath

    if(fs.lstatSync(filePath).isFile()){
        var data = fs.readFileSync(filePath, 'utf8')
        res.send(data).status(200)
    }
})
router.post('/rename', (req, res) => {
    var dir = req.body.path
    var dataPath = req.body.data
    var newName = req.body.new_name

    var newDir = `${dir}/${newName}`

    fs.renameSync(dataPath, newDir, (err) => {
        if(err) throw err
    })

    res.send(getDirectory(dir)).status(200)
})
router.post('/remove', (req, res) => {
    var dir = req.body.path
    var unlinkPath = req.body.unlinkPath

    console.log(unlinkPath)

    if(fs.lstatSync(unlinkPath).isDirectory()){ //remove directories
        try{
            fs.rmdirSync(unlinkPath)
        } catch(err){
            throw err
        }
    } else if(fs.lstatSync(unlinkPath).isFile()){ //remove files
        fs.unlinkSync(unlinkPath, (err) => {
            if(err) throw err
        })
    }

    res.send(getDirectory(dir)).status(200)
})
router.post('/create', (req, res) => {
    var dir = req.body.path
    var type = req.body.type
    var filename = req.body.name

    var fileDir = `${dir}/${filename}`

    if(type === "dir" && !fs.existsSync(fileDir)){
        fs.mkdirSync(fileDir, (err) => {
            if(err) throw err
        })
    } else if(type === "file" && !fs.existsSync(fileDir)){
        fs.writeFileSync(fileDir, '', (err) => {
            if(err) throw err
        })
    }

    res.send(getDirectory(dir)).status(200)
})
router.post('/write', (req, res) => {
    var dir = req.body.path
    var filePath = req.body.file
    var value = req.body.value

    if(fs.existsSync(filePath)){
        fs.writeFileSync(filePath, `${value}`, (err) => {
            if(err) throw err
        })
    }

    res.send("File updated successfully").status(200)
})


//Function used to read through the current directory
//Generic function, well be reused for almost all requests above
function getDirectory(dir){
    var files = fs.readdirSync(dir)
    directoryObject = {
        Directory: dir
    }
    files.forEach(file => {
        var name = dir + `/${file}`
        if(fs.statSync(name).isDirectory()){
            directoryObject[file] = `${dir}/${file}`
        } else {
            directoryObject[file] = `${path.extname(file)}`
        }
    })

    return directoryObject
}



module.exports = router;