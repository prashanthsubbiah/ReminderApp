var mongoose = require('mongoose');

module.exports = mongoose.model('settings', {
	email: String,
	emmins: Number,
	pushone: Number,
	pushtwo: Number,
	modifiedDate: Date
});