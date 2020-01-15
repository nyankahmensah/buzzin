const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'schedule',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

const Booking = mongoose.model('booking', BookingSchema)

module.exports = Booking