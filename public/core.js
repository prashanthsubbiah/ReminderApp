var reminderapp = angular.module('reminderapp', []);

function remController($scope, $http) {
	$scope.formData = {};

	// Page load, get all reminders to display
	$http.get('/api/reminders')
		.success(function(data) {
			$scope.reminders = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when landing on the page, get all configs to display them in modal dialog
	$http.get('/api/settings')
		.success(function(data) {
			$scope.settings = data[0];
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when create reminder is clicked, send the reminder values to reminder POST API
	$scope.createreminder = function() {
		var content = $scope.formData.content;
		var date = $scope.formData.date;
		var time = $scope.formData.time;
		var alTime = 3000, dateArr = [], allChk, timeChk, createFlag = false;
		if(content){
			if(date){
			dateArr = date.split("/");
				if(dateArr.length === 3) {
					if(parseInt(dateArr[0])<=31 && parseInt(dateArr[1])<=12 && parseInt(dateArr[2])>=2014){
						timeChk = true;
					} else {
						$("#validations").attr("class", "alert alert-danger");
						$("#validations").text("Invalid/Past date value");
						$("#validations").show();
						$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
						window.setTimeout(function() { $("#validations").hide(); }, alTime);
					}
				} else {
					$("#validations").attr("class", "alert alert-danger");
					$("#validations").text("Invalid date value");
					$("#validations").show();
					$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
					window.setTimeout(function() { $("#validations").hide(); }, alTime);
				}
			} else {
				$("#validations").attr("class", "alert alert-danger");
				$("#validations").text("Empty date value");
				$("#validations").show();
				$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
				window.setTimeout(function() { $("#validations").hide(); }, alTime);
			}

		} else {
			$("#validations").attr("class", "alert alert-danger");
			$("#validations").text("Reminder content is empty. Please enter some value.");
			$("#validations").show();
			$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
			window.setTimeout(function() { $("#validations").hide(); }, alTime);
		}

		if(timeChk){
			if(time){
			var timeArr = time.split(":");
				if(timeArr.length === 3) {
					var currDate = new Date();
					var schDate = new Date(dateArr[2],dateArr[1]-1,dateArr[0],timeArr[0],timeArr[1],timeArr[2]);
					if(parseInt(timeArr[0])<=23 && parseInt(timeArr[1])<=59 && parseInt(timeArr[2])<=59){
						if(currDate <= schDate)
						{
							createFlag=true;
						}
						else{
							alert('Please enter future date/time value');
							$("#validations").attr("class", "alert alert-danger");
							$("#validations").text("Please enter future date/time value");
							$("#validations").show();
							$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
							window.setTimeout(function() { $("#validations").hide(); }, alTime);
						}
					} else {
						$("#validations").attr("class", "alert alert-danger");
						$("#validations").text("Invalid/Past time value");
						$("#validations").show();
						$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
						window.setTimeout(function() { $("#validations").hide(); }, alTime);
					}
				} else {
					$("#validations").attr("class", "alert alert-danger");
					$("#validations").text("Invalid time value");
					$("#validations").show();
					$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
					window.setTimeout(function() { $("#validations").hide(); }, alTime);
				}
			} else {
				$("#validations").attr("class", "alert alert-danger");
				$("#validations").text("Empty time value");
				$("#validations").show();
				$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
				window.setTimeout(function() { $("#validations").hide(); }, alTime);
			}
		}

		if(createFlag){
		$http.post('/api/reminders', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clearing form for our user to enter next reminder
				$scope.reminders = data;
				$("#validations").attr("class", "alert alert-success");
				$("#validations").text("Reminder added successfully!");
				$("#validations").show();
				$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
				window.setTimeout(function() { $("#validations").hide(); }, alTime);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		} else {
			console.log('Validation Error!');
		}
	};

	// delete a reminder after checking it
	$scope.deletereminder = function(id) {
		$http.delete('/api/reminders/' + id)
			.success(function(data) {
				$scope.reminders = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// when submitting the config form, send the config data to the node API
	$scope.updateSettings = function(id) {
		var email = $scope.settings.email, emmins = parseInt($scope.settings.emmins), pushone = parseInt($scope.settings.pushone), 
		pushtwo = parseInt($scope.settings.pushtwo), emailValid=false;

		if(email) {
				emailValid=true;
		}
		else {
			alert("Please enter email value");
		}

		if(emailValid){
			if(emmins >=0 && pushone >=0 && pushtwo >=0) {
				console.log(emmins+' '+pushone+' '+pushtwo);
				$http.put('/api/settings/' + id, $scope.settings)
					.success(function(data) {
						$scope.settings = data[0];
						$('#myModal').modal('hide');
						$("#validations").attr("class", "alert alert-success");
						$("#validations").text("Notification settings saved successfully!");
						$("#validations").show();
						$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
						window.setTimeout(function() { $("#validations").hide(); }, 3000);
					})
					.error(function(data) {
						console.log('Error: ' + data);
					});
				}
			}
			else {
				$("#validations").attr("class", "alert alert-danger");
				$("#validations").text("Please greater than zero values for minutes");
				$("#validations").show();
				$("html, body").animate({ scrollTop: $("#validations").offset().top }, 500);
				window.setTimeout(function() { $("#validations").hide(); }, 3000);
			}
		};
}
