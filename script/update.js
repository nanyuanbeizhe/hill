var Food = require('../models/food.js')
  , User = require('../models/user.js')
  , cryptUtil = require('../utils/crypt.js')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pantry');

User.findOne({'email':'xinyuan@36node.com'}, function(err, user){
	if(err) return console.log('can not find user: xinyuan');

	Food.findById('504c934b8ba15c710d000003', function(err, food){
		if(err) return console.log(err);
		food.description = '米饭 酱香大鸡腿 扁豆焖肉 肉末豆腐';
		food.shopAdmin = user._id;
		food.save(function (err, food){
			if(err) return console.log(err);
			console.log('8 set food updated: ');
			console.log(food);
		});
	});

	Food.findById('504c934b8ba15c710d000005', function(err, food){
		if(err) return console.log(err);
		food.description = '米饭 酱香大鸡腿 扁豆肉片 肉末豆腐 豆豉鳞鱼 油麦菜 水果';
		food.shopAdmin = user._id;
		food.save(function (err, food){
			if(err) return console.log(err);
			console.log('10 set food updated: ');
			console.log(food);
		});
	});

	Food.findById('504c934b8ba15c710d000007', function(err, food){
		if(err) return console.log(err);
		food.description = '米饭 酱香大鸡腿 糖醋里脊 扁豆焖肉 肉末豆腐 豆豉鳞鱼油 麦菜 饮料或酸奶';
		food.shopAdmin = user._id;
		food.save(function (err, food){
			if(err) return console.log(err);
			console.log('12 set food updated: ');
			console.log(food);
		});
	});

	Food.findById('504c934b8ba15c710d000009', function(err, food){
		if(err) return console.log(err);
		food.shopAdmin = user._id;
		food.save(function (err, food){
			if(err) return console.log(err);
			console.log('rice updated: ');
			console.log(food);
		});
	});

});
