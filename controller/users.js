const express = require('express');
const router =  express.Router();
const { check, validationResult } = require('express-validator');
const randomstring = require("randomstring");
const multer = require("multer");
const path = require('path');
const jwt = require('jsonwebtoken');
const Users = require('../model/Users');
const Referrals = require('../model/Referrals');
const token_secret = process.env.TOKEN_SECRET || 3000;


router.get('/', async function(req, res) {
    try {
        const users = await Users.find().sort({date_n_time: -1}).limit(100);
        res.json({
            status:true,
            message:users
        });
    } 
    catch(err) {
        res.json({message : err});
    }
});



router.post('/register', [
    check('username')
    .trim()
    .not().isEmpty().withMessage('The Username field is required.')
    .isAlphanumeric().withMessage('The Username field is contain only alphabets and numbers.')
    .isLength({ min: 4 }).withMessage('The Username field must be at least 4 characters in length.'),
    check('full_name')
    .trim()
    .not().isEmpty().withMessage('The Full Name field is required')
    .isLength({ min: 4 }).withMessage('The Full Name field must be at least 4 characters in length.'),
    check('email_id')
    .isEmail().withMessage('The Email ID field must be contain valid email.')
    .normalizeEmail(),
    check('mobile_number')
    .not().isEmpty().withMessage('The Mobile Number field is required.')
    .isDecimal().withMessage('The Mobile Number field must be contain only numbers.')
    .isLength({ min: 5 }).withMessage('The Mobile Number field must be at least 5 characters in length.')
    .isLength({ max: 20 }).withMessage('The Mobile Number field must be less than 20 characters in length.'),
    check('password')
    .isLength({ min: 6 }).withMessage('The Password field must be at least 6 characters in length.')
], async function(req, res) {
    const errors =  validationResult(req);
    let myArray = [];
    var errObj = {}
    
    //if errrors are not empty then re-arranging the errors
    if(!errors.isEmpty())
    {   
        var errors_array = errors.array();
        
        for(var key in errors_array) 
        {   
            obj = errors_array[key];
            var msg = obj.msg;
            var param = obj.param;
            errObj[param] = msg;
        }
        
    }

    //check unique for username , email_id, mobile_number
    const checkUsername = await Users.findOne({username:req.body.username});
    if(checkUsername != null) 
    {   
        
        var msg = 'This Username is already exist.'; 
        var param = 'username';
        errObj[param] = msg;
    }

    const checkMobileNumber = await Users.findOne({mobile_number:req.body.mobile_number});
    if(checkMobileNumber != null) 
    {   
        var msg = 'This Mobile Number is already exist.'; 
        var param = 'mobile_number';
        errObj[param] = msg;
    }


    const checkEmailID = await Users.findOne({email_id:req.body.email_id});
    if(checkEmailID != null) 
    {   
        var msg = 'This Email ID is already exist.'; 
        var param = 'email_id';
        errObj[param] = msg;
    }


    var referral_row_id = '5f2a463fad55fa2f80f1a312';
    if(req.body.referral_id != null)
    {
        const checkReferralID = await Users.findOne({username:req.body.referral_id});
        if(checkReferralID == null) 
        { 
            var msg = 'The Referral ID is invalid.'; 
            var param = 'referral_id';
            errObj[param] = msg;
        }
        referral_row_id = checkReferralID._id;
    }
    

    

    //myArray lenght is greater than zero it mean that it contains some errors.
    if(Object.keys(errObj).length > 0) 
    {
        res.json({
            status:false,
            message:errObj
        });
    }
    else
    {
        const user =  new Users({
            'username':req.body.username,
            'full_name':req.body.full_name,
            'email_id':req.body.email_id,
            'mobile_number':req.body.mobile_number,
            'password':req.body.password
        })
        user.save()
        .then(async data => {
            if(data._id != '') 
            {   
                var user_row_id = (data._id).toString();
                const jwt_token = jwt.sign({ _id: data._id }, token_secret);
                var finalData = await Users.findOne({_id:data._id});  
                finalData['token'] = jwt_token; 

                const getReferralLevels = await Referrals.findOne({user_row_id:referral_row_id});
                
                var user_row_id = (data._id).toString();
                const referral=  new Referrals({
                    'user_row_id':user_row_id,
                    'refer1':referral_row_id,
                    'refer2':getReferralLevels.refer1,
                    'refer3':getReferralLevels.refer2,
                    'refer4':getReferralLevels.refer3,
                    'refer5':getReferralLevels.refer4
                })
                referral.save()

                res.json({
                    status:true,
                    message:finalData
                });
            }
        })
        .catch(err => {
            res.json({
                status:false,
                message: err
            }); 
        });
    }
    
});



