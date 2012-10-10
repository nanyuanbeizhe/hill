var Order = require('../models/order.js')
  , Food = require('../models/food.js')
  , cryptUtil = require('../utils/crypt.js')
  , User = require('../models/user.js')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pantry');


  Order.find({'shopName': '欣雨'}, function(err, orders) {
    if(err) return console.log('DB in error while finding orders!');
    
    console.log('total orders by : 欣雨' + orders.length);
    orders.forEach(function(order){
      order.totalCost = 0;
      order.lineItems.forEach(function(line){
        line.discount = 0.95;
        order.totalCost += line.unitCost * line.discount * line.count;
      });
      order.save();
    });

  });

  Order.find({'shopName': '欧乐'}, function(err, orders) {
    if(err) return console.log('DB in error while finding orders!');
    
    console.log('total orders by : 欧乐' + orders.length);
    orders.forEach(function(order){
      order.totalCost = 0;
      order.lineItems.forEach(function(line){
        line.discount = 0.90;
        order.totalCost += line.unitCost * line.discount * line.count;
      });
      order.save();
    });
  });

  Food.find({'shopName': '欣雨'}, function(err, foods) {
      if(err) return console.log('DB error while update foods');

      console.log('total foods by : 欣雨' + foods.length);
      foods.forEach(function(food){
        food.discount = 0.95;
        food.save();
      });
  });

  Food.find({'shopName': '欧乐'}, function(err, foods) {
      if(err) return console.log('DB error while update foods');

      console.log('total foods by : 欧乐' + foods.length);
      foods.forEach(function(food){
        food.discount = 0.90;
        food.save();
      });
  });
