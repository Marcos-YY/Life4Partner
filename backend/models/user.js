const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String
    },
    phone:{
        type:String,
        required:true
    }
},
{timestamps:true}
)

const User = mongoose.model('users', UserSchema)

module.exports = User;