//user login functionality starts here 
router.post('/user_login', [
    check('email_id')
    .isEmail().withMessage('The Email ID field must be contain valid email.')
    .normalizeEmail(),
    check('password')
    .isLength({ min: 6 }).withMessage('The Password field must be at least 6 characters in length.')
], 
async function(req, res) {
    const errors =  validationResult(req);
    let myArray = [];
    var errObj = { }
    //if errrors are not empty then re-arranging the errors
    if(!errors.isEmpty())
    {   
        var errors_array = errors.array();
        
        for(var key in errors_array) 
        {   
            

            obj = errors_array[key];

            var msg = obj.msg;
            var param = obj.param;
            errObj[param] = msg;
        }
    }

    //myArray lenght is greater than zero it mean that it contains some errors.
    if(Object.keys(errObj).length > 0) 
    {
        res.json({
            status:false,
            message:errObj
        });
    }
    else
    {   
        try
        {
            const userData = await Users.findOne({email_id:req.body.email_id});
            if(userData)
            {
                if(userData.password == req.body.password)
                {   
                    var user_row_id = (userData._id).toString();
                    const jwt_token = jwt.sign({ _id: userData._id }, token_secret);
                    var finalData = await Users.findOne({_id:userData._id});
                    finalData['token'] = jwt_token;  
                    res.json({
                        status:true,
                        message:finalData
                    });
                }
                else
                {
                    res.json({
                        status:false,
                        message:{'alert_message':'Invalid Login Credentials'} 
                    });  
                }
            }
            else
            {
                res.json({
                    status:false,
                    message:{'alert_message':'Invalid Login Credentials'} 
                });  
                
            }
            
        }
        catch(err) 
        {
          res.json(err);
        }
        
    }

});


//dashboard me
router.post('/dashboard_me', [
    check('token')
   .trim()
   .not().isEmpty().withMessage('The token field is required.')
], async function(req, res) {
   const errors =  validationResult(req);
   let myArray = [];
   
   //if errrors are not empty then re-arranging the errors
   if(!errors.isEmpty())
   {   
       var errors_array = errors.array();
       
       for(var key in errors_array) 
       {   
          
           obj = errors_array[key];
           var msg = obj.msg;
           var param = obj.param;
           var create_obj = {};
           create_obj[param] = msg;
           myArray.push(create_obj);
       }
   }
   
    try {
        var token_decoded = await jwt.verify(req.body.token, token_secret);
    } catch(err) {
        var msg = 'Invalid Token'; 
        var param = 'token';
        myArray[param] = msg;    
    }
    
   //myArray lenght is greater than zero it mean that it contains some errors.
   if(myArray.length > 0) 
   {  
      res.json({
          status:false,
          message:myArray
      });

   }
   else
   {
      try{
          const usersDashboardMe = await Users.findOne({_id:token_decoded._id});
              res.json({
                  status:true,
                  message:usersDashboardMe
              });
      } catch(err)
      {
          res.json({
              status:false,
              message:"Invalid token"
          });
      }
   }

    
   
});




router.post('/update_personal_detail', [
    check('token')
   .trim()
   .not().isEmpty().withMessage('The token field is required.'),
   check('username')
   .trim()
   .not().isEmpty().withMessage('The Username field is required.')
   .isAlphanumeric().withMessage('The Username field is contain only alphabets and numbers.')
   .isLength({ min: 4 }).withMessage('The Username field must be at least 4 characters in length.'),
   check('full_name')
   .trim()
   .not().isEmpty().withMessage('The Full Name field is required')
   .isLength({ min: 4 }).withMessage('The Full Name field must be at least 4 characters in length.'),
   check('email_id')
   .isEmail().withMessage('The Email ID field must be contain valid email.')
   .normalizeEmail(),
   check('mobile_number')
   .not().isEmpty().withMessage('The Mobile Number field is required.')
   .isDecimal().withMessage('The Mobile Number field must be contain only numbers.')
   .isLength({ min: 5 }).withMessage('The Mobile Number field must be at least 5 characters in length.')
   .isLength({ max: 20 }).withMessage('The Mobile Number field must be less than 20 characters in length.')
], async function(req, res) {
   const errors =  validationResult(req);
   let myArray = [];
   var errObj = { }
   
   //if errrors are not empty then re-arranging the errors
   if(!errors.isEmpty())
   {   
       var errors_array = errors.array();
       
       for(var key in errors_array) 
       {   
          
           obj = errors_array[key];

           var msg = obj.msg;
           var param = obj.param;
           errObj[param] = msg;
       }
   }
   
   //check unique for username , email_id, mobile_number
    var token_decoded = ''; 
    try {
        var token_decoded = await jwt.verify(req.body.token, token_secret);
    } catch(err) {
        var msg = 'Invalid Token'; 
        var param = 'token';
        errObj[param] = msg;    
    }

    if(token_decoded != null)
    {
        const checkUsername = await Users.findOne({username:req.body.username, _id: { $ne: token_decoded}});
        if(checkUsername != null) 
        {   
            var msg = 'This Username is already exist.';
            var param = 'username';
            errObj[param] = msg;
        }

        const checkMobileNumber = await Users.findOne({mobile_number:req.body.mobile_number, _id: { $ne: token_decoded}});
        if(checkMobileNumber != null) 
        {   
            var msg = 'This Mobile Number is already exist.';
            var param = 'mobile_number';
            errObj[param] = msg;
        }


        const checkEmailID = await Users.findOne({email_id:req.body.email_id, _id: { $ne: token_decoded}});
        if(checkEmailID != null) 
        {   
            var msg = 'This Email ID is already exist.';
            var param = 'email_id';
            errObj[param] = msg;
        }
    }
   

   //Object length is greater than zero it mean that it contains some errors.
   if(Object.keys(errObj).length > 0) 
   {
       res.json({
           status:false,
           message:errObj
       });
   }
   else
   {   
       try
       {
           const updatedUser = await Users.updateOne(
           {_id:token_decoded},
           { $set : {full_name:req.body.full_name, username:req.body.username, email_id:req.body.email_id, mobile_number:req.body.mobile_number}}
           );
           res.json({
               status:true,
               message:'Your Profile details has been updated successfully, Thank You!'
           });

       } catch(err) 
       {
           res.json({
               status:false,
               message:err
           });
       }
   }
   
});


