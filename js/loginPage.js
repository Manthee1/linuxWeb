if (document.querySelector("login_time_display") != undefined) {
	var login_time_display = document.querySelector("login_time_display");
	login_time_display.innerHTML = date.getTime("hm");

	//Update the time every 60 seconds
	setInterval(() => {
		login_time_display.innerHTML = date.getTime("hm");
	}, 60000 - Number(date.getTime("s") * 1000));
}

var form = document.querySelector("form");
form.style = "position:relative;bottom:0px;opacity:1;";
form.addEventListener("submit", (event) => {
	event.preventDefault();
	var form_data = new FormData(form);
	var password = form_data.get("password");
	try {
		if (sha256(btoa(password)) == "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f") {
			palyLoginAnimation(true);
		} else {
			throw "shit";
		}
	} catch (error) {
		palyLoginAnimation(false);
	}
});

document.querySelector("input[type=password]").focus();

function palyLoginAnimation(x = false) {
	if (x) {
		//Correct password
		form.style = "position:relative;bottom:50px;opacity:0;";
		setTimeout(() => {
			page.changePage("./X/Xorg.html");
		}, 500);
	} else {
		//Wrong password
		form.style = "position:relative;bottom:120px;opacity:1;";
		document.querySelector("input[type=password]").style = "border-color:indianred";
		document.querySelector("input[type=password]").innerHTML = "";

		setTimeout(() => {
			form.style = "position:relative;bottom:0px;opacity:1;";
		}, 120);

		setTimeout(() => {
			document.querySelector("input[type=password]").style = "";
		}, 300);
	}
}
