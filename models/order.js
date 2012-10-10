var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , dateUtil = require('../utils/dateUtil.js');

var LineItem = new Schema({
    URI         : String
  , name        : String
  , count       : Number
  , unitCost    : Number
  , discount    : Number
  , imageUrl    : String
});

var Order = new Schema({
    userId       : Schema.ObjectId
  , userName    : String
  , date         : Date
  , description : String
  , lineItems   : [LineItem]
  , totalCost   : Number
  , shopName    : String
  , shopAdmin   : Schema.ObjectId
  , status      : String
});

Order.virtual('friendly_date').get(function() {
  return dateUtil.format_date(this.date, true);
});

module.exports = mongoose.model('Order', Order);
