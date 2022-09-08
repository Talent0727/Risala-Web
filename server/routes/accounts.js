const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mysql_database = require('../config');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(
            null, 
            process.env.RISALA_UPLOADS_PATH || path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads')
        )
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/', (req, res) => {
    if(req.body.account && req.body.username){
        let account = req.body.account
        let username = req.body.username

        let sql = "SELECT * FROM Accounts WHERE account_id = ? AND username = ?";
        mysql_database.query(sql, [account, username], (err, result) => {
            if(result){
                
                //We are removing password from the result object
                //For security reasons

                res.status(200).send({
                    account_id: result[0].account_id,
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    profile_picture: result[0].profile_picture,
                    username: result[0].username,
                    last_login: result[0].last_login,
                    privilege: result[0].privilege
                })
            }
        })
    } else {
        throw new Error("Parameters are missing")
    }
})
router.post('/control', (req, res) => {
    if(req.body.username){
        let sql = "select username from Accounts where username = ?"
        mysql_database.query(sql, [req.body.username], (err, result) => {
            if(!err){
                res.send(result)
            } else {
                throw err
            }
        })
    } else {
        throw new Error("No email adress/username was provided, please try again")
    }
})

router.post('/upload', upload.single('profile_picture'), (req, res, next) => {
    if(req.body['account_id']){
        var newPathObject = {}

        var fileName = req.file.filename
        newPathObject[`profile_picture`] = `../uploads/${fileName}`;

        let sql = "SELECT profile_picture from Accounts where account_id = ?"
        mysql_database.query(sql, [req.body['account_id']], (err, result) => {
            if(err) throw err
            else {
                
                if(result[0].profile_picture === "" || result[0].profile_picture == 0){
                    addProfilePicture(req.body['account_id'], newPathObject.profile_picture)
                } else {
                    try {
                        if(req.headers.referer === "https://codenoury.se/admin/" || req.headers.referer === "https://codenoury.se/admin" || req.headers.referer === "https://risala.codenoury.se"){
                            fs.unlinkSync('/var/www/html/uploads' + result[0].profile_picture.substring(11, result[0].profile_picture.length), (err) => {
                                if(err) throw err
                            })
                        } else if(req.headers.referer === "http://localhost:3000/" || req.headers.referer === "http://localhost:8000"){
                            fs.unlinkSync(path.resolve(__dirname, '..', '..', 'app', 'public', 'uploads', result[0].profile_picture.substring(11, result[0].profile_picture.length)), (err) => {
                                console.log(err)
                                if(err) throw err
                            })
                        }

                        addProfilePicture(req.body['account_id'], newPathObject.profile_picture)
                    } catch (err) {
                        addProfilePicture(req.body['account_id'], newPathObject.profile_picture)
                    }
                }
            }
        })
    }
    function addProfilePicture(id, path){
        let sql = "update Accounts set profile_picture = ? where account_id = ?"
        mysql_database.query(sql, [path, id], (err, result) => {
            if(err){
                throw err
            }
        })

        updateNewProfilePicture(req.body['account_id'], path)
    }
    async function updateNewProfilePicture(id, path){
        if(id && path){
            let sql = `select id, members from unique_chats where JSON_CONTAINS(members, '{"id": "${id}"}', '$')`
            mysql_database.query(sql, (err, result) => {
                if(!err){
                    console.log(result.length)
                    const membersLength = result.length

                    if(result.length === 0){
                        res.send(true).status(200)
                    } else {
                        var isError = false;
                        for(let i = 0; i < result.length; i++){
                            result[i].members = JSON.parse(result[i].members)
                            result[i].members.filter(e => e.id === req.body['account_id'])[0].profile_picture = path
                            
                            var stringifiedMembers = JSON.stringify(result[i].members);
        
                            let sql = "update unique_chats set members = ? where id = ?"
                            mysql_database.query(sql, [stringifiedMembers, result[i].id], (error, updateResult) => {
                                if(error){
                                    res.send(err).status(400)
                                    isError = true;
                                } else if(updateResult.affectedRows !== 1){
                                    console.log("Affected rows is 0")
                                }
                            })
    
                            if(isError){
                                throw new Error("An error has occurred with updating profile picture")
                            } else if(i === (membersLength - 1)) {
                                res.send(true).status(200)
                            }
                        }
                    }
                    
                } else {
                    throw err
                }
            })
        } else {
            throw new Error("Parameters were missing for updating new settings")
        }
    }
})
router.post('/create', (req, res) => {

    if(req.body.id && req.body.firstname && req.body.lastname && req.body.username && req.body.password && req.body.temp){

        //hash password
        const saltRounds = 10;
        var hash = bcrypt.hashSync(req.body.password, saltRounds)
    
        var infoObject = {
            user_id: req.body.id,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            password: hash,
            profile_picture: null
        }
        console.log(infoObject)
    
        let sql = `insert into Accounts 
            (
                account_id, 
                firstname, 
                lastname, 
                profile_picture, 
                password, 
                username,
                temp,
                temp_flag
            )
            values (?, ?, ?, ?, ?, ?, ?, 'confirm_email')
            `
        mysql_database.query(sql, 
            [
                infoObject.user_id,
                infoObject.firstname,
                infoObject.lastname,
                infoObject.profile_picture,
                infoObject.password,
                infoObject.username,
                req.body.temp
            ], (err, result) => {
            if(!err && result.affectedRows === 1){

                const mail_Ouput = createEmail(req.body.firstname, req.body.temp, req.body.username)

                let transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: 587,
                    secure: false,
                    auth: {
                        user: "noreply@codenoury.se",
                        pass: process.env.MAIL_PASS
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                })

                let mailOptions = {
                    from: "Codenoury <noreply@codenoury.se>",
                    to: `${infoObject.username}`,
                    subject: "Welcome to Risala",
                    html: mail_Ouput
                }


                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        let sql = "delete from Accounts where username = ?"
                        mysql_database.query(sql, [infoObject.username], (err, result) => {
                            if(!err){
                                res.status(400).send({data: `${error}`})
                            } else {
                                res.status(400).send({data: "Mail could not be sent && Account was not deleted"})
                            }
                        })
                    } else {
                        res.status(200).send(info)
                    }
                    
                })
                
            } else throw err
        })
    } else {
        throw new Error("Parameters are missing, please try again")
    }

})
router.post('/restore', (req, res) => {
    if(req.body.username){
        let sql = "update Accounts set temp = ?, temp_flag = 'restore_password', expiration_date = ? where username = ?"
        mysql_database.query(sql, [req.body.id, null, req.body.username], (err, result) => {
            if(!err){
                const mail_Ouput = restoreEmail(req.body.id, req.body.username)

                let transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: 587,
                    secure: false,
                    auth: {
                        user: "noreply@codenoury.se",
                        pass: process.env.MAIL_PASS
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                })
        
                let mailOptions = {
                    from: "Codenoury <noreply@codenoury.se>",
                    to: `${req.body.username}`,
                    subject: "Password restoration",
                    html: mail_Ouput
                }

                transporter.sendMail(mailOptions)
                .then((response) => {
                    res.send(response)
                })
                .catch((err) => {
                    res.send(err)
                    console.log(err)
                })
            } else {
                throw err
            }
        })


    } else {
        throw new Error("")
    }
})
router.post('/restore-confirm', (req, res) => {
    if(req.body.id && req.body.purpose){
        let sql = "select * from Accounts where temp = ? and temp_flag = ?"
        mysql_database.query(sql, [req.body.id, req.body.purpose], (err, result) => {
            if(!err){
                res.send(result)
            } else {
                throw err
            }
        })
    } else {
        throw new Error("Parameters are missing, please try again")
    }
})
router.post('/change_password', (req, res) => {
    if(req.body.id && req.body.password){

        //hash password
        const saltRounds = 10;
        var hash = bcrypt.hashSync(req.body.password, saltRounds)

        console.log(hash)

        if(hash){
            let sql = "update Accounts set password = ?, temp = null, temp_flag = null, expiration_date = null where account_id = ?"
            mysql_database.query(sql, [hash, req.body.id], (err, result) => {
                if(!err){
                    res.sendStatus(200)
                } else {
                    throw err
                }
            })
        }

    } else {
        throw new Error("Missing parameters, please try again")
    }
})
router.post('/confirm', (req, res) => {
    if(req.body.id){
        let sql = "update Accounts set temp = null, temp_flag = null, expiration_date = null where temp = ? and temp_flag = 'confirm_email'"
        mysql_database.query(sql, [req.body.id], (err, result) => {
            if(!err && result.affectedRows === 1){
                res.send(result).status(200)
            } else {
                res.send("A confirmation could not be made, either the ID has been expired, already confirmed or is invalid.").status(400)
            }
        })
    } else {
        throw new Error("Confirmation ID is missing, please try again")
    }
})

