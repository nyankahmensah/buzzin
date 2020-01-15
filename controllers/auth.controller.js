const { User } = require('../models');
const { authConstants } = require('../constants');

const login = (req, res) => {
    const { email, password } = req.body;
    User.authenticateAccount(email, password, (err, user, reason)=>{
        if(err){console.log(err)}
        if(user){
            return req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.profile.firstname
                    + ' click to <a href="/logout">logout</a>. '
                    + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/admin');
            });
        }
        req.session.error = reason;
        res.redirect('back');
    })
}

const register = (req, res) => {    const { email, password, firstname, lastname } = req.body;
    const profile = {firstname, lastname};
    User.createAccount( email, password, profile, (err, user, reason)=>{
        if(err){console.log(err)}
        if(user){
            req.session.success = reason;
            return res.redirect('/auth/login');
        }
        req.session.error = reason;
        res.redirect('back');
    })
}

const verifyMail = (req, res) => {
    const { email, token } = req.query;
    User.verifyAccount(email, token, (err, user, reason)=>{
        if(err){return res.json({success: false, message: reason, data: err})}
        if(user){return res.json({success: true, message: reason, data: null})}
        return res.json({success: false, message: reason, data: null})
    })
}

const resetPassword = (req, res) => {
    const { email, token, password } = req.body;
    User.resetAccount(username, token, password, (err, user, reason)=>{
        if(err){return res.json({success: false, message: reason, data: err})}
        if(user){return res.json({success: true, message: reason, data: null})}
        return res.json({success: false, message: reason, data: null})
    })
}

const sendResetMail = (req, res) => {
    const { email } = req.query;
    User.findOne({email}, (err, user)=>{
        if(err){return res.json({success: false, message: authConstants.INTERNAL_ERROR, data: err})}
        if(!user){return res.json({success: false, message: authConstants.ACCOUNT_NOT_FOUND, data: null})}
        user.sendResetMail((err, info)=>{
            if(err){return res.json({success: false, message: authConstants.INTERNAL_ERROR, data: err})}
            return res.json({success: true, message: authConstants.SUCCESS_RESET_MAIL, data: info})
        })
    })
}

const sendVerificationMail = (req, res) => {
    const { email } = req.query;
    User.findOne({email}, (err, user)=>{
        if(err){return res.json({success: false, message: authConstants.INTERNAL_ERROR, data: err})}
        if(!user){return res.json({success: false, message: authConstants.ACCOUNT_NOT_FOUND, data: null})}
        if(user.verification.status){return res.json({success: false, message: authConstants.ALREADY_EXISTS_VERIFICATION, data: null})}
        user.sendVerificationMail((err, info)=>{
            if(err){return res.json({success: false, message: authConstants.INTERNAL_ERROR, data: err})}
            return res.json({success: true, message: authConstants.SUCCESS_VERIFICATION_MAIL, data: info})
        })
    })
}

module.exports = {
    login,
    register,
    verifyMail,
    resetPassword,
    sendResetMail,
    sendVerificationMail
}