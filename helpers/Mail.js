const nodemailer = require('nodemailer');
const { SMTP_USERNAME, SMTP_PASSWORD, HOST, PORT } = process.env;

class Mailer{
    constructor(){
        this.transporter = nodemailer.createTransport({
            name: 'COMPSSA',
            email: 'asseyink@gmail.com',
            service: 'gmail',
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD
            }
        })
    }

    sendResetMail(data, next){
        const mail = {
            from:'"COMPSSA" <asseyink@gmail.com>',
            to: data.email,
            subject:'Password Reset for COMPSSA Timetable',
            text:
            `<body>
                <p>Copy and past this link in your browser to reset your email. https://localhost:3000/api/v1/reset?username=${data.username}&token=${data.token}</p>
                <a href="${HOST}:${PORT}/api/v1/reset?username=${data.username}&token=${data.token}">Reset Email</a>
            </body>`
        }
        this.transporter.sendMail(mail, function(err, info){
            console.log(err, info)
            if(err){return next(err)}
            return next(null, info)
        });
    }
    
    sendVerificationMail(data, next){
        const mail = {
            from:'"COMPSSA" <asseyink@gmail.com>',
            to: data.email,
            subject:'Email Verification for COMPSSA Timetable',
            html:
            `<body>
                <p>Copy and past this link in your browser to verify your email. https://localhost:3000/api/v1/verify?username=${data.username}&token=${data.token}</p>
                <a href="${HOST}:${PORT}/api/v1/verify?username=${data.username}&token=${data.token}">Verify Email</a>
            </body>`
        }
        this.transporter.sendMail(mail, function(err, info){
            if(err){return next(err)}
            return next(null, info)
        });
    }
}

module.exports = Mailer;