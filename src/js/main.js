htmlEl = document.querySelector("html");

page = {
	//I mean... Simple i think. Chang the page. Yeah.... Thats all. You can keep scrolling now.
	changePage: async (pageUrl, doOnComplete = false, executeOnComplete = true) => {
		fetch(pageUrl).then(pageRequest => {
			if (pageRequest.ok) {
				(async () => {
					htmlEl.style = "background:black;";
					let pageHTML = await pageRequest.text();
					htmlEl.style = "background:black; visibility: hidden";
					executeOnComplete && (htmlEl.style = "background:black; visibility: hidden !important;");
					htmlEl.innerHTML = await pageHTML;
					if (!executeOnComplete || !doOnComplete) { eval(doOnComplete) };
					await (await page.loadAllJsFromHtml());
					if (doOnComplete && executeOnComplete) {
						eval(doOnComplete);
						setTimeout(() => {
							htmlEl.style = "";
						}, 100);
					} else htmlEl.style = "";


				})();
			} else {
				console.error(`The specified page does not exists! (${pageUrl})`);
				return false;
			}
		});
	},

	// Why am i commenting on function that are very easy to understand. IDK. 
	// Probably to waste your time reading this :)
	loadJs: (jsSrc) => {
		return new Promise(resolve => {
			(async () => {
				try {
					let jsCode = await (await fetch(jsSrc)).text()
					eval(await jsCode + `console.info(jsSrc + " Loaded")`);

				} catch (e) {
					console.error(e, jsSrc);
					eval(jsCode)
				}
				resolve()
			})()
		});
	},

	loadAllJsFromHtml: () => {
		let scripts = document.querySelectorAll("script");
		return new Promise(resolve => {
			(async () => {
				for (const key in scripts) {
					let x = scripts[key]
					if (x.src) {
						await page.loadJs(x.src)
					}
				}
				resolve();
			})()
		});
	}
}

//No one actually knows what this one does. Very mysterious this one.
//Well hopefully it doesn't matter
//Oh btw. It's initiated with 'await' - remember that
function delay(timeDelay) {

	timeDelay = timeDelay || 2000;
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, timeDelay);
	});
}



date = {
	months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",],
	weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",],
	//Basically converts the 'options' into a date/time
	get: (options, divider = " ") => {
		options = options.split(' ')
		let returnString = options.map(x => {
			switch (x) {
				case 'date': return new Date().getDate()
					break;
				case 'year': return new Date().getFullYear()
					break;
				case 'month': return new Date().getMonth() + 1
					break;
				case 'month>full': return date.months[new Date().getMonth()]
					break;
				case 'month>str': return new Date().toDateString().slice(4, 7)
					break;
				case 'day': return new Date().getDay()
					break;
				case 'day>full': return date.weekdays(new Date().getDay())
					break;
				case 'day>str': return new Date().toDateString().slice(0, 3)
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
		let h, m, s, strEnd = "";
		let d = new Date();
		[h, m, s] = [d.getHours(), d.getMinutes(), d.getSeconds()];
		if (clock12h) {
			if (h > 12) {
				h -= 12;
				strEnd = "PM";
			} else strEnd = "AM";
		}

		m.toString().length < 2 && (m = '0' + m)
		s.toString().length < 2 && (s = '0' + s)

		let returnTime = x.split("").map(x => { return eval(x); }).join(divider) + " " + strEnd
		return returnTime;
	},
	//Self explanatory...
	getDateAndTime: () => {
		return new Date(new Date().toLocaleTimeString());
	},
};

//Addon Functions

let range = (a, b = null) => {
	let n = b == null ? a : b;
	let ret = [...Array(n).keys()]

	if (b) ret = ret.splice(a)
	return ret
}
let isValid = x => {
	return (x && x.toString().trim() !== "") || x == false;
}
let isDefined = el => {
	if (typeof el == "undefined" || el == null) return false;
	else return true;
}
let escapeHtml = text => {
	var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
	return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
let isObjectEmpty = obj => {
	if (isDefined(obj))
		return Object.entries(obj).length == 0
}
let isTextEmpty = x => {
	return (x.toString().trim().length == 0);
}
let elementIsInEventPath = (event, element) => {
	clickPath = event.path || event.composedPath() //event.path is for chrome and event.composedPath() is mozilla firefox
	return clickPath.includes(element)
}
let tagIsInEventPath = (event, tag) => {
	tag = tag.toUpperCase()
	clickPath = event.path || event.composedPath()
	for (element of clickPath) {
		if (element.tagName == tag) return true
	}
	return false
}
let addDoubleClickListener = (el, callback) => {
	clickedAmount = 0;
	doubleClickTimeout = 0;
	el.addEventListener('click', event => {
		if (++clickedAmount == 2) {
			clearTimeout(doubleClickTimeout);
			callback(event)
		}
		clearTimeout(doubleClickTimeout);
		doubleClickTimeout = setTimeout(() => {
			clickedAmount = 0;
		}, 300);
	})

}