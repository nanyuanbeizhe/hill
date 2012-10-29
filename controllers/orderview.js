var Order = require('../models/order.js')
  , User = require('../models/user.js')
  , mongoose = require('mongoose')
  , userManager = require('../manager/userManager.js')
  , dateUtil = require('../utils/dateUtil.js');
/*
 * GET home page.
 */

exports.loadOrders = function(req, res) {
  console.log(new Date().toLocaleString() + "> request order list" );
  if(!req.session.user) return res.send(400, {message: 'you are not authenticated to load order list!'});

  var query = {};
  var start = new Date(req.query.start);
  var end = new Date(req.query.end);
  end.setDate(end.getDate() + 1);
  if(start && end) query.date = {$gte: start, $lte: end};

  var admin = req.query.admin;
  if(!admin) query.userId = req.session.user._id;
  console.log(query);

  Order.find(query, function(err, orders) {
    if(err) return res.send(500, {message: 'DB in error while finding orders!'});
    res.send(orders);
    console.log('total orders: ' + orders.length);
  });
};


exports.loadOrder = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + "> request order detail: " +  id);
  if(!req.session.user) return res.send(400, {message: 'You need login first'}); 
  
  Order.findById(id, function(err, order) {
    if(!order) return res.send(404, {message: 'Can not find this order with id: ' + id});
    if(!(req.session.user._id == order.userId) && !(userManager.checkUserRole(req.session.user, 'shopAdmin') && req.session.user._id == order.shopAdmin))
      return res.send(400, {message: 'you are not authenticated to load order!'});

    res.send(order);
  });
};


exports.createOrder = function(req, res) {
  if(!req.session.user) return res.send(400, {message: 'You need login first'});
  console.log(new Date().toLocaleString() + '> comming new order by user: ' + req.session.user.name);

  var d = new Date();
  var h = new Number(d.getHours());
  if(h > 10) return res.send(400, {message: 'You need to order before 11:00'});

  var order = new Order(req.body);
  order.date = new Date();
  order.userId = req.session.user._id;
  order.userName = req.session.user.name;
  order.status = "init";   //init, preparing, sending, finished

  order.save(function (err, order){
    if(err) return res.send(500, {message: 'Error in db while save new order.'});
    res.send(order);
  });
};
  
exports.updateOrder = function(req, res) {
  var id = req.params.id;
  console.log(new Date().toLocaleString() + '> update order which id is: ' + id);
  if(!req.session.user) return res.send(400, {message: 'You need login first'});
  
  Order.findOne({'_id':id}, function(err, order) {
    if(!order) return res.send(404, {message: 'can not find the order by id: ' + id});
    if(!(req.session.user._id == order.userId) && !(userManager.checkUserRole(req.session.user, 'shopAdmin') && req.session.user._id == order.shopAdmin))
      return res.send(400, {message: 'you are not authenticated to update order: ' + id});

    order.lineItems = req.body.lineItems;
    order.totalCost = req.body.totalCost;
    order.description += '<br/> user ' + req.session.user.name + ' modified at ' + new Date().toLocaleString();
    
    order.save(function (err, order) {
      if(err) return res.send(500, {message: 'Error in db while update order: ' + id});
      res.send(order);
    });
  });
};

exports.deleteOrder = function(req, res) {
  if(!req.session.user) return res.send(400, {message: 'You need login first'});
  var id = req.params.id;
  console.log(new Date().toLocaleString() + '> delete order: ' + id);
  
  Order.findOne({'_id':id}, function(err, order) {
    if(!order) return res.send(404, {message: 'can not find the order by id: ' + id});
    if(!(req.session.user._id == order.userId) && !(userManager.checkUserRole(req.session.user, 'shopAdmin') && req.session.user._id == order.shopAdmin))
      return res.send(400, {message: 'you are not authenticated to delete order: ' + id});
    if(order.status != 'init')
      return res.send(400, {message: 'Your order has already been accepted, you can not delete it anymore.'});

    order.remove(function (err, order) {
      if(err) return res.send(500, {message: 'Error in db while update order: ' + id});
      res.send({success: true});
    });
  });
};