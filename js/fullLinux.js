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

function createTerminal(y = 100, x = 100) {
	popupContainer.innerHTML += `
		<terminal_container style="	top: ${y}px;left: ${x}px;">
			<terminal_header>
				<termianl_exit/>
			</terminal_header>
			<terminal_main contenteditable='true'>
			LinuxJs@root:-$
			</terminal_main>
		</terminal_container>
`;

	var terminalElementGrabbed = false;

	var originalOffsetY = 0;
	var originalOffsetX = 0;

	terminal = document.querySelector("terminal_container");
	terminalHeader = document.querySelector("terminal_header");
	terminalHeader.addEventListener("mousedown", (event) => {
		event.preventDefault();
		originalOffsetY = event.offsetY;
		originalOffsetX = event.offsetX;
		document.body.onmousemove = terminalMouseMove;

		terminalHeader.onmouseup = () => {
			document.body.onmousemove = null;
			terminalHeader.onmouseup = null;
		};
	});
	function terminalMouseMove(event) {
		var y = event.clientY - originalOffsetY;
		var x = event.clientX - originalOffsetX;
		terminal.style.top = y + "px";
		terminal.style.left = x + "px";
	}
}

desktop = document.querySelector("background_wallpaper");

desktop.addEventListener(
	"contextmenu",
	(event) => {
		event.preventDefault();
		console.log(event);
		var x = event.clientX;
		var y = event.clientY;

		if (elementExists(popupContainer.querySelector("context_menu"))) {
			popupContainer.querySelector("context_menu").remove();
		}

		popupContainer.innerHTML += `
		<context_menu style="top: ${y}px;left: ${x}px;">
		<context_item onclick="createTerminal(${y},${x});">Terminal</context_item>
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
