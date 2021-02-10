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
				<context_item>Change Background</context_item><hr>
				<context_item onclick="processes.create('terminal')">Terminal</context_item>
				<context_item onclick="processes.create('settings');">Settings</context_item>
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
        activities: {
            listenerType: "click",
            toggleElement: document.querySelector('activities_menu_button'),
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 200, //ms 
            elementTag: "activities_menu_container",

            getHTML: function () {
                let html = `
				<activities_menu_container>
					<app_search><search_icon></search_icon><input placeholder='Type to search' type='search'></app_search>
					<favorites>
					${Object.entries(apps).map(x => {
                    let appIcon;
                    if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                    else if (x[1].name != undefined) appIcon = x[1].name[0];
                    else appIcon = x[0][0];
                    return `<app onclick="X.clearOpenMenus();processes.create('${x[0]}');">${appIcon}</app>`
                }).join('')}
			</favorites>
				</activities_menu_container>
		`
                return html;
            },

            closeCondition: function (event) {
                return !X.general.elementIsInEventPath(event, document.querySelector("activities_menu_container"))
            },

        },
        notificationPanel: {
            listenerType: "click",
            toggleElement: document.querySelector("datetime"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementTag: "notification_panel_container",
            parseNotificationsToHTML: function () {
                if (notifications = X.notification.get()) {
                    let html = "";
                    Object.values(notifications).forEach(x => {
                        html += `<notification onclick="${x.clickAction}"><notification_content><img src='${x.iconPath}'><text><title>${x.title}</title><description>${x.description}</description></text></notification_content>${!x.type ? `<x_icon onclick='X.notification.remove(${x.id}); this.parentElement.remove()'></x_icon>` : ""}</notification>`;
                    })
                    return html;
                }
            },
            getHTML: function () {
                return `<notification_panel_container><notifications_container>${this.parseNotificationsToHTML()}</notifications_container><calendar_container> ${X.calendar.getHTML()}</calendar_container></notification_panel_container>`;
            },
            closeCondition: function (event) {
                return !X.general.elementIsInEventPath(event, document.querySelector("notification_panel_container")) || X.general.tagIsInEventPath(event, "NOTIFICATION");
            }
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
					<input  oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="175" value="${system.global.brightness}" step="1" type="range">
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
                        <item onclick='X.logout();'><span>Log Out</span></item>
                    </dropdown>
                    </dropdown_item>

        </status_area_container>`;
            },
            closeCondition: function (event) {
                return !X.general.elementIsInEventPath(event, document.querySelector("status_area_container"))
            },
        },

        loginStatusArea: {
            listenerType: "click",
            toggleElement: document.querySelector("lockscreen_statusArea"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementTag: "status_area_container",
            getHTML: () => `<status_area_container class='login_status_area_menu'>
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
        </status_area_container>`,
            closeCondition: function (event) {
                return !X.general.elementIsInEventPath(event, document.querySelector("status_area_container"))
            },
        },
    },

    notification: {
        notifications: {},
        get: function () {
            if (this.notifications == {}) return false
            return this.notifications;
        },
        create: function (title = "", description = "", clickAction = "", iconPath = "", persistent = false) {
            title = title || "Notification";
            description = description || "This is a default notification";
            iconPath = iconPath || "./img/about.svg";
            type = typeof (type) != "boolean" ? false : persistent; //'persistent', 'temporary'
            clickAction = clickAction || "";
            id = Object.entries(this.notifications).length == 0 ? 0 : Number(Object.keys(this.notifications).sort().slice(-1)) + 1
            this.notifications[id] = {
                "title": title,
                "description": description,
                "iconPath": iconPath,
                "type": type,
                "clickAction": clickAction,
                "id": id,
            };
        },
        remove: function (id) {
            delete this.notifications[id]
        },
    },

    calendar: {

        getHTML: function () {
            let htmlOut =
                `<calendar><month>${date.get('month>full date year')}</month><calendar_content>
<week_days><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></week_days><dates>`
            let calendarArray = this.createCalendarArray(0, 0, true, true)
            calendarArray.forEach(week => {
                htmlOut += "<week>"
                htmlOut += week.map(date => `<day><span ${date.startsWith('-') ? "class = 'not_current_months_date'" : ""} ${date.startsWith('&') ? "class = 'current_date'" : ""}>${date.replace(/-|&/gm, '') || date}</span></day>`).join('')
                htmlOut += "</week>"
            });
            return htmlOut + "</calendar_content>";
        },
        createCalendarArray: function (year = 0, month = 0, notMonthDatePrefix = false, currentDatePrefix = false) {
            year = year || date.get("year");
            month = month || date.get("month");
            const monthFirstDay = new Date(`${year}/${month}/1`)
            monthLastDay = new Date(monthFirstDay)
            monthLastDay.setMonth(monthLastDay.getMonth() + 1)
            monthLastDay = new Date(monthLastDay - 3600 * 1000 * 24)
            const previousMonthFirstDay = new Date(monthFirstDay)
            previousMonthFirstDay.setMonth(previousMonthFirstDay.getMonth() - 1)
            const previousMonthLastDay = new Date(monthFirstDay - 3600 * 1000 * 24)
            // const nextMonthFirstDay = new Date(monthLastDay + 3600 * 1000 * 24);
            let calendarStartDate = new Date(monthFirstDay - 3600 * 1000 * 24 * monthFirstDay.getDay())
            let previousMonthDateRange = range(calendarStartDate.getDate(), previousMonthLastDay.getDate() + 1);
            let currentMonthDateRange = range(monthFirstDay.getDate(), monthLastDay.getDate() + 1)
            let nextMonthDateRange = range(1, 30)
            if (notMonthDatePrefix) {
                previousMonthDateRange = previousMonthDateRange.map(x => { return "-" + x });
                nextMonthDateRange = nextMonthDateRange.map(x => { return "-" + x });
            }
            if (currentDatePrefix) {
                day = Number(date.get('date'))
                currentMonthDateRange[day - 1] = "&" + currentMonthDateRange[day - 1]

            }

            let calendarDates = [].concat(
                previousMonthDateRange,
                currentMonthDateRange,
                nextMonthDateRange,
            ).slice(0, 42)

            calendarDates = calendarDates.map(x => { x = String(x); return x.length == 1 ? '0' + x : x })
            let ret = [];
            for (let i = 0; i < 6; i++) ret.push(calendarDates.splice(0, 7))
            return ret;
        }
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
                        });
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
                    img = "url('./img/volume/high.svg')";
                } else if (volume > 33) {
                    img = "url('./img/volume/medium.svg')";
                } else if (volume > 0) {
                    img = "url('./img/volume/low.svg')";
                } else {
                    img = "url('./img/volume/mute.svg')";
                }
                document.querySelectorAll('volume_icon').forEach(x => x.style.backgroundImage = img)
            }

        }
    },

    general: {
        dropdown: {
            toggle: (element) => {
                if (!elementExists(element)) return false
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
        elementIsInEventPath: (event, element) => {
            clickPath = event.path || event.composedPath() //event.path is for chrome and event.composedPath() is mozilla firefox
            return clickPath.includes(element)
        },
        tagIsInEventPath: (event, tag) => {
            tag = tag.toUpperCase()
            clickPath = event.path || event.composedPath()
            for (element of clickPath) {
                if (element.tagName == tag) return true
            }
            return false
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
        form: document.querySelector("body > .login > form"),
        loginContainer: document.querySelector('body > .login'),
        loginTime: document.querySelector('body > .login > .login_time'),
        time: document.querySelector('body > .login > .login_time > time'),
        date: document.querySelector('body > .login > .login_time > date'),
        p: document.querySelector(".login > .login_time > p "),

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
            setTimeout(() => {
                document.body.setAttribute('onclick', `X.lockScreen.showForm(event)`)
                document.body.setAttribute('onkeydown', `X.lockScreen.showForm(event)`)

            }, 20);
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
            document.body.removeAttribute('onclick')
            document.body.removeAttribute('onkeydown');

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
    cta: function (title = "cta title :)", message = "This is a generic cta message", buttons = [["OK", true]]) {
        //Has to be invoked with await to work correctly
        X.clearOpenMenus();//We remove any open menus

        // buttons: {["buttonText","returnValue"],["Cancel",false]}
        // returnValue is what will be return when the user clicks that button.
        if (buttons == [] || typeof buttons != 'object') return false;
        if (typeof buttons[0] != "object") buttons = [...buttons];
        let buttonsHTML = buttons.map(x => { return `<input type='button' value='${x[0]}'>` }).join('')

        let ctaHTML = `
            <overlay>
                <cta>
                    <cta_title>${title}</cta_title>
                    <cta_message>${message}</cta_message>
                    <cta_buttons>${buttonsHTML}</cta_buttons>
                </cta>
            </overlay>
            `
        overlayContainer.innerHTML += ctaHTML;
        document.querySelector("cta > cta_buttons > input").focus()
        buttonsInDOM = document.querySelectorAll("cta > cta_buttons > input");
        return new Promise(resolve => {
            for (const i in buttons) {
                buttonsInDOM[i].addEventListener('click', async event => {
                    X.overlay.remove()
                    resolve(buttons[i][1]);
                })
            }
        });

    },



    shutdown: async function () {
        let shutdownTimeout = setTimeout(() => {
            system.shutdown()
        }, 10000);
        let shutdowncta = X.cta("Power Off", "This 'thing' Will turn off in 10 seconds!", [["Cancel", false], ["Power Off", true]]);
        if (await shutdowncta) system.shutdown()
        clearTimeout(shutdownTimeout);

    },
    logout: async function () {
        let logoutTimeout = setTimeout(() => {
            system.logout();
        }, 10000);
        let logoutcta = X.cta("Log Out", "You will be logged out in 10 seconds!", [["Cancel", false], ["Log Out", true]]);
        if (await logoutcta) system.logout();
        clearTimeout(logoutTimeout);
    },
    restart: async function () {
        let restartTimeout = setTimeout(() => {
            system.restart()
        }, 10000);
        let restartcta = X.cta("Restart", "This 'thing' Will restart in 10 seconds!", [["Cancel", false], ["Restart", true]]);
        if (await restartcta) system.restart()
        clearTimeout(restartTimeout);
    },
    //initializes the X object 
    initialize: function () {

        linux = document.querySelector("body > linux");
        desktop = document.querySelector("linux > desktop");
        topBar = document.querySelector("linux > top_bar");
        appsContainer = document.querySelector("linux > apps_container");
        appList = document.querySelector("linux > app_list");
        systemMenuContainer = document.querySelector("system_menu_container");
        systemExitAnimationMenuContainer = document.querySelector("system_menu_animation_container");
        overlayContainer = document.querySelector("body > overlay_container");

        Object.entries(X.services).forEach(xObj => {
            let [xObjName, xObjValue] = [xObj[0], xObj[1]];
            typeof xObjValue.onStart == 'function' && xObjValue.onStart()
        })

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
            if (typeof (xObjValue) == "object" && menuUIData.toggleElement != undefined && typeof menuUIData.getHTML == 'function') {
                //Adds a 'onclick' listener for the button element that creates a menu(app menu,status menu...)
                menuUIData.toggleElement.addEventListener(menuUIData.listenerType, event => {
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
        console.log("X Initialize");
        X.lockScreen.lock();

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
        let elHTML = menuUIData.getHTML(x, y);
        let elTag = menuUIData.elementTag;
        systemMenuContainer.insertAdjacentHTML("beforeend", elHTML) //Add the objects html to the DOM.

        if (menuUIData.createOnMousePosition) {
            let el = systemMenuContainer.querySelector(elTag)

            // Correct the menu position if the part of it appears outside the screen
            console.log(1, y, x);
            x = x > window.innerWidth - el.offsetWidth ? window.innerWidth - el.offsetWidth : x
            y = y > window.innerHeight - (el.offsetHeight + appList.offsetHeight) ? window.innerHeight - (el.offsetHeight + appList.offsetHeight + 1) : y
            console.log(2, y, x);
            el.style.top = y + 'px'
            el.style.left = x + 'px'

        }

        if (menuUIData.elementTag != "" && menuUIData.enterAnimation != "") {
            //If there is a enterAnimation then append it
            let element = systemMenuContainer.querySelector(menuUIData.elementTag);
            element.classList.add(menuUIData.enterAnimation);
        }

    }
}
//Executes onStart for every X.[service]


