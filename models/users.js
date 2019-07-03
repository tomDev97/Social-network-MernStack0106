const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, default: Date.now },
    registedDate: { type: Date, default: Date.now },
    imgage : String,
    friends: [ //ban 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    friendRequest: [ //nguoi minh gui ket ban
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    guestRequest: [ //nguoi gui minh ket ban
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    status : { type : Number, default : -1 }
});

const User = mongoose.model('user', UserSchema);

module.exports = {
    User, UserSchema
}