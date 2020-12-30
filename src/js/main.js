htmlEl = document.querySelector("html");

page = {
	//I mean... Simple i think. Chang the page. Yeah.... Thats all. You can keep scrolling now.
	changePage: async (pageUrl, x = null) => {
		fetch(pageUrl).then(pageRequest => {
			if (pageRequest.ok) {
				(async () => {
					htmlEl.style = "background:black;";
					pageHTML = await pageRequest.text();
					htmlEl.style = "background:black; visibility: hidden";
					htmlEl.innerHTML = await pageHTML;
					// document.body.innerHTML += "<hideEverythingUntilCssLoads style='margin:0px;padding:0px;width:100vw;height:100vh;z-index:1000000;background: black;'></hideEverythingUntilCssLoads>"
					await getJS.LoadAllJsFromHead() != 'dead';
					pageChangeTransmittedValue = x;
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
		return new Promise(done => {
			document.head.querySelectorAll("script").forEach(async (x) => {
				// eval(await (await fetch(x.src)).text());
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.src = x.src;
				document.head.appendChild(script);
				done()
			});
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