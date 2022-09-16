const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    roles: [{
        type: String,
        default: 'New Employee'
    }],
});

module.exports = mongoose.model('User', UserSchema);