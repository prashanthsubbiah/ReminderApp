// sockets.js
var socketio = require('socket.io');
var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports.listen = function(app, data){
    io = socketio.listen(app);

    io.on('connection', function(socket){
    	//Sample emit to check if socket.io is working fine
    	//Same can be tested in client end logs
        socket.emit("message", "Hello User! Socket says hello to you!");
        if(data) {
    	io.emit("notification",data);
    	}
    });

    return io;
};