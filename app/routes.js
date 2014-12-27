var reminder = require('./models/reminder');
var settings = require('./models/notification');
var nodemailer = require('nodemailer');
var socket = require('../server.js');
var async = require('async');

// Notification Source Email config
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'r3minderapp@gmail.com', //Source email address
        pass: 'regex@$#' //Source Password
    }
});

module.exports = function(app, server) {
	// API
	// get all reminders
	app.get('/api/reminders', function(req, res) {
		reminder.find({}, null, {sort: {scheduledtime: 1}}, function(err, reminders) {
			if (err)
				res.send(err)

			res.json(reminders); 
		});
	});

	// get all notifications
	app.get('/api/settings', function(req, res) {
		settings.find(function(err, setting) {
			if (err)
				res.send(err)

			res.json(setting); // return all notifications in JSON format
		});
	});

	// create reminder and send back all reminders after creation
	app.post('/api/reminders', function(req, res) {
		//Get notification settings from db collection
		var getSettingsFromDB = function(callback) {
			settings.find(function(err, setting) {
			if (err){
				return callback(err);
			}
			return callback(null, setting); // return all notifications in JSON format
			});
		};

		//Schedule reminder alerts based on the DB Values
		var errText="Notification settings not found in DB.",
		scheduleReminderAlerts = function(configValues, callback){
			if(configValues.length > 0){
				var dtArr=req.body.date.split("/"), tmArr=req.body.time.split(":"), 
				schDate, currDate = new Date(), dbSettings=configValues[0],
				to_email=dbSettings.email,
				beforeInMin = dbSettings.emmins,
				beforeP1Min = dbSettings.pushone,
				beforeP2Min = dbSettings.pushtwo;

				if(dtArr.length === 3 && tmArr.length === 3) {
					schDate = new Date(dtArr[2],dtArr[1]-1,dtArr[0],tmArr[0],tmArr[1],tmArr[2]);
				}
				delete req.body.date;
				delete req.body.time;
				req.body.datetime = schDate;

				//Timer set for Email trigger
				var secs = Math.abs((schDate-currDate)/1000),
		       	runMins = secs/60, 
		       	schedEmailMins = runMins - beforeInMin,
		       	schedSecs = schedEmailMins*60;

		       	if(schedSecs > 0) {
				setTimeout(function(){
						//Setting options and content for the email trigger
						var mailOptions = {
						    from: 'ReminderApp <r3minderapp@gmail.com>', // sender address
						    to: to_email, // list of receivers
						    subject: 'Reminder App - Task Reminder - due in '+beforeInMin+' mins', // Subject line
						    //text: 'Hello world', // plaintext body
						    html: 'Hi, <br /> <br /> Your reminder <b>'+req.body.content+'</b> which has been scheduled by you for '+req.body.datetime+' is pending to be completed.' // html body
						};

						transporter.sendMail(mailOptions, function(error, info){
						    if(error){
						        console.log(error);
						    }else{
						        io.emit('mail', 'e-mail sent to '+to_email);
						    }
						});
		              }, schedSecs*1000);
				}
		       	
		       	//Timer set for Push Bullet 1 - 5mins
				var P1secs = Math.abs((schDate-currDate)/1000),
		       	runP1Mins = P1secs/60, 
		       	schedP1Mins = runP1Mins - beforeP1Min,
		       	schedP1Secs = schedP1Mins*60;
		       	//Push Bullet 1
		       	if(schedP1Secs>0){
		       	setTimeout(function(){
		       		var dt = new Date,
				    InTime = [dt.getDate(),
				    		   dt.getMonth()+1,
				               dt.getFullYear()].join('/')+' '+
				              [dt.getHours(),
				               dt.getMinutes(),
				               dt.getSeconds()].join(':');
				       	var pushBullet1={
				       		'content': req.body.content,
				       		'time': 'In '+beforeP1Min+' mins',
				       		'InTime': InTime,
				       		'color': '#E68A2E'
				       	};
		       			io.emit('notification', pushBullet1);
		              }, schedP1Secs*1000);
		       }
				//Timer set for Push Bullet 2 - 5mins
				var P2secs = Math.abs((schDate-currDate)/1000),
		       	runP2Mins = P2secs/60, 
		       	schedP2Mins = runP2Mins - beforeP2Min,
		       	schedP2Secs = schedP2Mins*60;
		       	//Push Bullet 2
		       	if(schedP2Secs>0){
		       	setTimeout(function(){
		       		var dt = new Date,
				    InTime = [dt.getDate(),
				    		   dt.getMonth()+1,
				               dt.getFullYear()].join('/')+' '+
				              [dt.getHours(),
				               dt.getMinutes(),
				               dt.getSeconds()].join(':');
		       			var pushBullet2={
				       		'content': req.body.content,
				       		'time': 'now',
						    'InTime': InTime,
						    'color': '#5cb85c'
				       	};
		       			io.emit('notification', pushBullet2);
		              }, schedP2Secs*1000);       	
		       }
		       callback(null, "success");
			} else {
				return callback(errText);
			}
		};

		//Post scheduling, insert reminder in DB
		var errText = "Trouble in scheduling alert",
		pushReminderToDB = function(scheduleStatus, callback){
			if(scheduleStatus === "success") {
				reminder.create({
				content : req.body.content,
				complete : false,
				scheduledtime : req.body.datetime
				}, function(err, reminderDt) {
					if (err) {
						return callback('create Reminder DB Error: '+err);
						// res.send(err);
						}
					// get and return all the reminders after you create another
					reminder.find({}, null, {sort: {scheduledtime: 1}}, function(err, reminders) {
						if (err){
							return callback('fetch Reminder DB Error: '+err);
						}
						return callback(null, reminders);
					});
			});
			} else {
				return callback(errText);
			}
		};

		//Once reminder DB insert is successful, get the updated reminders list and push to Angular
		var endFunction = function(err, updatedReminders){
			if(err) {
				callback(err);
			}
			return res.send(updatedReminders);
		};

		async.waterfall([getSettingsFromDB, scheduleReminderAlerts, pushReminderToDB],endFunction);
	});

	// delete a reminder
	app.delete('/api/reminders/:reminder_id', function(req, res) {
		reminder.remove({
			_id : req.params.reminder_id
		}, function(err, reminderDt) {
			if (err)
				res.send(err);

			// get and return all the reminders after you create another
			reminder.find({}, null, {sort: {scheduledtime: 1}}, function(err, reminders) {
				if (err)
					res.send(err)
				res.json(reminders);
			});
		});
	});

	//Update DB settings in MongoDB settings collection
	app.put('/api/settings/:config_id', function(req, res) {
		settings.update({
				_id: req.params.config_id
			},
			{
				email: req.body.email,
				emmins: parseInt(req.body.emmins),
				pushone: parseInt(req.body.pushone),
				pushtwo: parseInt(req.body.pushtwo),
				modifiedDate: new Date() 
			}, function(err, configDt){
			if(err)
				res.send(err);

			settings.find(function(req, configRes){
				if(err)
					res.send(err)
				res.json(configRes);
			});
		});
	});

	// Application Front End
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};