var Food = require('../models/food.js')
  , User = require('../models/user.js')
  , cryptUtil = require('../utils/crypt.js')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pantry-test');

var myFoods=new Array(24);

var user = new User;
user.email = 'admin@test.com';
user.password = cryptUtil.md5('mse@2008');
user.name = 'admin';
user.active = true;
user.roles.push({name: 'admin'});
user.roles.push({name: 'shopAdmin'});
user.save(function(err){
  if(err){
    return console.log('User save failed: ' + user.name);
  }
});

var ningjing= new User;
ningjing.email = 'jning@microstrategy.com';
ningjing.password = cryptUtil.md5('12345678');
ningjing.name = '宁静';
ningjing.active = true;
ningjing.roles.push({name: 'shopAdmin'});
ningjing.save(function(err){
  if(err){
    return console.log('ningjing save failed: ' + ningjing.name);
  }
});

myFoods[0]              = new Food;
myFoods[0].description  = '米饭 葱香鸭翅 宫保鸡丁 红烧茄子 (8rmb set)';
myFoods[0].title        = '八元套餐';
myFoods[0].price        = 8.00;
myFoods[0].images.push({url : '/images/xin8.jpg', width : 328, height : 440});
myFoods[0].shopName   = '欣雨';
myFoods[0].shopAdmin  = ningjing._id;

myFoods[1]              = new Food;
myFoods[1].description  = '米饭 葱香鸭翅 宫保鸡丁 红烧茄子 韭菜炒豆芽 水果(10rmb set)';
myFoods[1].title        = '十元套餐';
myFoods[1].price        = 10.00;
myFoods[1].images.push({url : '/images/xin10.jpg', width : 440, height : 500});
myFoods[1].shopName   = '欣雨';
myFoods[1].shopAdmin  = ningjing._id;

myFoods[2]              = new Food;
myFoods[2].description  = '米饭 葱香鸭翅 宫保鸡丁 油闷大虾 红烧茄子 韭菜炒豆芽 饮料或酸奶(12rmb set)';
myFoods[2].title        = '十二元套餐';
myFoods[2].price        = 12.00;
myFoods[2].images.push({url : '/images/xin12.jpg', width : 328, height : 440});
myFoods[2].shopName   = '欣雨';
myFoods[2].shopAdmin  = ningjing._id;

myFoods[3]              = new Food;
myFoods[3].description  = '订欣雨套餐后可免费加米饭 (rice)';
myFoods[3].title        = '米饭';
myFoods[3].price        = 0.00;
myFoods[3].images.push({url : '/images/xin0.jpg', width : 328, height : 440});
myFoods[3].shopName   = '欣雨';
myFoods[3].shopAdmin  = ningjing._id;

myFoods[4]              = new Food;
myFoods[4].description  = '香菇滑鸡饭 (Mushroom chicken+rice)';
myFoods[4].title        = '香菇滑鸡饭';
myFoods[4].price        = 13.00;
myFoods[4].images.push({url : '/images/2.jpg', width : 328, height : 440});
myFoods[4].shopName 	= '欧乐';
myFoods[4].shopAdmin 	= ningjing._id;

myFoods[5]              = new Food;
myFoods[5].description  = '香菇滑鸡饭 + 香滑蒸蛋 + 豆浆 (Mushroom chicken + rice + steamed egg + Soya-bean milk)';
myFoods[5].title        = '香菇滑鸡餐';
myFoods[5].price        = 20.00;
myFoods[5].images.push({url: '/images/2.jpg', width : 328, height : 440});
myFoods[5].shopName 	= '欧乐';
myFoods[5].shopAdmin 	= ningjing._id;

myFoods[6]              = new Food;
myFoods[6].description  = '风味卤肉饭 (Flavour Lurou + rice)';
myFoods[6].title        = '风味卤肉饭';
myFoods[6].price        = 13.00;
myFoods[6].images.push({url : '/images/3.jpg', width : 328, height : 440});
myFoods[6].shopName 	= '欧乐';
myFoods[6].shopAdmin 	= ningjing._id;

