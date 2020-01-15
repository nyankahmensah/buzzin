const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Mailer } = require('../helpers');
const { authConstants } = require('../constants');
const {
    MAX_LOGIN_ATTEMPTS,
    LOCK_TIME,
    EXPIRY_TIME,
    RESET_TIME
} = process.env

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        firstname: {
            type: String,
        },
        lastname: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        }
    },
    verification: {
        status: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
        },
        expiry: {
            type: Number
        }
    },
    reset: {
        token: {
            type: String,
        },
        expiry: {
            type: Number
        }
    },
    locker: {
        attempts: {
            type: Number,
            required: true,
            default: 0
        },
        expiry: {
            type: Number
        }
    }
})

UserSchema.virtual('isLocked').get(function(){
    return !!(this.locker && this.locker.expiry && this.locker.expiry > Date.now());
})
UserSchema.pre('save', function(next){
    if(!this.isModified('password')){return next()}
    bcrypt.genSalt(10, (err, salt)=>{
        if(err){return next(err)}
        bcrypt.hash(this.password, salt, (err, hash)=>{
            if(err){return next(err)}
            this.password = hash;
            next();
        });
    });
})

UserSchema.statics.authenticateAccount = function(email, password, next){
    this.findOne({email: email}, function(err, user){
        if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
        if(!user){return next(null, null, authConstants.ACCOUNT_NOT_FOUND)}
        if(user.isLocked){
            return user.incLoginAttempts(function(err){
                if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
                return next(null, null, authConstants.MAX_ATTEMPTS_LOGIN);
            });
        }
        user.comparePassword(password, function(err, isMatch){
            if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
            if(isMatch){
                if(!user.locker && !user.locker.attempts && !user.locker.expiry){return next(null, user)}
                const updates = {
                    $set: { "locker.attempts": 0 },
                    $unset: { "locker.expiry": 1 }
                };
                return user.updateOne(updates, function(err){
                    if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
                    //if(!user.verification.status){return next(null, null, authConstants.ACCOUNT_NOT_VERIFIED)}
                    const {_id, email, profile} = user
                    return next(null, {_id, email, profile}, authConstants.SUCCESS_LOGIN);
                });
            }
            user.incLoginAttempts(function(err){
                if(err){return nex(err, null, authConstants.INTERNAL_ERROR)}
                return next(null, null, authConstants.PASSWORD_INCORRECT);
            });
        });
    });
}
UserSchema.statics.createAccount = function( email, password, profile, next){
    this.findOne({email}, (err, user)=>{
        if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
        if(user){return next(null, null, authConstants.ALREADY_EXISTS_EMAIL)}
        const newUser = new User({ email, password, profile})
        newUser.save(function(err){
            if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
            //newUser.sendVerificationMail(function(err, info){
            //    if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
            //    if(!info){return next(null, null, authConstants.ERROR_VERIFICATION_MAIL)}
                return next(null, newUser, authConstants.SUCCESS_REGISTRATION)
            //})
        })
    })
}
UserSchema.statics.verifyAccount = function(email, token, next){
    this.findOne({email}, function(err, user){
        if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
        if(!user){return next(null, null, authConstants.ACCOUNT_NOT_FOUND)}
        if(user.verification.status){return next(null, null, authConstants.ALREADY_EXISTS_VERIFICATION)}
        if(user.verification.expiry < Date.now()){return next(null, null, authConstants.VERIFICATION_TOKEN_EXPIRED)}
        if(user.verification.token !== token){return next(null, null, authConstants.VERIFICATION_TOKEN_INVALID)}
        user.updateOne({
            $unset: {"verification.token": 1, "verification.expiry": 1},
            $set: {"verification.status": true}
        }, function(err){if(err){return next(err, null, authConstants.INTERNAL_ERROR)}})
        return next(null, user, authConstants.SUCCESS_VERIFICATION);
    })
}
UserSchema.statics.resetAccount = function(email, token, password, next){
    this.findOne({email}, function(err, user){
        if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
        if(!user){return next(null, null, authConstants.ACCOUNT_NOT_FOUND)}
        if(user.reset.expiry < Date.now()){return next(null, null, authConstants.RESET_TOKEN_EXPIRED)}
        if(user.reset.token !== token){return next(null, null, authConstants.RESET_TOKEN_INVALID)}
        user.updateOne({
            $unset: {"reset.token": 1, "reset.expiry": 1}
        }, function(err){if(err){return next(err, null, authConstants.INTERNAL_ERROR)}})
        user.password = password;
        user.save((err)=>{
            if(err){return next(err, null, authConstants.INTERNAL_ERROR)}
            return next(null, user, authConstants.SUCCESS_RESET);
        })
    })
}

UserSchema.methods.comparePassword = function(password, next){
    bcrypt.compare(password, this.password, function(err, isMatch){
        if(err){return next(err)}
        next(null, isMatch);
    });
}
UserSchema.methods.incLoginAttempts = function(next){
    if(this.locker && this.locker.expiry && this.locker.expiry < Date.now()){return this.updateOne({$set: { "locker.attempts": 1 }, $unset: { "locker.expiry": 1 }}, next)}
    var updates = { $inc: { 'locker.attempts': 1 } };
    if(this.locker && this.locker.attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked){updates.$set = { "locker.expiry": Date.now() + Number(LOCK_TIME) }}
    return this.updateOne(updates, next);
}
UserSchema.methods.sendResetMail = function(next){
    const token = crypto.randomBytes(16).toString('hex');
    this.updateOne({$set: {"reset.token": token, "reset.expiry": Date.now() + Number(RESET_TIME)}}, (err)=>{
        if(err){return next(err)}
        const mailer = new Mailer();
        console.log(this.email)
        mailer.sendResetMail({email: this.email, username: this.profile.firstname+''+this.profile.lastname, token}, (err, info)=>{
            if(err){return next(err)}
            return next(null, info)
        })
    })
}
UserSchema.methods.sendVerificationMail = function(next){
    const token = crypto.randomBytes(16).toString('hex');
    this.updateOne({$set: {"verification.token": token, "verification.expiry": Date.now() + Number(EXPIRY_TIME)}}, (err)=>{
        if(err){return next(err)}
        const mailer = new Mailer();
        mailer.sendVerificationMail({email: this.email, username: this.profile.firstname+''+this.profile.lastname, token}, (err, info)=>{
            if(err){return next(err)}
            return next(null, info)
        })
    })
}

const User = mongoose.model('user', UserSchema);
module.exports = User;