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
	//Basically converts the 'options' into a date/time
	get: (options, divider = " ") => {
		options = options.split(' ')
		let returnString = options.map(x => {
			switch (x) {
				case 'date': return new Date().getDate()
					break;
				case 'month': return new Date().getMonth() + 1
					break;
				case 'year': return new Date().getFullYear()
					break;
				case 'month>str': return new Date().toDateString().slice(4, 7)
					break;
				case 'day>str': return new Date().toDateString().slice(0, 3)
					break;
				case 'day': return new Date().getDay()
					break;
				case 'time': return date.getTime('hms', ':')
					break;
				case 'time-h': return date.getTime('ms', ':')
					break;
				case 'time-m': return date.getTime('hs', ':')
					break;
				case 'time-s': return date.getTime('hm', ':')
					break;
				case 'h': return new Date().getHours()
					break;
				case 'm': return new Date().getMinutes()
					break;
				case 's': return new Date().getSeconds()
					break;
				default:
					' '
					break;
			}
		}).join(divider)

		return returnString


	},
	//Simple. Return the Date. Easy...
	getDate: () => {
		return new Date(new Date().getDate()).toLocaleDateString();
	},
	//Returns the time. with your custom 'divider'. So ':' in '2020:6:9'
	getTime: (x, divider = ":", clock12h = true) => {
		let h, m, s, strEnd;
		if (clock12h) [h, m, s, strEnd] = new Date().toLocaleTimeString().replaceAll(':', ' ').split(' ')
		else[h, m, s] = new Date().toTimeString().split(" ")[0].split(':');
		let returnTime = x.split("").map(x => { return eval(x); }).join(divider)
		if (clock12h) returnTime += " " + strEnd
		return returnTime;
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
			document.querySelectorAll("script").forEach(async (x) => {
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