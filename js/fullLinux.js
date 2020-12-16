
popupContainer = document.querySelector("system_popup_container");
appsLayer = document.querySelector("apps_layer")
desktop = document.querySelector("background_wallpaper");

system = {
	started: false,
	global: {
		volume: 50,
		brightness: 100,

		isValid: x => {
			return (x && x.toString().trim() !== "") || x == false;
		},
		elementExists: (el) => {
			if (typeof el != "undefined" && el != null) return true;
			else return false;
		}
	},
	startup: function () {//  Important: Should only be run once
		if (this.started) return false;
		this.started = true;

		document.body.addEventListener("click", () => {
			if (system.global.elementExists(document.querySelector("status_area_container"))) {
				statusArea.volumeSliderDisplayToggle(true);
				popupContainer.innerHTML = "";
			}
		});

		statusArea.updateStatusAreaTime();
		setTimeout(() => {
			setInterval(() => {
				statusArea.updateStatusAreaTime();
			}, 60 * 1000);
		}, (60 - new Date().getSeconds()) * 1000); //makes sure the update is synchronized
		statusArea.statusAreaButton.addEventListener("click", (event) => {
			event.stopPropagation();
			statusArea.volumeSliderDisplayToggle();
		});

		desktop.addEventListener("contextmenu", (event) => {
			event.preventDefault();
			var x = event.clientX;
			var y = event.clientY;
			if (system.global.elementExists(popupContainer.querySelector("context_menu")))
				popupContainer.querySelector("context_menu").remove();
			popupContainer.innerHTML += `
		<context_menu style="top: ${y}px;left: ${x}px;">
				<context_item onclick="processes.create('terminal', {x:${x},y:${y}});">Terminal</context_item>
				<context_item onclick="processes.create('google', {x:${x},y:${y}});">Google</context_item>
				<context_item>Other</context_item>
			</context_menu>
				`;
			document.body.addEventListener("click", () => {
				if (system.global.elementExists(popupContainer.querySelector("context_menu"))) {
					popupContainer.querySelector("context_menu").remove();
				}
			});
			return false;
		},
			false
		);
	}
}
statusArea = {

	statusAreaButton: document.querySelector("statusArea"),

	updateStatusAreaTime: function () {
		var dateAndTime = new Date().toUTCString().split(new Date().getFullYear())[0] + date.getTime("hm");
		document.querySelector("dateTime").innerHTML = dateAndTime;
		console.log("Time update. Next one in: ", 60 - new Date().getSeconds());
	},

	addListenerForBrightnessChange: function () {
		brightnessSlider = document.querySelector("#brightness_slider");
		brightnessSlider.addEventListener("input", (event) => {
			system.global.brightness = brightnessSlider.value;
			document.querySelector("html").style.filter = `brightness(${system.global.brightness / 100})`;
		});
	},

	volumeSliderDisplayToggle: function (forceRemove = false) {
		if (system.global.elementExists(document.querySelector("status_area_container"))) {
			statusAreaContainer = document.querySelector("status_area_container");
			statusAreaContainer.style = "opacity:0;";
			statusArea.statusAreaButton.style.borderBottom = "";

			setTimeout(() => {
				statusAreaContainer.remove();
			}, 300);
		} else if (!forceRemove) {
			popupContainer.innerHTML += `
        <status_area_container>
            <input id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
            <input id='brightness_slider' min="25" max="100" value="${system.global.brightness}" step="1" type="range">
        </status_area_container>`;
			statusAreaContainer = document.querySelector("status_area_container");
			statusAreaContainer.style = "opacity:1;";
			statusAreaContainer.addEventListener("click", (event) => {
				event.stopPropagation();
			});
			statusArea.statusAreaButton.style.borderBottom = "solid gray 2px";
			statusArea.addListenerForVolumeChange();
			statusArea.addListenerForBrightnessChange();
		}
	},

	addListenerForVolumeChange: function () {
		let volumeIndicator = document.querySelector("volume");
		let volumeSlider = document.querySelector("#volume_slider");
		volumeSlider.addEventListener("input", (event) => {
			system.global.volume = volumeSlider.value;
			// document.querySelector("volume_text").innerHTML = volumeSlider.value;
			if (volumeSlider.value > 66) {
				volumeIndicator.style.backgroundImage = "url('./img/volume/high.svg')";
			} else if (volumeSlider.value > 33) {
				volumeIndicator.style.backgroundImage = "url('./img/volume/medium.svg')";
			} else if (volumeSlider.value > 0) {
				volumeIndicator.style.backgroundImage = "url('./img/volume/low.svg')";
			} else {
				volumeIndicator.style.backgroundImage = "url('./img/volume/mute.svg')";
			}
		});
	}
}
processes = {

	pid: {},

	getNewPid: function () {

		if (Object.entries(this.pid).length == 0)
			return 0;
		else return Number(Object.keys(this.pid).sort().slice(-1)) + 1
	},
	bringToTop: function (element) {
		if (element == appsLayer.children[appsLayer.children.length - 1]) return false;
		appsLayer.insertAdjacentElement('beforeend', element)
	},

	processSchema: {
		title: String(),
		titleColor: String(),
		bodyColor: String(),
		textColor: String(),
		headerColor: String(),
		minWidth: Number(),
		minHeight: Number(),
		bodyBorderSize: String(),
		HTML: String(),
		bodyBorder: Boolean(),
		fullHeight: Boolean(),
		fullWidth: Boolean(),

	},

	create: function (appName, position = { x: 100, y: 100 }) {
		let processID = processes.getNewPid();
		let stringyPID = "pid" + processID
		if (apps[appName] == undefined) {
			console.error(`Not Found: App '${appName}' does not exist`)
			return false
		}
		let appCreateData = apps[appName].createData;
		Object.entries(this.processSchema).forEach(entry => {
			(!appCreateData[entry[0]] == undefined || typeof (appCreateData[entry[0]]) != typeof (entry[1])) && (appCreateData[entry[0]] = entry[1]);

			// !system.global.isValid(entry[1]) && (appCreateData[entry[0]] = "");
		})


		let containerStyles = `
			min-height:${appCreateData.minHeight};
			min-width:${appCreateData.minWidth};
		`

		let bodyStyles = `
			background-color:${appCreateData.bodyColor};
			color:${appCreateData.textColor};
			margin:${(appCreateData.bodyBorder && appCreateData.bodyBorderSize) || '0px'};
			height:${(appCreateData.fullHeight && "100%") || ""},
			width:${(appCreateData.fullWidth && "100%") || ""},
		`

		appsLayer.innerHTML += `
			<app_container onmousedown="processes.bringToTop(this)" id = '${stringyPID}' style = "top: ${position.y}px;left: ${position.x}px;${containerStyles}" >
				<app_header style="color:${appCreateData.titleColor};background-color:${appCreateData.headerColor};" onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')" >
					${appCreateData.title}
					<app_exit onmousedown="document.body.removeAttribute('onmousemove')" onclick="processes.remove('${stringyPID}')" />
				</app_header>
				<app_body style="${bodyStyles}">
					${appCreateData.HTML}
				</app_body>
			</app_container>
		`;

		appCreateData = {};

		processes.pid[processID] = {
			id: processID,
			elementId: stringyPID,
			originalOffsetY: 0,
			originalOffsetX: 0,
			getProcessElement: function () { return document.querySelector(`#${this.elementId}`) },
			getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
		};
		return true;
	},
	processMouseDownHandler: function (event, stringyPID) {
		if (event.target.tagName != "APP_HEADER") return false
		pid = this.getNumberPid(stringyPID);
		let process = this.pid[pid];
		console.log(event, process);
		process.originalOffsetY = event.offsetY;
		process.originalOffsetX = event.offsetX;
		document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event,processes.pid['${pid}'])`)
		process.getProcessElementHeader().onmouseup = () => {
			document.body.onmousemove = null;
			process.getProcessElementHeader().onmouseup = null;
		}
	},

	// 	< dc85 > Cleaned up the code into Objects.
	// < dd01 > Redesigned the terminal Slightly(Although its still not
	// functional)
	// ➕ Added porcesses, apps, statusArea and system Objects which should
	// simplify Adding features in the long run
	// 	< dd01 > Completly changed the window handeling sytem
	// To crate a process now it's as simple as calling
	// processes.create(% NameOfProcessInTheAppsObject %)

	processMouseMoveHandler: function (event, process) {
		// console.log(event, pid);
		var y = event.clientY - process.originalOffsetY;
		var x = event.clientX - process.originalOffsetX;
		process.getProcessElement().style.top = y + "px";
		process.getProcessElement().style.left = x + "px";
	},

	remove: function (stringyPID) {
		pid = this.getNumberPid(stringyPID);
		this.pid[pid] = null;
		// this.pid.splice(this.runningIds.indexOf(pid), 1);
		document.querySelector(`#${stringyPID}`).remove();

	},
	getNumberPid: function (pid) {
		return Number(pid.split('pid')[1])

	}
}
apps = {

	terminal: {

		version: "1.0.3",
		runningTerminals: {},
		runningIds: [],

		createData: {
			title: "Terminal",
			titleColor: "white",
			headerColor: "gray",
			bodyColor: "black",
			textColor: "#c5c5c5",
			bodyBorder: false,
			bodyBorderSize: '0px',
			HTML: `
				<terminal_main>
				Linux terminal version 1.0.3
				</terminal_main>
		<terminal_input >
			LinuxWeb@root:-$
					<input id type=text>
				</terminal_input>
`,
		},

	},

	apple: {
		createData: {
			title: "ASS",
			HTML: "<p>We have overpriced garbage</p>",
		}
	},

	google: {

		createData: {
			title: "Google Search",
			fullHeight: true,
			fullWidth: true,
			minWidth: 1000,
			minHeight: 500,
			HTML: `<iframe style='height:100%;' src="https://www.google.com/webhp?igu=1"></iframe>`
		}

	}
}
system.startup();

