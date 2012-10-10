var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Bill = new Schema({
  date 	        : Date
  , orderIds    : [Schema.ObjectId]
  , userId      : Schema.ObjectId
  , description : String
  , amount      : Number
  , discount    : {type: Number, default: 1.00}
  , payment     : String
  , incoming    : Boolean
});

module.exports = mongoose.model('Bill', Bill);
