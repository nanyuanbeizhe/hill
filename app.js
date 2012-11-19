
/**
 * Module dependencies.
 */

var express = require('express')
  , controllers = require('./controllers');

var app = express();

// Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pantry');
//mongoose.set('debug', true);

// auth
var session_secret = "lalala";
var auth_cookie_name = "auth_token";

// Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: session_secret  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// static
// app.get('/', controllers.index);

/*
*  Routes
*/ 
// RestFul 
app.get('/orders', controllers.loadOrders);
app.get('/orders/:id', controllers.loadOrder);
app.post('/orders', controllers.createOrder);
app.put('/orders/:id', controllers.updateOrder);
app.del('/orders/:id', controllers.deleteOrder);

app.post('/food', controllers.createFood);
app.get('/food', controllers.loadFoodList);
app.get('/food/:id', controllers.loadFood);
app.put('/food/:id', controllers.updateFood);
app.del('/food/:id', controllers.deleteFood);

app.get('/users', controllers.loadUsers);
app.post('/users', controllers.createUser);
app.get('/users/:id', controllers.loadUser);
app.put('/users/:id', controllers.updateUser);
app.del('/users/:id', controllers.deleteUser);
app.get('/active_account', controllers.activeAccount);
app.get('/find_password/:email', controllers.resetPassword);

app.del('/sessions/:id', controllers.deleteSession);
app.post('/sessions', controllers.createSession);


/**
 * English Classes
 */
app.get('/englishclass', controllers.english_class);
app.post('/api/classes', controllers.createClass);
app.get('/api/classes', controllers.getClasses);
app.get('/api/classes/:id', controllers.getClass)
app.put('/api/classes/:id', controllers.updateClass);
app.del('/api/classes/:id', controllers.deleteClass);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

//temp code
//TODO: create a schedular module
var Order = require('./models/order.js')
  , mailUtil = require('./utils/mails.js');

var tt = setInterval(function() {
  var point = new Date();
  if(point.getHours() == 11 && point.getMinutes() == 10){
    var start = new Date();
    var end = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    end.setHours(23);
    end.setSeconds(59);
    end.setMinutes(59);

    Order.find({'date': {'$gte': start, '$lte': end}}, function(err,orders){
      for(var i in orders){
        orders[i].status = "finished";
      }
      mailUtil.sendDailyOrders(orders);
    });
  }
} , 60000);