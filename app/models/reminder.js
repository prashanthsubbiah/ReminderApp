var mongoose = require('mongoose');

module.exports = mongoose.model('reminders', {
	content : String,
	complete : Boolean,
	scheduledtime: Date
});