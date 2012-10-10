var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var image = new Schema({
	  url 	 : String
	, width	 : Number
	, height : Number
});

var Food = new Schema({
    title       : String
  , description : String
  , images 		: [image]
  , price       : Number
  , discount    : { type: Number, default: 1.00 }
  , shopName 	: String
  , shopAdmin	: Number
});

module.exports = mongoose.model('Food', Food);
