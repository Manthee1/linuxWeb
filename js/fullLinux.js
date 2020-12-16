global = {
	volume: 50,
	brightness: 100,
};

popupContainer = document.querySelector("system_popup_container");

document.body.addEventListener("click", (event) => {
	if (elementExists(document.querySelector("status_area_container"))) {
		volumeSliderDisplayToggle(true);
		popupContainer.innerHTML = "";
	}
});

statusAreaButton = document.querySelector("statusArea");
statusAreaButton.addEventListener("click", (event) => {
	event.stopPropagation();
	volumeSliderDisplayToggle();
});

function volumeSliderDisplayToggle(forceRemove = false) {
	console.log(forceRemove);
	if (elementExists(document.querySelector("status_area_container"))) {
		statusAreaContainer = document.querySelector("status_area_container");
		statusAreaContainer.style = "opacity:0;";
		statusAreaButton.style.borderBottom = "";

		setTimeout(() => {
			statusAreaContainer.remove();
		}, 300);
	} else if (!forceRemove) {
		popupContainer.innerHTML += `
        <status_area_container>
            <input id='volume_slider' min="0" max="100" value="${global.volume}" step="1" type="range">
            <input id='brightness_slider' min="25" max="100" value="${global.brightness}" step="1" type="range">

        </status_area_container>`;
		statusAreaContainer = document.querySelector("status_area_container");
		statusAreaContainer.style = "opacity:1;";
		statusAreaContainer.addEventListener("click", (event) => {
			event.stopPropagation();
		});
		statusAreaButton.style.borderBottom = "solid gray 2px";
		addListenerForVolumeChange();
		addListenerForBrightnessChange();
	}
}

function addListenerForVolumeChange() {
	volumeIndicator = document.querySelector("volume");
	volumeSlider = document.querySelector("#volume_slider");
	volumeSlider.addEventListener("input", (event) => {
		global.volume = volumeSlider.value;
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

function addListenerForBrightnessChange() {
	brightnessSlider = document.querySelector("#brightness_slider");
	brightnessSlider.addEventListener("input", (event) => {
		global.brightness = brightnessSlider.value;
		document.querySelector("html").style.filter = `brightness(${global.brightness / 100})`;
	});
}

function elementExists(el) {
	if (typeof el != "undefined" && el != null) return true;
	else return false;
}
updateStatusAreaTime();
setTimeout(() => {
	setInterval(() => {
		updateStatusAreaTime();
	}, 60 * 1000);
}, (60 - new Date().getSeconds()) * 1000); //makes sure the update is synchronized

function updateStatusAreaTime() {
	var dateAndTime = new Date().toUTCString().split(new Date().getFullYear())[0] + date.getTime("hm");
	document.querySelector("dateTime").innerHTML = dateAndTime;
	console.log("Time update. Next one in: ", 60 - new Date().getSeconds());
}
// function addListenerForstatusAreaClick() {
// 	statusArea.addEventListener("click", (event) => {
// 		volumeSliderDisplayToggle();
// 	});
// }

terminal = {

	version: "1.0.2",
	runningTerminals: {},
	runningIds: [],
	remove: function (id) {
		this[id] = {};
		this.runningIds.splice(this.runningIds.indexOf(id), 1);
		document.querySelector(`#${id}`).remove();

	},
	createTerminal: (y = 100, x = 100) => {

		terminalId = terminal.runningIds.length == 0 ? "t0" : "t" + Number((terminal.runningIds.slice(-1)[0]).slice(1)) + 1
		terminal.runningIds.push(terminalId);
		popupContainer.innerHTML += `
		<terminal_container id='${terminalId}' style="	top: ${y}px;left: ${x}px;">
			<terminal_header >
				<terminal_title>
					Terminal
				</terminal_title>
				<termianl_exit onclick="terminal.remove('${terminalId}')" />
			</terminal_header>
			<terminal_body>
				<terminal_main>
				Linux terminal version ${terminal.version}
				</terminal_main>
				<terminal_input >
					LinuxWeb@root:-$
					<input id type=text>
				</terminal_input>
			</terminal_body>
		</terminal_container>
`;
		terminal.runningTerminals[terminalId] = {
			id: terminalId,
			originalOffsetY: 0,
			originalOffsetX: 0,
			terminal: document.querySelector(`#${terminalId}`),
			terminalHeader: document.querySelector(`#${terminalId} terminal_header`),

			terminalMouseMove: function terminalMouseMove(event) {
				console.log(event, this);
				let tId = event.target.parentElement.id == '' ? event.target.parentElement.parentElement.id : event.target.parentElement.id;
				let t = terminal.runningTerminals[tId];
				var y = event.clientY - t.originalOffsetY;
				var x = event.clientX - t.originalOffsetX;
				t.terminal.style.top = y + "px";
				t.terminal.style.left = x + "px";
			}
			//TODO: terminal escapes the cursor if you move it too quick. and the event.target switches form the terminal to body.  
		};


		terminal.runningTerminals[terminalId].terminalHeader.addEventListener("mousedown", (event) => {
			event.preventDefault();
			let tId = event.target.parentElement.id == '' ? event.target.parentElement.parentElement.id : event.target.parentElement.id;
			let t = terminal.runningTerminals[tId];
			t.originalOffsetY = event.offsetY;
			t.originalOffsetX = event.offsetX;
			document.body.onmousemove = t.terminalMouseMove;
			t.terminalHeader.onmouseup = () => {
				document.body.onmousemove = null;
				t.terminalHeader.onmouseup = null;
			};
		});
	}
}



desktop = document.querySelector("background_wallpaper");

desktop.addEventListener(
	"contextmenu",
	(event) => {
		event.preventDefault();
		var x = event.clientX;
		var y = event.clientY;

		if (elementExists(popupContainer.querySelector("context_menu"))) {
			popupContainer.querySelector("context_menu").remove();
		}

		popupContainer.innerHTML += `
		<context_menu style="top: ${y}px;left: ${x}px;">
		<context_item onclick="terminal.createTerminal(${y},${x});">Terminal</context_item>
		<context_item>Other</context_item>
		
		
		</context_menu>
`;

		document.body.addEventListener("click", () => {
			if (elementExists(popupContainer.querySelector("context_menu"))) {
				popupContainer.querySelector("context_menu").remove();
			}
		});

		return false;
	},
	false
);
