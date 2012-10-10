var cryptUtil = require('./crypt.js')
  , User = require('../models/user.js')
  , session_secret = "lalala"
  , auth_cookie_name = "idianke";

// auth_user middleware
exports.auth_user = function(req,res,next){
  console.log(req.path);
/*  if(req.session.user){
      res.local('current_user',req.session.user);
      return next();
  }else{
    var cookie = req.cookies[auth_cookie_name];
    if(!cookie) return next();

    var auth_token = cryptUtil.decrypt(cookie, session_secret);
    var auth = auth_token.split('\t');
    var user_id = auth[0];
    User.findOne({_id:user_id},function(err,user){
      if(err) return next(err);
      if(user){
          req.session.user = user;
          res.local('current_user',req.session.user);
          return next();
      }else{
        return next();  
      }
    });*/ 
}