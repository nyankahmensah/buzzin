const mongoose = require('mongoose');
const Booking = require('./booking.model');

const BusScheduleSchema = mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bus',
        required: true
    },
    time: {
        type: String,
        required: true,
        enum: ["MORNING", "AFTERNOON", "EVENING"],
        uppercase: true
    },
    destination: {
        type: String,
        required: true,
        uppercase: true
    }
})

const BusSchedule = mongoose.model('schedule', BusScheduleSchema)

module.exports = BusSchedule