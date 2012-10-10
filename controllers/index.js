var foodView = require('./foodview.js')
	, orderView = require('./orderview.js')
	, sessionView = require('./sessionview.js')
	, userView = require('./userview.js');

/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log("url request: /");
  res.render('index', {
	    title     : 'Order'
	});
};

// food
exports.loadFoodList = foodView.loadFoodList;
exports.loadFood = foodView.loadFood;
exports.createFood = foodView.createFood;
exports.updateFood = foodView.updateFood;
exports.deleteFood = foodView.deleteFood;

// order
exports.loadOrders = orderView.loadOrders;
exports.loadOrder = orderView.loadOrder;
exports.createOrder = orderView.createOrder;
exports.updateOrder = orderView.updateOrder;
exports.deleteOrder = orderView.deleteOrder;

// user
exports.loadUser = userView.loadUser;
exports.loadUsers = userView.loadUsers;
exports.createUser = userView.createUser;
exports.updateUser = userView.updateUser;
exports.deleteUser = userView.deleteUser;
exports.activeAccount = userView.activeAccount;
exports.resetPassword = userView.resetPassword;

// session
exports.createSession = sessionView.createSession;
exports.deleteSession = sessionView.deleteSession;
exports.getSession = sessionView.getSession;