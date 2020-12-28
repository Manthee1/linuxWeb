htmlEl = document.querySelector("html");

page = {
	//I mean... Simple i think. Chang the page. Yeah.... Thats all. You can keep scrolling now.
	changePage: async (pageUrl) => {
		fetch(pageUrl).then(pageRequest => {
			if (pageRequest.ok) {
				(async () => {
					pageHTML = await pageRequest.text();
					htmlEl.innerHTML = await pageHTML;
					document.body.style = "background:black;opacity: 0;";
					document.body.addEventListener('load', () => document.body.style = "background:black;opacity: 1;")
					getJS.LoadAllJsFromHead()
				})();
			} else {
				console.error(`The specified page does not exists! (${pageUrl})`);
				return false;
			}
		});
	},
};
date = {
	//Simple. Return the Date. Easy...
	getDate: () => {
		return new Date(new Date().getDate()).toLocaleDateString();
	},
	//Returns the time. with your custom 'divider'. So ':' in '2020:6:9'
	getTime: (x, divider = ":") => {
		var [h, m, s] = new Date(new Date().getTime()).toLocaleTimeString().split(":");
		returnTimes = x.split("");
		out = "";
		for (let i = 0; i < returnTimes.length; i++) {
			i > 0 && (out += divider);
			out += eval(returnTimes[i]);
		}
		return out;
	},
	//Self explanatory...
	getDateAndTime: () => {
		return new Date(new Date().toLocaleTimeString());
	},
};

getJS = {
	// Why am i commenting on function that are very easy to understand. IDK. 
	// Probably to waste your time reading this :)
	LoadAllJsFromHead: () => {
		document.head.querySelectorAll("script").forEach(async (x) => {
			// eval(await (await fetch(x.src)).text());
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = x.src;
			document.head.appendChild(script);
		});
	},
};

//No one actually knows what this one does. Very mysterious this one.
//Well hopefully it doesn't matter
//Oh btw. It's initiated with 'await' - remember that

function delay(timeDelay) {

	timeDelay = timeDelay || 2000;
	return new Promise(done => {
		setTimeout(() => {
			done();
		}, timeDelay);
	});
}