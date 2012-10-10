var Food = require('../models/food.js')
  , User = require('../models/user.js')
  , cryptUtil = require('../utils/crypt.js')
  , mongoose = require('mongoose');

  mongoose.connect('mongodb://localhost/pantry');

var user = new User;
user.email = 'xinyuan@36node.com';
user.password = cryptUtil.md5('xinyuan');
user.name = '鑫缘';
user.active = true;
user.roles.push({name: 'shopAdmin'});
user.save(function(err){
	if(err){
		return console.log('User save failed: ' + user.name);
	}
});