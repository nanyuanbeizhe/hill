var User = require('../models/user.js')
  , mongoose = require('mongoose');

exports.checkUserRole = function(user, roleName){
  if(!user || !user.roles) return false;
  for(var i in user.roles){
    if(roleName == user.roles[i].name) return true;
  }
  return false;
};
