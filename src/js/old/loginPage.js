if (document.querySelector("login_time_display") != undefined) {
	var login_time_display = document.querySelector("login_time_display");
	login_time_display.innerHTML = date.getTime("hm");

	//Update the time every 60 seconds
	setInterval(() => {
		login_time_display.innerHTML = date.getTime("hm");
	}, 60000 - Number(date.getTime("s") * 1000));
}