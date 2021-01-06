X = {
    openMenus: [],


    menus: {
        desktopContextMenu: {
            createOnMousePosition: true,
            listenerType: "contextmenu",
            toggleElement: document.querySelector('desktop'),
            recreateBehaviour: "recreate",
            changeBorder: false,
            preventDefault: true,
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 100, //ms 
            elementTag: "context_menu",

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
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 200, //ms 
            elementTag: "app_menu_container",

            getHTML: function () {
                let html = `
				<app_menu_container>
					<app_search><input placeholder='Type to search' type='search'></app_search>
					<favorites>
					${Object.entries(apps).map(x => {
                    let appIcon;
                    if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                    else if (x[1].name != undefined) appIcon = x[1].name[0];
                    else appIcon = x[0][0];
                    return `<app onclick="X.clearOpenMenus();processes.create('${x[0]}');">${appIcon}</app>`
                }).join('')}
			</favorites>
				</app_menu_container>
		`
                return html;
            },

            closeCondition: function (event) {
                return event.target.tagName != "INPUT"
            },

        },
        statusArea: {
            listenerType: "click",
            toggleElement: document.querySelector("statusArea"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementTag: "status_area_container",
            getHTML: function () {

                return `<status_area_container>
					<item>
					<volume_icon></volume_icon>
					<input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
					</item>
					<item>
					<brightness_icon></brightness_icon>
					<input  oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="100" value="${system.global.brightness}" step="1" type="range">
                    </item>
                    <hr>
                    <item><network_icon></network_icon><text>Connected</text></item>
                    <hr>
					<item onclick="X.clearOpenMenus();processes.create('settings')"><settings_icon></settings_icon><text>Settings</text></item>
					<item onclick='X.lockScreen.lock()'><padlock_icon></padlock_icon><text>Lock</text></item>
                    <dropdown_item onclick='X.general.dropdown.toggle(this)'>
                    <item><power_off_icon></power_off_icon><text>Power Off / Log Out</text><down_icon></down_icon></item>
                    <dropdown>
                        <item onclick='X.restart();'><span>Restart</span></item>
                        <item onclick='X.shutdown();'><span>Power Off</span></item>
                        <hr>
                        <item onclick='X.logout();'><span>Log out</span></item>
                    </dropdown>
                    </dropdown_item>

        </status_area_container>`;
            },
            closeCondition: function (event) {
                return !event.path.includes(document.querySelector("status_area_container"))
                // return event.target.tagName != "DROPDOWN_ITEM"
            },
        },

        loginStatusArea: {
            listenerType: "click",
            toggleElement: document.querySelector("lockscreen_statusArea"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementTag: "status_area_container",
            getHTML: function () {
                return `<status_area_container class='login_status_area_menu'>
					<item>
					<volume_icon></volume_icon>
					<input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
					</item>
					<item>
					<brightness_icon></brightness_icon>
					<input  oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="100" value="${system.global.brightness}" step="1" type="range">
                    </item>
                    <hr>
                    <dropdown_item onclick='X.general.dropdown.toggle(this)'>
                    <item><power_off_icon></power_off_icon><text>Power Off / Log Out</text><down_icon></down_icon></item>
                    <dropdown>
                        <item onclick='X.restart();'><span>Restart</span></item>
                        <item onclick='X.shutdown();'><span>Power Off</span></item>
                    </dropdown>
                    </dropdown_item>

        </status_area_container>`;
            },
            closeCondition: function (event) {
                return !event.path.includes(document.querySelector("status_area_container"))
                // return event.target.tagName != "DROPDOWN_ITEM" && event.target.tagName != "ITEM" && event.target.tagName != "TEXT"
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
                        Object.values(X.services.clock.update.updateElements).forEach(x => {
                            x.element.innerHTML = date.get(x.options);
                        })
                        console.log("Time update. Next one in: ", 60 - new Date().getSeconds());

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
                    newObj = { element: element, options: options }
                    Object.assign(this.updateElements, { newObj })
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

    general: {
        dropdown: {
            toggle: function (element) {
                if (!system.global.elementExists(element)) return false
                let dropdownElement = element.querySelector('dropdown');
                if (dropdownElement.style.height == "") {
                    dropdownElement.style = `height:${dropdownElement.childElementCount * 30}px;`
                    element.querySelector('down_icon').style.transform = "rotate(0deg)";
                }
                else {
                    dropdownElement.style.height = ""
                    element.querySelector('down_icon').style.transform = "";

                }
            }
        },
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
            X.clearOpenMenus();
            //Fades the lockscreen and displays the linux element
            X.services.clock.update.remove(this.loginTime)
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
            X.clearOpenMenus();

            setTimeout(() => {
                this.p.style.opacity = '1';
            }, 3000);

            document.querySelector('body>linux').style.opacity = '0'
            setTimeout(() => {
                this.loginContainer.style = 'opacity:1'
                document.querySelector("input[type=password]").value = '';
                this.form.style = "position:relative;bottom:0px;display:none";
                this.loginContainer.style = "opacity:1;"
                document.querySelector('body>linux').style = 'visibility:hidden'
            }, 20);


            document.body.setAttribute('onkeyup', `X.lockScreen.showForm(event)`)
        },

        showForm: event => {
            let passwordInput = X.lockScreen.form.querySelector("input[type='password']");
            X.lockScreen.loginTime.style = 'opacity:0;top: 0px'

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
                document.querySelector('body>linux').style = 'visibility:hidden;opacity: 0'
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
        page.changePage('./src/html/linuxWeb_shutdown.html');
    },
    logout: function () {
        page.changePage('./src/html/linuxWeb_X.html');
    },
    restart: function () {
        page.changePage('./src/html/linuxWeb_shutdown.html', 'restart');
    },

    powerMenu: {
        //Displays the power menu (* Im thinking of getting rid of this and replace it with a dropdown menu in the statusArea)
        show: function () {
            X.clearOpenMenus();
            systemMenuContainer.innerHTML += `
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
    //initializes the X object 
    initialize: function () {
        X.menus.openMenuClicked = false
        this.openMenu = []
        // Execute all the enable() methods in the X objects
        xObjSchema = {
            createOnMousePosition: false,
            listenerType: "click",
            toggleElement: undefined,
            recreateBehaviour: "toggle",
            changeBorder: true,
            preventDefault: false,
            getHTML: '',
            onCreate: '',
            closeCondition: '',
            enterAnimation: "",
            exitAnimation: "",
            elementTag: "",
        }

        // Do stuff.. Make all the objects with a toggle button show their html and handle the clicking and closing when clicked outside of html. i don't know what im writing i hope this is understandable
        Object.entries(X.menus).forEach(xObj => {
            let [xObjName, xObjValue] = [xObj[0], xObj[1]];
            let menuUIData = {};
            Object.assign(menuUIData, xObjSchema);
            Object.assign(menuUIData, xObjValue);
            // console.log(xObjName, menuUIData);
            if (typeof (xObjValue) == "object" && menuUIData.toggleElement != undefined && typeof menuUIData.getHTML == 'function') {
                //Adds a 'onclick' listener for the button element that creates a menu(app menu,status menu...)
                menuUIData.toggleElement.addEventListener(menuUIData.listenerType, event => {
                    // console.log('sysClicked', event);
                    if (!X.openMenus.includes(xObjName) || menuUIData.recreateBehaviour == 'recreate') {
                        X.clearOpenMenus(true)
                        menuUIData.preventDefault && event.preventDefault()
                        setTimeout(() => {
                            X.createMenu(menuUIData, event.clientX, event.clientY)

                            //Block the body 'onclick' from deleting the popups when you clicked on them.
                            //Block if we '!want' it closed. Get it?
                            systemMenuContainer.children[systemMenuContainer.children.length - 1].addEventListener('click', (event) => {
                                if ((typeof menuUIData.closeCondition == 'function' && !menuUIData.closeCondition(event)) || typeof menuUIData.closeCondition != 'function') {
                                    X.menus.openMenuClicked == false && (X.menus.openMenuClicked = true);
                                }
                            })
                            menuUIData.changeBorder && (menuUIData.toggleElement.style.borderBottom = "solid gray 2px");
                            X.openMenus.push(xObjName);
                            typeof menuUIData.onCreate == 'function' && menuUIData.onCreate(event);
                        }, 1);
                    }
                });
            }
        });

        // Deletes a popup when it's clicked outside of it.
        document.body.addEventListener("click", () => {
            if (X.menus.openMenuClicked) {
                X.menus.openMenuClicked = false
                return false;
            }
            X.clearOpenMenus()
        });

    },
    //Clear all open menus.
    clearOpenMenus: function (forcefully = false) {
        if (X.openMenus.length != 0 || forcefully) {
            X.openMenus.forEach(openMenu => {
                X.menus[openMenu].toggleElement.style.borderBottom = "";
                if (X.menus[openMenu].elementTag && X.menus[openMenu].exitAnimation) {
                    //If there is a exitAnimation then play it and remove the element

                    let element = document.querySelector(X.menus[openMenu].elementTag);
                    systemExitAnimationMenuContainer.insertAdjacentElement('afterbegin', element);
                    element.classList.add(X.menus[openMenu].exitAnimation)
                    if (X.menus[openMenu].enterAnimation) {
                        element.classList.remove(X.menus[openMenu].enterAnimation)
                    }
                    setTimeout(() => {
                        element.remove()
                    }, X.menus[openMenu].exitAnimationTime || 200);
                }
            })
            X.openMenus = [];

            // X.statusArea.volumeSliderDisplayToggle(true);
            systemMenuContainer.innerHTML = "";
        }
    },

    createMenu: function (menuUIData, x, y) {
        // console.log(menuUIData, x, y);
        if (menuUIData.createOnMousePosition) elHTML = menuUIData.getHTML(x, y);
        else elHTML = menuUIData.getHTML()

        systemMenuContainer.innerHTML += elHTML //Add the objects html to the DOM.
        if (menuUIData.elementTag != "" && menuUIData.enterAnimation != "") {
            //If there is a enterAnimation then append it
            let element = systemMenuContainer.querySelector(menuUIData.elementTag);
            element.classList.add(menuUIData.enterAnimation);
        }

    }
}
//Executes onStart for every X.[service]
Object.entries(X.services).forEach(xObj => {
    let [xObjName, xObjValue] = [xObj[0], xObj[1]];
    typeof xObjValue.onStart == 'function' && xObjValue.onStart()
})
system.startup()


