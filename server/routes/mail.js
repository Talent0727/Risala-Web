const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')
const mysql = require('mysql');
const mysql_database = require('../config');

// route = '/mail'
router.post('/', (req, res) => {
    if(req.body.data){ var dataObj = req.body.data }

    if(
        dataObj.firstname &&
        dataObj.lastname &&
        dataObj.email &&
        dataObj.phonenumber &&
        dataObj.company &&
        dataObj.description &&
        dataObj.date 
    ){
        let sql = "INSERT INTO Requests (completed_bool, read_bool, date_posted, description, email, firstname, lastname, phonenumber, company_name) VALUES ('false', 'false', ?, ?, ?, ?, ?, ?, ?)"
        mysql_database.query(sql, [dataObj.date, dataObj.description, dataObj.email, dataObj.firstname, dataObj.lastname, dataObj.phonenumber, dataObj.company], (err, result) => {
            if(result.affectedRows === 1){

                const mail_Ouput = 
                `
                <html>
                <head>
                        <title>Welcome to Codenoury</title>
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
                                            <td><h1 style="font-size: 28px; width: 90%;">Your submission has been recieved!</h1></td>
                                        </tr>
                                        <tr style="height: 20px;"></tr>
                                        <tr>
                                            <td style="width: 40px;"></td>
                                            <td>
                                                <p style="font-size: 18px; font-weight: 700; width: 90%;">
                                                    Hi ${dataObj.firstname},<br><br>
                                                    Thank you for reaching out to Codenoury!<br>
                                                    Your request has been recieved, and we will get back to you as soon as possible.<br><br>
                                                    Best regards,<br>
                                                    Codenoury
                                                </p>
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
                                                <p style="font-size: 12px; color: #ffffffb3; line-height: 1.5; max-width: 380px;">This message was sent to <a href="mailto: ${dataObj.email}" style="color: #ffffffb3; font-weight: bold;">${dataObj.email}</a>. This is not a recurring message, and you have not been subscribed to Codenoury by recieving this message.</p>
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
                `;

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
                    to: `${dataObj.email}`,
                    subject: "Your inquiery has been recieved",
                    html: mail_Ouput
                }


                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        res.status(400).send({data: "Mail could not be sent!"})
                        return
                    }
                    res.status(200).send(info)
                })
            }
        })
    }
})

module.exports = router;