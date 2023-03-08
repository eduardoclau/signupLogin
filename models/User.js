const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


//Create User Schema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
});




const User = mongoose.model('User', userSchema);

module.exports = User;
