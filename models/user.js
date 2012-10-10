var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var RoleSchema = new Schema({
	name	: {	type: String	 } 
});

var UserSchema = new Schema({
	email: { type: String, unique: true }
  ,	name: { type: String, index: true }
  ,	password: { type: String }
  ,	avatar: { type: String } 
  ,	roles : [RoleSchema]
  ,	credits: { type: Number, default: 0 }
  ,	emailNotify: { type: Boolean, default: true }

  ,	active: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', UserSchema);