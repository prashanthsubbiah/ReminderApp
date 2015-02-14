// Node js server setup
var express  = require('express');
var app      = express(); 								
var server   = require('http').createServer(app);
var events = require('events');
var eventEmitter = new events.EventEmitter();
var mongoose = require('mongoose'); 					
var port  	 = process.env.PORT || 8080; 				// Port Number
var database = require('./config/database'); 			// database config
var morgan = require('morgan'); 						// To log requests to console
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// MongoDB configuration
mongoose.connect(database.url); 	

app.use(express.static(__dirname + '/public')); 	
app.use(morgan('dev'));									//Log all the requests			
app.use(bodyParser.urlencoded({'extended':'true'})); 			
app.use(bodyParser.json()); 									
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(methodOverride());

// Configure routes
require('./app/routes.js')(app, server);

// Socket io (For push bullets)
var io = require('./app/sockets.js').listen(server);

// Starting app at the defined port
server.listen(port);
console.log("App listening on port " + port);

module.exports = function() {
	return io;
}
