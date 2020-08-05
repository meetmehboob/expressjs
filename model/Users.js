const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true, 'The Username field is required'],
        min: [4, 'The Username field must be atleast 4 characters in length.'],
        unique: true
    },
    full_name:{
        type:String,
        required:[true, 'The Full Name field is required'],
        min: [4, 'The Full Name field must be atleast 4 characters in length.']
    },
    email_id:{
        type:String,
        required:[true, 'The Email iD field is required'],
        min: [4, 'The Email iD field must be atleast 4 characters in length.'],
        unique: true
    },
    mobile_number:{
        type:String,
        required:[true, 'The Mobile Number field is required'],
        min: [4, 'The Mobile Number field must be atleast 4 characters in length.'],
        unique: true
    },
    password:{
        type:String,
        required:[true, 'The password field is required']
    },
    referral_id:String,
    login_status:{
        type:Boolean,
        default:true
    },
    profile_image:String,
    token:String,
    forgot_password_status:String,
    forgot_password_otp:Number,
    forgot_password_code:String,
    date_n_time:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model('cln_users', usersSchema);