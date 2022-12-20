const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    role: { type: String,default:'customer' },
}, { timestamps: true });

const user = mongoose.model('user', usersSchema);
module.exports = user;

