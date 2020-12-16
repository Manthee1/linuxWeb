htmlEl = document.querySelector("html");

page = {
	changePage: async (pageUrl) => {
		fetch(pageUrl).then(pageRequest => {
			if (pageRequest.ok) {
				(async () => {
					pageHTML = await pageRequest.text();
					htmlEl.innerHTML = await pageHTML;
					getJS.LoadAllJsFromHead();
				})();
			} else {
				console.error(`The specified page does not exists! (${pageUrl})`);
				return false;
			}
		});
	},
};
date = {
	getDate: () => {
		return new Date(new Date().getDate()).toLocaleDateString();
	},
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
	getDateAndTime: () => {
		return new Date(new Date().toLocaleTimeString());
	},
};

getJS = {
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


function delay(timeDelay) {
	timeDelay = timeDelay || 2000;
	return new Promise(done => {
		setTimeout(() => {
			done();
		}, timeDelay);
	});
}