const { Booking, Schedule } = require('../models')

//finally done
const addBooking = (req, res) => {
    const { schedule } = req.body;
    const user = req.session.user._id;
    console.log(req.session.user)
    const newBooking = new Booking({user, schedule})
    newBooking.save(function(err){
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('/dash/index')
        }
        req.session.success = 'Schedule added successfully';
        return res.redirect('/dash/index')
    })
}

//finally done
const deleteBooking = (req, res) => {
    const { _id } = req.session.user._id
    Booking.findOneAndDelete({user:_id}, (err, booking)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('dash/index')
        }
        req.session.success = 'Schedule deleted successfully';
        return res.redirect('/dash/index');
    })
}

//finally done
const getBooking = (req, res) => {
    const { _id } = req.session.user
    Booking.findOne({user: _id},{__v: 0}, (err, booking)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.render('dash/index')
        }
        Schedule.find({},{ __v: 0}, (err, schedules)=>{
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.render('dash/index', {booking})
            }
            return res.render('dash/index', {booking, schedules})
        })
    }).populate({
        path: 'schedule',
        populate: { path: 'bus'}
    })
} 

module.exports = {
    addBooking,
    deleteBooking,
    getBooking
}