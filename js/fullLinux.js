
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

		popupContainer = document.querySelector("system_popup_container");
		appsLayer = document.querySelector("apps_layer")
		desktop = document.querySelector("background_wallpaper");
		processBar = document.querySelector("process_bar");


		//Add system.build variable
		(async () => {
			system.build = await (async () => { return (await fetch("./build.ver")).text() })()
		})()

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
				<context_item onclick="processes.create('linuxWeb', {x:${x},y:${y}});">linuxWeb</context_item>
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

	currentlySelectedProcess: null,

	pid: {},

	getNewPid: function () {

		if (Object.entries(this.pid).length == 0)
			return 0;
		else return Number(Object.keys(this.pid).sort().slice(-1)) + 1
	},


	getNumberPid: function (pid) {
		return Number(pid.split('pid')[1])

	},

	bringToTop: function (element) {

		const pid = this.getNumberPid(element.id);
		if (this.currentlySelectedProcess == this.pid[pid]) return false;

		// if (element == appsLayer.children[appsLayer.children.length - 1]) return false;
		appsLayer.insertAdjacentElement('beforeend', element)
		this.makeProcessResizable("#" + element.id);
		this.currentlySelectedProcess != null && this.currentlySelectedProcess.getProcessBarElement().classList.remove('selected')
		this.pid[pid].getProcessBarElement().classList.add('selected');
		this.currentlySelectedProcess = this.pid[pid];
		this.pid[pid]['onfocus'] != undefined && this.pid[pid].onFocus();

	},

	processSchema: {
		title: "Untitled App",
		titleColor: "initial",
		bodyColor: "initial",
		textColor: "initial",
		headerColor: "initial",
		bodyBorderSize: "initial",
		HTML: String(),
		minWidth: Number(),
		minHeight: Number(),
		bodyBorder: Boolean(),
		fullHeight: Boolean(),
		fullWidth: Boolean(),

	},

	remove: function (stringyPID) {
		pid = this.getNumberPid(stringyPID);
		// this.pid.splice(this.runningIds.indexOf(pid), 1);
		document.querySelector(`#${stringyPID}`).remove();
		this.pid[pid].getProcessBarElement().remove();
		this.pid[pid] = null;
		this.currentlySelectedProcess = null;




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
			if (!appCreateData[entry[0]] == undefined || typeof (appCreateData[entry[0]]) != typeof (entry[1])) {
				appCreateData[entry[0]] = entry[1];
			}
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
			height:${(appCreateData.fullHeight && "100%") || "auto"};
			width:${(appCreateData.fullWidth && "100%") || "auto"};
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
				<app_resize>
					<resize_point class='bottom-right'></resize_point>
					<resize_point class='bottom-left'></resize_point>
					<resize_point class='top-right'></resize_point>
					<resize_point class='top-left'></resize_point>

					<resize_point class='top'></resize_point>
					<resize_point class='left'></resize_point>
					<resize_point class='right'></resize_point>
					<resize_point class='bottom'></resize_point>
					</app_resize>

				</app_container>
			
		`;

		processBar.innerHTML += `<process onclick="processes.bringToTop(document.querySelector('#${stringyPID}'))" id='processBarPID${processID}'>${appCreateData.title}</process>`
		processes.pid[processID] = {}

		//Assign Functions
		Object.assign(processes.pid[processID], appCreateData.methods)

		Object.assign(processes.pid[processID], {
			id: processID,
			elementId: stringyPID,
			originalOffsetY: 0,
			originalOffsetX: 0,
			getProcessElement: function () { return document.querySelector(`#${this.elementId}`) },
			getProcessElementBody: function () { return document.querySelector(`#${this.elementId}>app_body`) },
			getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
			getProcessBarElement: function () { return document.querySelector(`#processBarPID${this.id}`) },
		});
		this.makeProcessResizable("#" + processes.pid[processID].elementId);
		this.bringToTop(processes.pid[processID].getProcessElement())
		apps[appName].onStart(processes.pid[processID])
		appCreateData = {};

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

	processMouseMoveHandler: function (event, process) {
		// console.log(event, pid);
		var y = event.clientY - process.originalOffsetY;
		var x = event.clientX - process.originalOffsetX;
		process.getProcessElement().style.top = y + "px";
		process.getProcessElement().style.left = x + "px";
	},

	makeProcessResizable: function (cssSelector) {
		//Thanks to Hung Nguyen for this code. (I modified simplified it a little) Original: https://codepen.io/ZeroX-DG/pen/vjdoYe
		const element = document.querySelector(cssSelector);
		const resizePoints = document.querySelectorAll(cssSelector + ' resize_point')
		const minimum_size = 150;
		let original_width = 0;
		let original_height = 0;
		let original_x = 0;
		let original_y = 0;
		let original_mouse_x = 0;
		let original_mouse_y = 0;
		resizePoints.forEach(x => {
			x.addEventListener('mousedown', function (e) {
				e.preventDefault()
				original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
				original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
				original_x = element.getBoundingClientRect().left;
				original_y = element.getBoundingClientRect().top;
				original_mouse_x = e.pageX;
				original_mouse_y = e.pageY;
				window.addEventListener('mousemove', resize)
				window.addEventListener('mouseup', stopResize)
			})
			function resize(e) {
				const resizeClassList = x.classList.toString()
				if (resizeClassList.includes('top')) {
					const height = original_height - (e.pageY - original_mouse_y)
					if (height > minimum_size) {
						element.style.height = height + 'px'
						element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
					}
				} else if (resizeClassList.includes('bottom')) {
					const height = original_height + (e.pageY - original_mouse_y)
					if (height > minimum_size) {
						element.style.height = height + 'px'
					}
				}
				if (resizeClassList.includes('left')) {
					const width = original_width - (e.pageX - original_mouse_x)
					if (width > minimum_size) {
						element.style.width = width + 'px'
						element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
					}
				} else if (resizeClassList.includes('right')) {
					const width = original_width + (e.pageX - original_mouse_x)
					if (width > minimum_size) {
						element.style.width = width + 'px'
					}
				}

			}

			function stopResize() {
				window.removeEventListener('mousemove', resize)
			}
		})

	}

}