//update password details starts here
router.post('/update_password', [
   check('token')
  .trim()
  .not().isEmpty().withMessage('The token field is required.'),
  check('old_password')
  .trim()
  .not().isEmpty().withMessage('The Old Password field is required.'),
  check('new_password')
  .trim()
  .not().isEmpty().withMessage('The New Password field is required')
  .isLength({ min: 6 }).withMessage('The New Password field must be at least 6 characters in length.')
], async function(req, res) {
  const errors =  validationResult(req);
  let myArray = [];
  var errObj = { }
  
  //if errrors are not empty then re-arranging the errors
  if(!errors.isEmpty())
  {   
      var errors_array = errors.array();
      
      for(var key in errors_array) 
      {   
         
          obj = errors_array[key];

          var msg = obj.msg;
          var param = obj.param;
          errObj[param] = msg;
      }
  }
  
   //check unique for username , email_id, mobile_number 
    var token_decoded = '';
    try {
        var token_decoded = await jwt.verify(req.body.token, token_secret);
    } catch(err) {
        var msg = 'Sorry, Invalid Token'; 
        var param = 'token';
        errObj[param] = msg;    
    }
  
    if(token_decoded != null)
    {
        const checkOldPassword = await Users.findOne({password:req.body.old_password, _id:token_decoded});
        if(checkOldPassword === null) 
        {   
            var msg = 'Your Old Password is not matching.';
            var param = 'old_password';
            errObj[param] = msg;
        }
    }
  

  //Object length is greater than zero it mean that it contains some errors.
  if(Object.keys(errObj).length > 0) 
  {
      res.json({
          status:false,
          message:errObj
      });
  }
  else
  {   
      try
      {
          const updatedUser = await Users.updateOne(
          { _id:token_decoded },
          { $set : {password:req.body.new_password}}
          );
          res.json({
              status:true,
              message:'Your Password details has been updated successfully, Thank You!'
          });

      } catch(err) 
      {
          res.json({
              status:false,
              message:err
          });
      }
  }
});

//update password details ends here




router.post('/update_image_base64', async function(req, res) {
    var errObj = {}
         
            if(req.body.token == "")
            {
                var msg = 'The token field is required.';
                var param = 'token';
                errObj[param] = msg; 
            }
            var token_decoded = '';
            if(req.body.token != '')
            {
                try {
                    var token_decoded = await jwt.verify(req.body.token, token_secret);
                } catch(err) {
                    var msg = 'Sorry, Invalid Token'; 
                    var param = 'token';
                    errObj[param] = msg;    
                }
            }
           
            
           

            if(req.body.image_name == "")
            {
                var msg = 'Profile image  field is required.';
                var param = 'image_name';
                errObj[param] = msg; 
            }

           
            if(Object.keys(errObj).length > 0) 
                {
                    res.json({
                        status:false,
                        message:errObj
                    });
                }
                else
                { 
                    const updatedUser = await Users.updateOne(
                        {_id:token_decoded},
                        { $set : {profile_image:req.body.image_name}}
                        );
    
                    res.json({
                        status:true,
                        message:'Profile image is updated successfully, Thank You!'
                    });

                }
            

   
});
//update image details ends here
    



module.exports = router;