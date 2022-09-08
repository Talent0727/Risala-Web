const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/', upload.any('image') , (req, res, next) => {
    console.log(req.files)
    //req.body == project-id, only applicable for update of projects
    //else it is empty

    //Project update
    if(req.body['project-id']){
        console.log(Object.keys(req.body)[0])
        var newPathObject = {}

        //For File Upload (new files)
        for (let i = 0; i < Object.keys(req.files).length; i++){
            var fieldName = req.files[i].fieldname //picture_x
            var fileName = req.files[i].filename
            newPathObject[`${fieldName}`] = `../uploads/${fileName}`;
        }

        res.status(200).send(newPathObject)
    } else{
        var newPathObject = {}
        //For File Upload (new files)
        for (let i = 0; i < Object.keys(req.files).length; i++){
            var fieldName = req.files[i].fieldname //picture_x
            var fileName = req.files[i].filename
            newPathObject[`${fieldName}`] = `../uploads/${fileName}`;
        }
        res.status(200).send(newPathObject)
    }
})
router.post('/delete', (req, res) => {
    if(!req.body.paths) res.send("Path was missing").status(400)

    var paths = req.body.paths
    for (let i = 0; i < paths.length; i++){
        if(fs.lstatSync(path.resolve(__dirname, paths[i])).isFile()){
            fs.unlinkSync(path.resolve(__dirname, paths[i]), (err) => {
                if(err){
                    throw err
                } else {
                    res.send("Removal was successfull").status(200)
                }
            })
        }
    }
})

module.exports = router;