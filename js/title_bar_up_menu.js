nedate = 0;

function updateTime() {
	d = new Date();
	hour = d.getHours();
	min = d.getMinutes();
	day = getDayOfTheWeek(d.getDay());
	month = getCurrentMonthName(d.getMonth());
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (min < 10) {
		min = "0" + min;
	}
	document.getElementById("actualDay").innerHTML = day;
	document.getElementById("actualDate").innerHTML = month + " " + d.getDate() + " " + eval(1900 + d.getYear());
	document.getElementById("currentTime").innerHTML = hour + ":" + min + " " + day;
}
function getCurrentMonthName(b) {
	``;

	if (b == 0) {
		currmonth = "January";
	}
	if (b == 1) {
		currmonth = "February";
	}
	if (b == 2) {
		currmonth = "March";
	}
	if (b == 3) {
		currmonth = "April";
	}
	if (b == 4) {
		currmonth = "May";
	}
	if (b == 5) {
		currmonth = "June";
	}
	if (b == 6) {
		currmonth = "July";
	}
	if (b == 7) {
		currmonth = "August";
	}
	if (b == 8) {
		currmonth = "September";
	}
	if (b == 9) {
		currmonth = "October";
	}
	if (b == 10) {
		currmonth = "November";
	}
	if (b == 11) {
		currmonth = "December";
	}

	return currmonth;
}

function getDayOfTheWeek(a) {
	if ((a = 0)) {
		dayweek = "Saturday";
	}
	if ((a = 1)) {
		dayweek = "Monday";
	}
	if ((a = 2)) {
		dayweek = "Tuesday";
	}
	if ((a = 3)) {
		dayweek = "Wendnesday";
	}
	if ((a = 4)) {
		dayweek = "Thursday";
	}
	if ((a = 5)) {
		dayweek = "Friday";
	}
	if ((a = 6)) {
		dayweek = "Sunday";
	}
	return dayweek;
}

function titleMenuCalendar() {
	cdate = new Date();
	cdate.setDate(1);
	cDayOfWeek = getDayOfTheWeek(cdate.getDay());
	for (q = 0; q < cdate.getDay(); q++) {
		document.getElementById("date" + (q + 1)).innerHTML = "";
	}
	for (i = 1; i < 43; i++) {
		if (i > 32) {
			if (q + i - 1 < 42) {
				nedate++;
			}
			document.getElementById("date" + (q + i - 1)).innerHTML = nedate;
			document.getElementById("date" + (q + i - 1)).style.color = "grey";
		}
		if (i + q < 43) {
			document.getElementById("date" + (q + i)).innerHTML = i;
		}
	}
}

function timeMenuShow() {
	if (document.getElementById("detailedTimeMenu").style.display == "none") {
		document.getElementById("detailedTimeMenu").style.display = "block";
	} else if (document.getElementById("detailedTimeMenu").style.display == "block") {
		document.getElementById("detailedTimeMenu").style.display = "none";
	}
	document.getElementById("date" + (d.getDate() + q)).style.backgroundColor = "#2196f380";
}