apps = {

	terminal: {

		path: "apps.terminal",
		version: "1.0.3",

		createData: {
			title: "JS Terminal",
			titleColor: "white",
			bodyColor: "black",
			textColor: "#c5c5c5",
			bodyBorder: false,
			bodyBorderSize: '0px',
			HTML: `
				<terminal_main >Linux terminal version 1.0.3</terminal_main>
				<terminal_input >LinuxWeb@root:-$<input id type=text></terminal_input>
`,
			methods: {
				commandHistory: [],
				currentHistoryNumber: -1,
				currentCommand: "",
				onFocus: function () {
					console.log('element focused: ', this)
					let terminalBody = this.getProcessElementBody()
					this.getProcessElementBody().querySelector('terminal_input > input').focus()
					console.log(this.getProcessElementBody().querySelector('terminal_input > input'));
				},
				addToCommandHistory: function (commandToPush) {
					console.log(this);
					this.commandHistory.length > 30 && this.commandHistory.pop();
					this.commandHistory.unshift(commandToPush);

				},



			}
		},

		InitiateVariables: function (processInstance = null) {
			if (processInstance == null) return false;
			return {
				body: processInstance.getProcessElementBody(),
				main: processInstance.getProcessElementBody().querySelector('terminal_main'),
				inputPrefix: processInstance.getProcessElementBody().querySelector('terminal_input'),
				input: terminalInput = processInstance.getProcessElementBody().querySelector('terminal_input > input')
			}
		},

		onStart: function (processInstance) {
			console.log("onStart Initialized: ", processInstance);
			terminalElement = this.InitiateVariables(processInstance);
			terminalElement.input.setAttribute('onkeydown', this.path + `.parseCommand(event,this,processes.pid[${processInstance.id}])`)
		},

		parseCommand: async function (event, element, processInstance) {
			console.log(event.code);
			if (event.code == 'Enter') {
				terminalElement = this.InitiateVariables(processInstance);
				text = element.value
				element.value = "";
				terminalElement.main.innerHTML += " <br>" + terminalElement.inputPrefix.innerText + text + "<br>";
				try {
					commandExecuted = eval(text);
					terminalElement.main.innerHTML += commandExecuted.toString().replace(/\n/g, "<br>");

				} catch (e) {
					terminalElement.main.innerHTML += e;

				}
				processInstance.addToCommandHistory(text);
				element.scrollIntoView(false)
			} else if (event.code == "ArrowUp") {
				processInstance.currentHistoryNumber == -1 && (processInstance.currentCommand = element.value);
				this.getFromCommandHistory(processInstance, +1)
			} else if (event.code == "ArrowDown") {
				this.getFromCommandHistory(processInstance, -1)
			}
		},
		getFromCommandHistory: function (processInstance, val) {//go up||down a number in history
			let command = processInstance.commandHistory[processInstance.currentHistoryNumber + val];
			if (processInstance.currentHistoryNumber + val < -1) return false
			if (command != undefined) {
				terminalElement = apps.terminal.InitiateVariables(processInstance);
				terminalElement.input.value = command
				processInstance.currentHistoryNumber = processInstance.currentHistoryNumber + val
			} else if (processInstance.currentHistoryNumber > processInstance.currentHistoryNumber + val) {
				terminalElement = apps.terminal.InitiateVariables(processInstance);
				terminalElement.input.value = processInstance.currentCommand;
				processInstance.currentHistoryNumber = -1;

			}
		},
	},



	linuxWeb: {
		createData: {
			title: "linuxWeb",
			fullHeight: true,
			fullWidth: true,
			minWidth: 1000,
			minHeight: 500,
			HTML: `<iframe style='height:100%;' src="http://127.0.0.1:5500/"></iframe>`,

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