myFoods[7]              = new Food;
myFoods[7].description  = '风味卤肉饭 + 香滑蒸蛋 + 豆浆 (Flavour Lurou + rice + steamed egg + Soya-bean milk)';
myFoods[7].title        = '风味卤肉餐';
myFoods[7].price        = 20.00;
myFoods[7].images.push({url : '/images/3.jpg', width : 328, height : 440});
myFoods[7].shopName   = '欧乐';
myFoods[7].shopAdmin  = ningjing._id;

myFoods[8]              = new Food;
myFoods[8].description  = '金牌照烧饭 (Sauce chicken + rice)';
myFoods[8].title        = '金牌照烧饭';
myFoods[8].price        = 14.00;
myFoods[8].images.push({url : '/images/4.jpg', width : 328, height : 440});
myFoods[8].shopName   = '欧乐';
myFoods[8].shopAdmin  = ningjing._id;

myFoods[9]              = new Food;
myFoods[9].description  = '金牌照烧饭 + 香滑蒸蛋 + 豆浆 (Sauce chicken + rice + steamed egg + Soya-bean milk)';
myFoods[9].title        = '金牌照烧餐';
myFoods[9].price        = 21.00;
myFoods[9].images.push({url : '/images/4.jpg', width : 328, height : 440});
myFoods[9].shopName   = '欧乐';
myFoods[9].shopAdmin  = ningjing._id;

myFoods[10]              = new Food;
myFoods[10].description  = '川香鸡肉饭 (Spicy chicken + rice)';
myFoods[10].title        = '川香鸡肉饭';
myFoods[10].price        = 14.00;
myFoods[10].images.push({url : '/images/5.jpg', width : 328, height : 440});
myFoods[10].shopName   = '欧乐';
myFoods[10].shopAdmin  = ningjing._id;

myFoods[11]              = new Food;
myFoods[11].description  = '川香鸡肉饭 + 香滑蒸蛋 + 豆浆 (Spicy chicken + rice + steamed egg + Soya-bean milk)';
myFoods[11].title        = '川香鸡肉餐';
myFoods[11].price        = 21.00;
myFoods[11].images.push({url : '/images/5.jpg', width : 3210, height : 440});
myFoods[11].shopName   = '欧乐';
myFoods[11].shopAdmin  = ningjing._id;

myFoods[12]              = new Food;
myFoods[12].description  = '咖喱腿排饭 (Curry leg row + rice)';
myFoods[12].title        = '咖喱腿排饭';
myFoods[12].price        = 15.00;
myFoods[12].images.push({url : '/images/6.jpg', width : 328, height : 440});
myFoods[12].shopName   = '欧乐';
myFoods[12].shopAdmin  = ningjing._id;

myFoods[13]              = new Food;
myFoods[13].description  = '咖喱腿排饭 + 香滑蒸蛋 + 豆浆 (Curry leg row + rice + steamed egg + Soya-bean milk)';
myFoods[13].title        = '咖喱腿排餐';
myFoods[13].price        = 22.00;
myFoods[13].images.push({url : '/images/6.jpg', width : 3212, height : 440});
myFoods[13].shopName   = '欧乐';
myFoods[13].shopAdmin  = ningjing._id;

myFoods[14]              = new Food;
myFoods[14].description  = '欧乐肥牛饭 (Fat beef + rice)';
myFoods[14].title        = '欧乐肥牛饭';
myFoods[14].price        = 15.00;
myFoods[14].images.push({url : '/images/7.jpg', width : 328, height : 440});
myFoods[14].shopName   = '欧乐';
myFoods[14].shopAdmin  = ningjing._id;

myFoods[15]              = new Food;
myFoods[15].description  = '欧乐肥牛饭 + 香滑蒸蛋 + 豆浆 (Fat beef + rice + steamed egg + Soya-bean milk)';
myFoods[15].title        = '欧乐肥牛餐';
myFoods[15].price        = 22.00;
myFoods[15].images.push({url : '/images/7.jpg', width : 3214, height : 440});
myFoods[15].shopName   = '欧乐';
myFoods[15].shopAdmin  = ningjing._id;

