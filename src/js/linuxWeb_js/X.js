X = {


    menus: {
        desktopContextMenu: {
            //enable is executed on system startup
            createOnMousePosition: true,
            listenerType: "contextmenu",
            toggleElement: document.querySelector('desktop'),
            recreateBehaviour: "recreate",
            changeBorder: false,
            preventDefault: true,
            getHTML: function (x = 100, y = 100) {
                return `
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
				`

            },
            closeCondition: function (event) {
                return event.target.tagName != "CONTEXT_MENU"
            },


            onCreate: function () {

                document.querySelectorAll('.context_sub_menu').forEach(x => {
                    x.addEventListener('mouseover', () => {
                        x.querySelector('context_sub_menu').style.display = 'block'
                    })
                    x.addEventListener('mouseleave', () => {
                        x.querySelector('context_sub_menu').style.display = ''
                    })
                })

            },



        },
        appMenu: {
            listenerType: "click",
            toggleElement: document.querySelector('app_menu_button'),
            getHTML: function () {
                let html = `
				<app_menu_container>
					<app_search><input placeholder='Type to search' type='search'></app_search>
					<app_list>
					${Object.entries(apps).map(x => {
                    let appIcon;
                    if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                    else if (x[1].name != undefined) appIcon = x[1].name[0];
                    else appIcon = x[0][0];
                    return `<app onclick="system.clearOpenMenus();processes.create('${x[0]}');">${appIcon}</app>`
                }).join('')}
			</app_list>
				</app_menu_container>
		`
                return html;
            },
        },
        statusArea: {
            listenerType: "click",
            toggleElement: document.querySelector("statusArea"),

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
                    <hr>
                    <item><network_icon></network_icon><text>Connected</text></item>
                    <hr>
					<item onclick="system.clearOpenMenus();processes.create('settings')"><settings_icon></settings_icon><text>Settings</text></item>
					<item onclick='X.lockScreen.lock()'><padlock_icon></padlock_icon><text>Lock</text></item>
					<item onclick='X.powerMenu.show()'><power_off_icon ></power_off_icon><text>Power Off/Log Out</text></item>

        </status_area_container>`;
            },
        },
    },
    services: {
        clock: {
            onStart: function () {
                //Triggers when the page loads
                setTimeout(() => {
                    setInterval(() => {
                        //Updates all elements in the 'updateElements' object
                        Object.value(X.services.clock.update.updateElements).forEach(x => {
                            dateAndTime = date.get(x.options)
                            x.element.innerHTML = dateAndTime;
                            console.log("Time update. Next one in: ", 60 - new Date().getSeconds());
                        })
                    }, 60 * 1000);
                }, (60 - new Date().getSeconds()) * 1000); // Makes sure the update is synchronized
            },

            update: {
                //updateElements stores the elements and the options for how  the time should be displayed on them eg. 0:{element,options}
                updateElements: {},
                //add Adds a new element to the object
                add: function (element, options) {
                    for (const x in this.updateElements) {
                        if (this.updateElements[x].element == element) {
                            return false
                        }
                    }

                    Object.assign(this.updateElements, { element: element, options: options })
                    this.updateNow(element, options)

                },
                //remove Removes a existing element from the object

                remove: function (element) {
                    for (const x in this.updateElements) {
                        if (this.updateElements[x].element == element) {
                            delete this.updateElements[x];
                            return true
                        }
                    }
                },
                //Immediately updates the element with the options.
                updateNow: function (element, options) {
                    element.innerHTML = date.get(options)
                }

            }

        },
        volume: {
            update: function () {
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

        }
    },



    overlay: {
        //Simply remove's any element with the overlay tag
        remove: function () {
            document.querySelectorAll('overlay').forEach(x => x.remove())
        }
    },

    lockScreen: {
        //Define are lockscreen elements
        form: document.querySelector("body > login > form"),
        loginContainer: document.querySelector('body > login'),
        loginTime: document.querySelector('body > login > login_time'),
        time: document.querySelector('body > login > login_time > time'),
        date: document.querySelector('body > login > login_time > date'),
        p: document.querySelector("login > login_time > p "),
        unlock: function () {
            //Fades the lockscreen and displays the linux element
            X.services.clock.update.remove(this.loginTime)
            system.startup();
            this.loginContainer.style.display = 'none'
            document.querySelector('body>linux').style = 'opacity:0;'
            setTimeout(() => {
                document.querySelector('body>linux').style.opacity = '1'
            }, 20);
        },

        lock: function () {
            // Shows the lockscreen and hides the linux function element
            // Hides the form so the time gets displayed
            // And when the user presses a key
            // then showForm() gets executed, the time goes away and form fades in
            this.loginContainer.style = 'opacity:0'
            this.form.style = "display:none";
            this.loginTime.style = '';
            this.p.style.opacity = '0';
            X.services.clock.update.add(this.time, 'time-s');
            X.services.clock.update.add(this.date, 'day>str month>str date');

            setTimeout(() => {
                this.p.style.opacity = '1';
            }, 3000);

            document.querySelector('body>linux').style.opacity = '0'
            setTimeout(() => {
                this.loginContainer.style = 'opacity:1'
                document.querySelector("input[type=password]").value = '';
                this.form.style = "position:relative;bottom:0px;display:none";
                this.loginContainer.style = "opacity:1;"

                document.querySelector('body>linux').style.display = 'none'
            }, 20);

            document.body.setAttribute('onkeyup', `X.lockScreen.showForm(event)`)
        },

        showForm: event => {
            let passwordInput = X.lockScreen.form.querySelector("input[type='password']");
            X.lockScreen.loginTime.style = 'opacity:0;top: 0px'
            console.log(event)

            setTimeout(() => {
                X.lockScreen.form.style = 'opacity: 1'
                X.lockScreen.form.querySelector("input[type='password']").focus();//Focus the input
            }, 200);
            setTimeout(() => {
                X.lockScreen.loginTime.style = 'display:none'
            }, 500);
            // Removes the onkeyup attribute so this is not executed more than once
            document.body.removeAttribute('onkeyup');

        },
        //Self explanatory.
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
                document.querySelector("input[type=password]").style = "border-color:var(--error-color)";
                document.querySelector("input[type=password]").innerHTML = "";

                setTimeout(() => {
                    this.form.style = "position:relative;bottom:0px;opacity:1;";
                }, 120);

                setTimeout(() => {
                    document.querySelector("input[type=password]").style = "";
                }, 300);
            }
        }
    },
    prompt: {
        //Not finished
        create: function (message, type) {
            return false;
            switch (type) {
                case "warn":
                    break;
                case "error":
                    break;
                case "info":
                    break;
                case "value":
                    break;
                case "input":
                    break;
                default:
                    break;
            }

        },

    },
    shutdown: function () {
        page.changePage('./X/linuxWeb_shutdown.html');
    },
    logout: function () {
        page.changePage('./X/linuxWeb_X.html');
    },
    restart: function () {
        page.changePage('./X/linuxWeb_shutdown.html', 'restart');
    },

    powerMenu: {
        //Displays the power menu (* Im thinking of getting rid of this and replace it with a dropdown menu in the statusArea)
        show: function () {
            system.clearOpenMenus();
            popupContainer.innerHTML += `
                <overlay>
                    <power_menu>
                    <options>
                        <div><power_off_icon  onclick='X.shutdown();'></power_off_icon><span>Power Off</span></div>
                        <div><logout_icon  onclick='X.logout();'></logout_icon><span>Log out</span></div>
                        <div><restart_icon onclick='X.restart();' ></restart_icon><span>Restart</span></div>
                    </options>
                        <cancel_button onclick='X.overlay.remove()'>Cancel</cancel_button>
                        </power_menu>
                </overlay>
            `;

        }
    },
}
//Executes onStart for every X.[service]
Object.entries(X.services).forEach(xObj => {
    let [xObjName, xObjValue] = [xObj[0], xObj[1]];
    typeof xObjValue.onStart == 'function' && xObjValue.onStart()
})
X.lockScreen.lock()
