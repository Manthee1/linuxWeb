X = {
    desktopContextMenu: {
        enable: function () {
            desktop.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                var x = event.clientX;
                var y = event.clientY;
                if (system.global.elementExists(popupContainer.querySelector("context_menu")))
                    popupContainer.querySelector("context_menu").remove();
                popupContainer.innerHTML += `
		<context_menu style="top: ${y}px;left: ${x}px;">
				<context_item >New Folder</context_item>
				<context_item class='context_sub_menu' >
					New Document
					<context_sub_menu>
						<context_item>Empty Document</context_item>
					</context_sub_menu>
				</context_item><br>
				<context_item onclick="processes.create('terminal', {x:${x},y:${y}});">Terminal</context_item><br>
				<context_item>Sort By Name</context_item><br>
				<context_item>Change Background</context_item>
			</context_menu>
				`;
                document.body.addEventListener("click", () => {
                    if (system.global.elementExists(popupContainer.querySelector("context_menu"))) {
                        popupContainer.querySelector("context_menu").remove();
                    }
                });

                document.querySelectorAll('.context_sub_menu').forEach(x => {

                    x.addEventListener('mouseover', () => {
                        console.log('mouseover', x);
                        x.querySelector('context_sub_menu').style.display = 'block'

                    })

                    x.addEventListener('mouseleave', () => {

                        x.querySelector('context_sub_menu').style.display = ''


                    })

                })
                return false;
            },
                false
            );

        }
    },

    appMenu: {

        toggleButtonElement: document.querySelector('app_menu_button'),
        getHTML: function () {
            let html = `
				<app_menu_container>
					<app_search><input type='search'></app_search>
					<app_list>
					${Object.entries(apps).map(x => {
                let appName;
                if (x[1].name == undefined) appName = x[0]; else appName = x[1].name;
                return `<app_list_name onclick="system.clearOpenPopups();processes.create('${x[0]}');">${appName}</app_list_name>`
            }).join('')}
			</app_list>
				</app_menu_container>
		`
            return html;
        },
    },

    statusArea: {

        toggleButtonElement: document.querySelector("statusArea"),

        getHTML: function () {

            return `<status_area_container>
					<slider_container>
					<volume_icon></volume_icon>
					<input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
					</slider_container>
					<slider_container>
					<brightness_icon></brightness_icon>
					<input  oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="100" value="${system.global.brightness}" step="1" type="range">
					</slider_container>
					<item><settings_icon></settings_icon><text>Settings (*Not Functional)</text></item>
					<item onclick='X.lockScreen.lock()'><padlock_icon></padlock_icon><text>Lock</text></item>
					<item><power_off_icon></power_off_icon><text>Power Off/Log Out (*-||-)</text></item>

        </status_area_container>`;
        },

        updateStatusAreaTime: function () {
            var dateAndTime = new Date().toUTCString().split(new Date().getFullYear())[0] + date.getTime("hm");
            document.querySelector("dateTime").innerHTML = dateAndTime;
            console.log("Time update. Next one in: ", 60 - new Date().getSeconds());
        },

        updateVolume: function () {
            volume = system.global.volume;
            if (volume > 66) {
                img = "url('./src/img/volume/high.svg')";
            } else if (volume > 33) {
                img = "url('./src/img/volume/medium.svg')";
            } else if (volume > 0) {
                img = "url('./src/img/volume/low.svg')";
            } else {
                img = "url('./src/img/volume/mute.svg')";
            }
            document.querySelectorAll('volume_icon').forEach(x => x.style.backgroundImage = img)
        }
    },

    lockScreen: {

        form: document.querySelector("body > login > form"),
        loginContainer: document.querySelector('body > login'),

        unlock: function () {
            system.startup();
            this.loginContainer.style.display = 'none'
            document.querySelector('body>linux').style.display = ''

        },

        lock: function () {
            this.form.style = ''
            this.loginContainer.style = 'opacity:0'
            document.querySelector('body>linux').style.display = 'none'
            setTimeout(() => {
                this.loginContainer.style = 'opacity:1'
                this.setup();
            }, 20);
        },


        setup: function () {
            document.querySelector("input[type=password]").value = '';
            this.form.style = "position:relative;bottom:0px;";
            this.loginContainer.style = "opacity:1;"
            document.querySelector("input[type=password]").focus();
        },


        playLoginAnimation: function (x = false) {
            if (x) {
                //Correct password
                this.form.style = "position:relative;bottom:50px;opacity:0;";
                this.loginContainer.style = "opacity:0;"
                setTimeout(() => {
                    this.unlock();
                }, 500);
            } else {
                //Wrong password
                this.form.style = "position:relative;bottom:120px;opacity:1;";
                document.querySelector("input[type=password]").style = "border-color:indianred";
                document.querySelector("input[type=password]").innerHTML = "";

                setTimeout(() => {
                    this.form.style = "position:relative;bottom:0px;opacity:1;";
                }, 120);

                setTimeout(() => {
                    document.querySelector("input[type=password]").style = "";
                }, 300);
            }
        }
    }
}

X.lockScreen.lock()