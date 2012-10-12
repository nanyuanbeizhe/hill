var User = require('../models/user.js')
  , mongoose = require('mongoose')
  , cryptUtil = require('../utils/crypt.js')
  , sanitize = require('validator').sanitize;

var session_secret = "lalala";

exports.createSession = function(req, res) {
  console.log(new Date().toLocaleString() + "> comming new session." );
  var email = '';
  var password = '';

  if(req.body.userCookie){
    var cookie = req.cookies['auth_token'];
    if(!cookie) return res.send(400, {message: 'No auth token provided.'});

    var auth_token = cryptUtil.decrypt(cookie, session_secret);
    var auth = auth_token.split('\t');
    email = auth[1];
  }else{
    if (!req.body.email) {
      return res.send(400, {message:'missing email'});
    }

    if (!req.body.password) {
      return res.send(400, {message:'missing password'});
    }
    email = sanitize(req.body.email).trim().toLowerCase();
    password = sanitize(req.body.password).trim();
  }
  

  User.findOne({ 'email': email }, function (err, user) {
    if (err) return res.send(500, {message: 'Error in db while find user: ' + email});
    if (!user) return res.send(404, {message:'invalid email'});
    
    if (!req.body.userCookie && cryptUtil.md5(password) !== user.password)
      return res.send(400, {message:'password error'});

    if (!user.active) return res.send(400, {message:'account is not activated' });
    console.log('user: ' + user.name + ' login successfully!');

    // store session & cookie
    req.session.user = user;
    var auth_token = cryptUtil.encrypt(user._id + '\t'+user.email + '\t' + user.password, session_secret);
    res.cookie('auth_token', auth_token, {path: '/',maxAge: 1000*60*60*24*30}); //cookie 有效期30天
    
    res.send({'auth':true, 'email':email, 'id': req.session.id, 'userName':user.name, 'roles':user.roles, 'userId': user._id});
  });
};

exports.deleteSession = function(req, res) {
  if(!req.session.user) return res.send(400,{message: 'You have not login'})
  console.log('delete session of user:' + req.session.user.name );
  req.session.destroy();
  res.clearCookie('auth_token', { path: '/' });
  res.send({success: true});
};

exports.getSession = function(req, res) {

};