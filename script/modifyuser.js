var User = require('../models/user.js')
  , cryptUtil = require('../utils/crypt.js')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pantry');

User.findOne({'email':'tiawang@microstrategy.com'}, function(err, user){
	if(err) return console.log('error while find user: tiawang@microstrategy.com');
	if(!user) return console.log('can not find user: tiawang@microstrategy.com');

	user.roles.push({name: 'admin'});
	user.save(function(err){
	  if(err){
	    return console.log('User save failed: ' + user.name);
	  }
	});
});