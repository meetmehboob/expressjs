const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
    user_row_id:{
        type:String,
        required:[true, 'The User Row ID field is required'],
        min: [4, 'The User Row ID field must be atleast 4 characters in length.'],
        unique: true
    },
    refer1:{
        type:String,
        required:[true, 'The Referral One ID field is required']
    },
    refer2:String,
    refer3:String,
    refer4:String,
    refer5:String
});
module.exports = mongoose.model('cln_referrals', referralSchema);