var Food = require('../models/food.js')
  , mongoose = require('mongoose')
  , userManager = require('../manager/userManager.js');


exports.loadFoodList = function(req, res){
  var keyword = req.query.q || ''; // in-site search
  console.log(new Date().toLocaleString() + "> request food list with query: " + keyword);

  if (Array.isArray(keyword)) {
    keyword = keyword.join(' ');
  }
  keyword = keyword.trim();

  var query = {};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyword, 'i');
  }

  Food.find(query, function(err, foodList) {
    if(err) console.log(err);
    res.send(foodList);
  });
};

exports.loadFood = function(req, res){
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> request food detail with id: " + id);

  Food.findById(id, function(err, food) {
    if(!food) return res.send(404, {message: 'food is not existed with id: ' + id});
    res.send(food);
  });
};

exports.createFood = function(req, res){
  var food = new Food(req.body);
  console.log(new Date().toLocaleString() + '> create new food: ' + food.title);

  if(userManager.checkUserRole(req.session.user, 'shopAdmin')) {
    food.shopAdmin = req.session.user._id;
    food.save( function (err, food) {
      if (err) return res.send(500, {message: 'food save error ocurred in db.'});
      res.send(food);  
    });
  } else {
    res.send(400, {message: 'you are not authenticated to create the food!'});
  }
};

exports.deleteFood = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + '> delete food which id is: ' + id);

  Food.findById(id, function(err, food) {
    if(err) return res.send(500, {message: 'food delete error ocurred in db.'});
    if(!food) return res.send(404, {message: 'food is not existed with id: ' + id});
    if(!userManager.checkUserRole(req.session.user, 'shopAdmin') || food.shopAdmin != req.session.user._id)
      return res.send(400, {message: 'you are not authenticated to delete this food: ' + id});

    food.remove(function (err, food){
      if(err) return res.send(500, {message: 'food delete error ocurred in db.'});
      res.send('success');
    });
  });
};

exports.updateFood = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> update food which id is: " + id);

  Food.findById(id, function(err, food){
    if(err) return res.send(500, {message: 'food update error ocurred in db.'});
    if(!food) return res.send(404, {message: 'food is not existed with id: ' + id});
    if(!userManager.checkUserRole(req.session.user, 'shopAdmin') || food.shopAdmin != req.session.user._id)
      return res.send(400, {message: 'you are not authenticated to update this food: ' + id});

    if(req.body.title) food.title = req.body.title;
    if(req.body.description) food.description = req.body.description;
    if(req.body.images) food.images = req.body.images;
    if(req.body.price) food.price = req.body.price;
    if(req.body.discount) food.discount = req.body.discount;

    food.save(function (err, food){
      if(err) return res.send(500, {message: 'food update error ocurred in db.'});
      res.send(food);
    });
  });
}
