const { Bus, Schedule, Booking } = require('../models')
const { busConstants } = require('../constants')

const getUsers = (req, res) => {
    Booking.find({},{_id: 0, __v: 0}, (err, bookings)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.render('admin/users')
        }
        console.log(bookings)
        return res.render('admin/users', {bookings})
    }).populate('user', '-_id profile').populate({
        path: 'schedule',
        populate: { path: 'bus'}
    })
}

const getBuses = (req, res) => {
    Bus.find({},{ __v: 0}, (err, buses)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.render('admin/buses')
        }
        return res.render('admin/buses', {buses})
    })
}

const getSchedules = (req, res) => {
    Schedule.find({},{ __v: 0}, (err, schedules)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.render('admin/schedules')
        }
        Bus.find({},{ __v: 0}, (err, buses)=>{
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.render('admin/schedules', {schedules})
            }
            return res.render('admin/schedules', {schedules, buses})
        })
    }).populate('bus', '-_id -__v')
}

const addBus = (req, res) => {
    const { number, brand, capacity } = req.body
    Bus.findOne({number}, (err, bus)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('/admin/buses')
        }
        if(bus){
            req.session.error = 'Bus already exists';
            return res.redirect('/admin/buses')
        }
        const newBus = new Bus({number, brand, capacity})
        newBus.save(function(err){
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.redirect('/admin/buses')
            }
            req.session.success = 'Bus added successfully';
            return res.redirect('/admin/buses')
        })
    })
}

const addSchedule = (req, res) => {
    const { bus, time, destination } = req.body
    Schedule.findOne({ time, destination, bus }, (err, schedule)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('/admin/schedules')
        }
        if(schedule){
            req.session.error = 'Schedule already exists';
            return res.redirect('/admin/schedules')
        }
        Bus.findById(bus, (err, bus)=>{
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.redirect('/admin/schedules')
            }
            if(!bus){
                req.session.error = 'Bus does not exist';
                return res.redirect('/admin/schedules')
            }
            const newSchedule = new Schedule({bus, time, destination})
            newSchedule.save(function(err){
                if(err){
                    req.session.error = 'INTERNAL_ERROR';
                    return res.redirect('/admin/schedules')
                }
                req.session.success = 'Schedule added successfully';
                return res.redirect('/admin/schedules')
            })
        })
    }).populate('bus', 'number capacity')
}

const deleteBus = (req, res) => {
    const { _id } = req.params
    Bus.findById(_id, (err, bus)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('/admin/buses')
        }
        if(!bus){
            req.session.error = 'Bus does not exist';
            return res.redirect('/admin/buses')
        }
        Schedule.deleteMany({
            bus: bus._id
        },(err)=>{
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.redirect('/admin/buses')
            }
        })
        bus.deleteOne(function(err){
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.redirect('/admin/buses')
            }
            req.session.success = 'Bus deleted successfully';
            return res.redirect('/admin/buses')
        })
    })
}

const deleteSchedule = (req, res) => {
    const { _id } = req.params
    Schedule.findById(_id, (err, schedule)=>{
        if(err){
            req.session.error = 'INTERNAL_ERROR';
            return res.redirect('/admin/schedules')
        }
        if(!schedule){
            req.session.error = 'Schedule does not exist';
            return res.redirect('/admin/schedules')
        }
        Booking.deleteMany({schedule: schedule._id}, (err)=>{
            if(err){
                req.session.error = 'INTERNAL_ERROR';
                return res.redirect('/admin/schedules')
            }
            schedule.deleteOne(function(err){
                if(err){
                    req.session.error = 'INTERNAL_ERROR';
                    return res.redirect('/admin/schedules')
                }
                req.session.success = 'Schedule deleted successfully';
                return res.redirect('/admin/schedules')
            })
        })
    })
}

module.exports = {
    getBuses,
    getUsers,
    getSchedules,
    addBus,
    addSchedule,
    deleteBus,
    deleteSchedule
}