const router = require('express').Router();
const { authController } = require('../controllers');

//login user
router.get('/login', (req, res)=>{
	res.render('auth/login');
});
router.post('/login', authController.login);

//register user
router.get('/register', (req, res)=>{
	res.render('auth/register');
});
router.post('/register', authController.register);


//forgot user password
router.get('/forgot', (req, res)=>{
	res.render('auth/forgot');
});
router.post('/forgot', authController.register);


//verify user
router.post('/verify', authController.verifyMail);

//send verification mail
router.get('/verify', authController.sendVerificationMail);

//send reset mail
router.get('/reset', authController.sendResetMail);

//reset password
router.post('/reset', authController.resetPassword);

module.exports = router;