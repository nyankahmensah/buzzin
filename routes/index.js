const authRoutes = require('./auth.route');
const adminRoutes = require('./admin.route');
const dashRoutes = require('./dash.route');

const router = require('express').Router();

router.get('/', (req, res)=>{
	res.redirect('/dash');
})

//admin routes
router.use('/admin', (req, res, next) => {
    if (req.session.user && req.session.user.profile.isAdmin) {
    	res.locals.user = req.session.user;
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/auth/login');
    }
}, adminRoutes);

//user routes
router.use('/dash', (req, res, next) => {
    if (req.session.user) {
    	res.locals.user = req.session.user;
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/auth/login');
    }
}, dashRoutes);

//verify user
router.use('/auth', (req, res, next) => {
	if (req.session.user) {
        if ( req.session.user.profile.isAdmin){
            res.redirect('/admin');
        }
        else{
            res.redirect('/dash');
        }
    } else {
        next();
    }
}, authRoutes);

//logout user
router.get('/logout', (req, res)=>{
	req.session.destroy(function(){
	    res.redirect('/auth/login');
	});
});

module.exports = router;