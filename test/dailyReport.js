var Order = require('../models/order.js')
  , mongoose = require('mongoose')
  , mailUtil = require('../utils/mails.js');

mongoose.connect('mongodb://localhost/pantry');
    
var start = new Date('2012-10-09');
var end = new Date('2012-10-09');
start.setHours(0);
start.setMinutes(0);
start.setSeconds(0);
end.setHours(23);
end.setSeconds(59);
end.setMinutes(59);

Order.find({'date': {'$gte': start, '$lte': end}}, function(err,orders){
  mailUtil.sendDailyOrders(orders);
});