myFoods[16]              = new Food;
myFoods[16].description  = '香辣牛肉饭 (Spicy beef + rice)';
myFoods[16].title        = '香辣牛肉饭';
myFoods[16].price        = 15.00;
myFoods[16].images.push({url : '/images/8.jpg', width : 328, height : 440});
myFoods[16].shopName   = '欧乐';
myFoods[16].shopAdmin  = ningjing._id;

myFoods[17]              = new Food;
myFoods[17].description  = '香辣牛肉饭 + 香滑蒸蛋 + 豆浆 (Spicy beef + rice + steamed egg + Soya-bean milk)';
myFoods[17].title        = '香辣牛肉餐';
myFoods[17].price        = 22.00;
myFoods[17].images.push({url : '/images/8.jpg', width : 3214, height : 440});
myFoods[17].shopName   = '欧乐';
myFoods[17].shopAdmin  = ningjing._id;

myFoods[18]              = new Food;
myFoods[18].description  = '红烩牛腩饭 (Braised beef + rice)';
myFoods[18].title        = '红烩牛腩饭';
myFoods[18].price        = 16.00;
myFoods[18].images.push({url : '/images/9.jpg', width : 328, height : 440});
myFoods[18].shopName   = '欧乐';
myFoods[18].shopAdmin  = ningjing._id;

myFoods[19]              = new Food;
myFoods[19].description  = '红烩牛腩饭 + 香滑蒸蛋 + 豆浆 (Braised beef + rice + steamed egg + Soya-bean milk)';
myFoods[19].title        = '红烩牛腩餐';
myFoods[19].price        = 23.00;
myFoods[19].images.push({url : '/images/9.jpg', width : 3214, height : 440});
myFoods[19].shopName   = '欧乐';
myFoods[19].shopAdmin  = ningjing._id;

myFoods[20]              = new Food;
myFoods[20].description  = '番茄牛肉浓汤 (Tomato beef soup)';
myFoods[20].title        = '番茄牛肉浓汤';
myFoods[20].price        = 10.50;
myFoods[20].images.push({url : '/images/1.jpg', width : 328, height : 440});
myFoods[20].shopName   = '欧乐';
myFoods[20].shopAdmin  = ningjing._id;

myFoods[21]              = new Food;
myFoods[21].description  = '番茄牛肉浓汤 + 米饭 (Tomato beef soup + rice)';
myFoods[21].title        = '番茄牛肉浓汤饭';
myFoods[21].price        = 13.50;
myFoods[21].images.push({url : '/images/1.jpg', width : 440, height : 500});
myFoods[21].shopName   = '欧乐';
myFoods[21].shopAdmin  = ningjing._id;

myFoods[22]              = new Food;
myFoods[22].description  = '番茄牛肉浓汤 + 配餐小菜 + 米饭 (Tomato beef soup + rice + vegetable)';
myFoods[22].title        = '番茄牛肉浓汤餐';
myFoods[22].price        = 17.00;
myFoods[22].images.push({url : '/images/1.jpg', width : 328, height : 440});
myFoods[22].shopName   = '欧乐';
myFoods[22].shopAdmin  = ningjing._id;

myFoods[23]              = new Food;
myFoods[23].description  = '番茄牛肉浓汤 + 配餐小菜 + 米饭 (Tomato beef soup + rice + vegetable)';
myFoods[23].title        = '番茄牛肉浓汤餐';
myFoods[23].price        = 17.00;
myFoods[23].images.push({url : '/images/1.jpg', width : 328, height : 440});
myFoods[23].shopName   = '欧乐';
myFoods[23].shopAdmin  = ningjing._id;


for(var i = 0; i < 24; i++) {
  myFoods[i].save(function(err) {
    if(err){
      console.log('save failed: ' + myFoods[i].title);
    } 
  });
}
