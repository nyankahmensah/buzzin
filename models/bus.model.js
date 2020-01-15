const mongoose = require('mongoose')

const BusSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    capacity: {
        type: String,
        required: true,
        uppercase: true
    },
    brand: {
        type: String,
        required: true,
        uppercase: true
    }
})

const Bus = mongoose.model('bus', BusSchema);
module.exports = Bus;