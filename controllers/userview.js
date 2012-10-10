var User = require('../models/user.js')
  , mongoose = require('mongoose')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , cryptUtil = require('../utils/crypt.js')
  , userManager = require('../manager/userManager.js')
  , mails = require('../utils/mails.js');

var session_secret = "lalala";
var auth_cookie_name = "idianke";

//TODO: remove password fields, it is too dangrous
exports.loadUsers = function(req, res){
  console.log(new Date().toLocaleString() + "> request user list");

  if(!req.session.user || !userManager.checkUserRole(req.session.user, 'admin'))
    return res.send(400, {message: 'you are not authenticated to load users!'});

  User.find(function(err, users){
    if(err) return res.send(500, {message: 'error in db while load users.'});
    res.send(wrapUserResultsToWeb(users));
  });
};

exports.loadUser = function(req, res){
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> request user with id: " + id);

  if(!req.session.user || ((req.session.user._id != id) && !userManager.checkUserRole(req.session.user, 'admin')))
    return res.send(400, {message: 'you are not authenticated to load users!'});
  
  User.findById(id, function(err, user){
    if(err) return res.send(500, {message: 'error in db while load user: ' + id});
    res.send(wrapUserResultToWeb(user));
  });
}

exports.createUser = function(req, res, next){
  console.log(new Date().toLocaleString() + "> create user with id");

  if (!req.body.email || !req.body.password || !req.body.name) 
    return res.send(400, {message: 'Missing email/password/name!'});

  var user = new User();
  var password = sanitize(req.body.password).trim();
  var email = sanitize(req.body.email).trim();
  var name = sanitize(req.body.name).trim();

  password = sanitize(password).xss();
  email = email.toLowerCase();
  email = sanitize(email).xss();
    
  try {
    check(email, '不正确的电子邮箱。').isEmail();
  } catch(e) {
    console.log('Email is not correct'); 
    res.send(400, {message: 'Email is not correct!'});
    return;
  }

  if(!checkEmailIsMSTR(email)) {
    res.send(400, {message: "Failed, we need microstrategy mail!"});
    return;
  }

  User.find({'email':email}, function (err,users){
    if(err) res.send(500, {message: 'error in db while finding user for email: ' + email});
    if(users.length >  0){
      console.log('Email has been used: ' + email);
      res.send(400, {message: "Email has been used!"});
      return;
    }
    
    // md5 the password
    password = cryptUtil.md5(password);
    // create gavatar
    var avatar_url = 'http://www.gravatar.com/avatar/' + cryptUtil.md5(email) + '?size=48';

    var user = new User();
    user.name = name;
    user.password = password;
    user.email = email;
    user.avatar = avatar_url;
    user.active = false;
    user.save(function(err){
      if(err) res.send(500, {message: 'DB in error while save new user!'});
      mails.activeAccount(email, cryptUtil.md5(email + '7238'),function(success){
        if(!success){
          console.log( 'send email failed: ' + email );
        }
      });
      console.log('Server have send an email to the new created user: ' + email);
      res.send(wrapUserResultToWeb(user));
    });
  });
};

exports.updateUser = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> update user with id: " + id);

  if(!req.session.user || ((req.session.user._id != id) && !userManager.checkUserRole(req.session.user, 'admin')))
    return res.send(400, {message: 'you are not authenticated to update user!'});

  User.findById(id, function(err, user){
    if(err) return res.send(500, {message: 'error in db while update user: ' + id});
    
    // change password
    if(req.body.password) {
      if(cryptUtil.md5(req.body.old_password) != user.password) 
        return res.send(400, {message: 'Please enter correct old password!'});
      var password = req.body.password;
      user.password = cryptUtil.md5(password);
    }

    if(req.body.name) user.name = req.body.name;
    if(req.body.roles) user.roles = req.body.roles;
    if(req.body.emailNotify) user.emailNotify = req.body.emailNotify;
    if(req.body.active) user.active = req.body.active;

    user.save(function (err) {
      if(err) return res.send(500, {message: 'error in db while update user: ' + id});
      res.send(wrapUserResultToWeb(user));
    });
  });
};

exports.deleteUser = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> delete user with id: " + id);

  if(!userManager.checkUserRole(req.session.user, 'admin'))
    return res.send(400, {message: 'you are not authenticated to load users!'});

  User.findByIdAndRemove(id, function (err) {
    if(err) return res.send(500, {message: 'error in db while delete user: ' + id});
    res.send('success');
  });
};

exports.activeAccount = function(req, res) {
  var key = req.query.key;
  var email = req.query.email;
  if(cryptUtil.md5(email + '7238') != key) return res.send(400, {message: 'Active key is error.'});

  User.findOne({'email':email}, function (err,user){
    if(!user) return res.send(404, {message: 'user is not existed.'});
    if(user.active) return res.send(400, {message: 'user is already activated.'});
    
    user.active = true;
    user.save(function (err, user){
      if(err) return res.send(500, {message: 'Error in db while actvating user.'});
      res.send(wrapUserResultToWeb(user));
    }); 
  });
};

exports.resetPassword = function(req, res) {
  var email = req.params.email;
  if(!email) return res.send(400, {message: 'Email is missing'});
  console.log('comming reset password request: ' + email);

  User.findOne({'email':email}, function (err,user){
    if(!user) return res.send(404, {message: 'user is not existed.'});

    var password = cryptUtil.randomString(6);
    user.password = cryptUtil.md5(password);

    user.save(function (err, user){
      if(err) return res.send(500, {message: 'Error in db while actvating user.'});
      
      mails.resetPassword(email, password, function(success){
        if(!success) return res.send(500, {message: 'Send reset password email failed: ' + email });
        return res.send(wrapUserResultToWeb(user));
      });
    }); 
  });
};

function wrapUserResultToWeb(user){
  var webResult = {};
  webResult.email = user.email;
  webResult.name = user.name;
  webResult.roles = user.roles;
  webResult.avatar = user.avatar;
  webResult.credits = user.credits;

  return webResult;
}

function wrapUserResultsToWeb(users){
  var results =new Array();
  for(var i in users){
    results.push(wrapUserResultToWeb(users[i]));
  }

  return results;
}

function checkEmailIsMSTR(email){
  // special
  if(email == 'manch.09@sem.tsinghua.edu.cn') return true;

  // @microstrategy.com
  var kj = email.split('@');
  if(kj[1] == 'microstrategy.com') return true;

  return false;
}
