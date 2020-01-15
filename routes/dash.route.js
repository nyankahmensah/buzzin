const router = require('express').Router();
const { dashController } = require('../controllers');

//dashboard
router.get('/', (req, res)=>{
	res.redirect('/dash/index');
});

router.get('/index', dashController.getBooking);

router.post('/booking', dashController.addBooking);

router.delete('/booking', dashController.deleteBooking);

module.exports = router;