function createEmail(firstname, id, username){
    const url = "https://risala.codenoury.se";

    return(
        `
        <html>
        <head>
                <title>Risala - Account Registration</title>
        </head>
        <body style="background-color: #ddd;">
        <table style="max-width: 480px; width: 100%; margin: auto; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
            <tbody style="border: none; padding: 0; margin: 0;">
                <tr style="height: 20px;"></tr>
                <tr style="border: none; padding: 0; margin: 0;">
                    <td style="border: none; padding: 0; margin: 0;">
                        <table style="width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: #121212;">
                            <tr style="height: 40px; border: 0; margin: 0; padding: 0;"></tr>
                            <tr>
                                <td style="width: 40px;"></td>
                                <td>
                                    <a href="https://codenoury.se" style="display: block; width: 262px;">
                                        <img src="https://codenoury.se/assets/logo-long-white.png" style="height: 30px;" alt="logo">
                                    </a>
                                </td>
                            </tr>
                            <tr style="height: 40px;"></tr>
                        </table>
                        <table></table>
                        <table style="background-color: #fff;">
                            <tbody>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td><h1 style="font-size: 28px; width: 90%;">Welcome to Risala!</h1></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <p style="font-size: 18px; font-weight: 700; width: 90%;">
                                            Hi ${firstname},<br><br>
                                            Your account has successfully been created.<br>
                                            Before you can sign in, you will be required to confirm your email by clicking on the button below.<br><br>
                                            Best regards,<br>
                                            Codenoury
                                        </p>
                                    </td>
                                </tr>
                                <tr style="margin-top: 40px;">
                                    <td style="width: 40px;"></td>
                                    <td style="height: 100px;">
                                        <a href="${url}/restore?id=${id}&p=confirm_email" style="padding: 12px 40px; background-color: #ffb301; text-decoration: none; color: #000; border-radius: 6px; font-weight: 600;">
                                            Confirm
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                            </tbody>
                        </table>
                        <table style="width: 100%; background-color: #121212; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px; color: #fff;">
                            <tbody>
                                <tr style="height: 20px; border: 0; margin: 0; padding: 0;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <a href="https://codenoury.se" style="display: block; width: 200px;">
                                            <img src="https://codenoury.se/assets/logo-long-white.png" style="height: 20px;" alt="logo"/>
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 40px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="border-top: 1px solid #ffffffb3;"></td>
                                    <td style="width: 40px;"></td>
                                </tr>
                                <tr style="height: 10px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="color: #ffffffb3;">
                                        <a href="https://codenoury.se/projects" style="color: #ffffffb3; font-weight: bold; text-decoration: none;">Previous Projects</a>
                                        <span>|</span>
                                        <a href="https://codenoury.se/about" style="color: #ffffffb3; font-weight: bold; text-decoration: none;">About</a>
                                        <span>|</span>
                                        <a style="color: #ffffffb3; font-weight: bold; text-decoration: none;">Docs</a>
                                    </td>
                                </tr>
                                <tr style="height: 10px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="border-bottom: 1px solid #ffffffb3;"></td>
                                    <td style="width: 40px;"></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <a style="font-size: 0; margin-right: 10px;" href="https://www.linkedin.com/in/patrick-tannoury/">
                                            <img src="https://codenoury.se/assets/linkedin-logo-white.png" style="width: 30px; height: 30px;">
                                        </a>
                                        <a style="font-size: 0; margin-right: 10px;" href="https://github.com/pannoury">
                                            <img src="https://codenoury.se/assets/github-logo-white.png" style="width: 30px; height: 30px;">
                                        </a>
                                        <a style="font-size: 0;" href="https://www.upwork.com/freelancers/~015d0ecb241f77468a">
                                            <img src="https://codenoury.se/assets/upwork-logo-white.png" style="width: 30px; height: 30px; object-fit: contain;">
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px; border: none; padding: 0; margin: 0;"></td>
                                    <td>
                                        <p style="font-size: 12px; color: #ffffffb3; line-height: 1.5; max-width: 380px;">This message was sent to <a href="mailto: ${username}" style="color: #ffffffb3; font-weight: bold;">${username}</a>. This is not a recurring message, and you have not been subscribed to Codenoury by recieving this message.</p>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px; border: none; padding: 0; margin: 0;"></td>
                                    <td><p style="color: #ffffffb3; font-size: 12px;">©2022 Codenoury, Stockholm, Sweden | <a href="https://codenoury.se" style="color: #ffffffb3; font-weight: bold;">https://codenoury.se</a></p></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr style="height: 20px;"></tr>
            </tbody>
        </table>
        </body>
        </html>
        `
    )
}
function restoreEmail(id, username){
    const url = "https://risala.codenoury.se";

    return(
        `
        <html>
        <head>
                <title>Risala - Account Restoration</title>
        </head>
        <body style="background-color: #ddd;">
        <table style="max-width: 480px; width: 100%; margin: auto; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
            <tbody style="border: none; padding: 0; margin: 0;">
                <tr style="height: 20px;"></tr>
                <tr style="border: none; padding: 0; margin: 0;">
                    <td style="border: none; padding: 0; margin: 0;">
                        <table style="width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: #121212;">
                            <tr style="height: 40px; border: 0; margin: 0; padding: 0;"></tr>
                            <tr>
                                <td style="width: 40px;"></td>
                                <td>
                                    <a href="https://codenoury.se" style="display: block; width: 262px;">
                                        <img src="https://codenoury.se/assets/logo-long-white.png" style="height: 30px;" alt="logo">
                                    </a>
                                </td>
                            </tr>
                            <tr style="height: 40px;"></tr>
                        </table>
                        <table></table>
                        <table style="background-color: #fff;">
                            <tbody>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td><h1 style="font-size: 28px; width: 90%;">Welcome to Risala!</h1></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <p style="font-size: 18px; font-weight: 700; width: 90%;">
                                            Hi,<br><br>
                                            This has been sent to you in order to restore your account.<br>
                                            In order to change your password, please click on the button below to confirm your email adress.<br>
                                            If you did not expect this email, please disregard and remove this email<br><br>
                                            Best regards,<br>
                                            Codenoury
                                        </p>
                                    </td>
                                </tr>
                                <tr style="margin-top: 40px;">
                                    <td style="width: 40px;"></td>
                                    <td style="height: 100px;">
                                        <a href="${url}/restore?id=${id}&p=restore_password" style="padding: 12px 40px; background-color: #ffb301; text-decoration: none; color: #000; border-radius: 6px; font-weight: 600;">
                                            Confirm
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                            </tbody>
                        </table>
                        <table style="width: 100%; background-color: #121212; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px; color: #fff;">
                            <tbody>
                                <tr style="height: 20px; border: 0; margin: 0; padding: 0;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <a href="https://codenoury.se" style="display: block; width: 200px;">
                                            <img src="https://codenoury.se/assets/logo-long-white.png" style="height: 20px;" alt="logo"/>
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 40px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="border-top: 1px solid #ffffffb3;"></td>
                                    <td style="width: 40px;"></td>
                                </tr>
                                <tr style="height: 10px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="color: #ffffffb3;">
                                        <a href="https://codenoury.se/projects" style="color: #ffffffb3; font-weight: bold; text-decoration: none;">Previous Projects</a>
                                        <span>|</span>
                                        <a href="https://codenoury.se/about" style="color: #ffffffb3; font-weight: bold; text-decoration: none;">About</a>
                                        <span>|</span>
                                        <a style="color: #ffffffb3; font-weight: bold; text-decoration: none;">Docs</a>
                                    </td>
                                </tr>
                                <tr style="height: 10px;"></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td style="border-bottom: 1px solid #ffffffb3;"></td>
                                    <td style="width: 40px;"></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr></tr>
                                <tr>
                                    <td style="width: 40px;"></td>
                                    <td>
                                        <a style="font-size: 0; margin-right: 10px;" href="https://www.linkedin.com/in/patrick-tannoury/">
                                            <img src="https://codenoury.se/assets/linkedin-logo-white.png" style="width: 30px; height: 30px;">
                                        </a>
                                        <a style="font-size: 0; margin-right: 10px;" href="https://github.com/pannoury">
                                            <img src="https://codenoury.se/assets/github-logo-white.png" style="width: 30px; height: 30px;">
                                        </a>
                                        <a style="font-size: 0;" href="https://www.upwork.com/freelancers/~015d0ecb241f77468a">
                                            <img src="https://codenoury.se/assets/upwork-logo-white.png" style="width: 30px; height: 30px; object-fit: contain;">
                                        </a>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px; border: none; padding: 0; margin: 0;"></td>
                                    <td>
                                        <p style="font-size: 12px; color: #ffffffb3; line-height: 1.5; max-width: 380px;">This message was sent to <a href="mailto: ${username}" style="color: #ffffffb3; font-weight: bold;">${username}</a>. This is not a recurring message, and you have not been subscribed to Codenoury by recieving this message.</p>
                                    </td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                                <tr>
                                    <td style="width: 40px; border: none; padding: 0; margin: 0;"></td>
                                    <td><p style="color: #ffffffb3; font-size: 12px;">©2022 Codenoury, Stockholm, Sweden | <a href="https://codenoury.se" style="color: #ffffffb3; font-weight: bold;">https://codenoury.se</a></p></td>
                                </tr>
                                <tr style="height: 20px;"></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr style="height: 20px;"></tr>
            </tbody>
        </table>
        </body>
        </html>
        `
    )
}

module.exports = router;