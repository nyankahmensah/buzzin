const router = require('express').Router();
const { adminController } = require('../controllers');

const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts);

router.get('/', (req, res)=>{
	res.redirect('/admin/users')
});

router.get('/buses', adminController.getBuses);

router.get('/schedules', adminController.getSchedules);

router.get('/users', adminController.getUsers);

router.get('/requests', (req, res)=>{
	res.render('admin/requests')
});

router.get('/profile', (req, res)=>{
	res.render('admin/profile')
});

router.post('/buses', adminController.addBus);

router.post('/schedules', adminController.addSchedule);

router.get('/buses/:_id', adminController.deleteBus);

router.get('/schedules/:_id', adminController.deleteSchedule);


module.exports = router;