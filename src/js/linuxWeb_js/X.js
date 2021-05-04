X = {
    openMenus: [],
    status: {

        screen: "lockScreen"

    },
    menus: {
        desktopContextMenu: {
            //Menu options
            createOnMousePosition: true,
            listenerType: "contextmenu",
            toggleElement: document.querySelector('#desktop'),
            recreateBehaviour: "recreate",
            changeBorder: false,
            preventDefault: true,
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 100, //ms 
            elementQuery: "#context_menu",

            getHTML: function (x = 100, y = 100) {
                return `
		<div id='context_menu' style="top: ${y}px;left: ${x}px;">
				<span onclick="X.cta('Unavailable','This feature is not yet implemented',[['Sad Face :(']])">Change Background</span>
                <hr>
				<span onclick="processes.create('terminal')">Terminal</span>
				<span onclick="processes.create('settings')">Settings</span>
                <hr>
                <span class='context_sub_menu_header'>Hello</span>
                <div class='context_sub_menu'>
                <span>New</span>
                <span>Context</span>
                <span>Sub</span>
                <span>Menu</span>
                <span>YAY!</span>

                </div>
			</div>
				`

            },
            // Close the menu when the condition returns true
            closeCondition: function (event) {
                return event.target.id != "context_menu"
            },
        },
        activities: {
            listenerType: "click",
            toggleElement: document.querySelector('#activitiesMenuButton'),
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 200, //ms 
            elementQuery: "#activitiesMenuContainer",

            getHTML: function () {
                let html = `
				<div id='activitiesMenuContainer'>
					<div class='app_search'><search_icon></search_icon><input placeholder='Type to search' type='search'></div>
					<div class='favorites'>
					${Object.entries(apps).map(x => {
                    let appIcon;
                    if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                    else if (x[1].name != undefined) appIcon = `<span>${x[1].name[0]}</span>`;
                    else appIcon = x[0][0];
                    return `<app onclick="X.clearOpenMenus();processes.create('${x[0]}');" --data-tooltip="${x[1].name}" >${appIcon}</app>`
                }).join('')}
			</div>
				</div>
		`
                return html;
            },

            closeCondition: function (event) {
                return event.target == document.querySelector("#activitiesMenuContainer")
            },

        },
        notificationPanel: {
            listenerType: "click",
            toggleElement: document.querySelector("#topBarDateTime"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementQuery: "#notificationPanelContainer",

            parseNotificationsToHTML: function () {
                let notifications
                if (notifications = X.notification.get()) {
                    let html = "";
                    Object.values(notifications).forEach(x => {
                        html += `<notification onclick="${x.clickAction}"><div class='notification_content'><img src='${x.iconPath}'><div class='notification_text_wrapper'><h1>${x.title}</h1><div class='description'>${x.description}</div></div></div>${!x.type ? `<x_icon onclick='X.notification.remove(${x.id}); this.parentElement.remove()'></x_icon>` : ""}</notification>`;
                    })
                    return html;
                }
            },
            getHTML: function () {
                if (X.status.screen == "desktop") {

                    reminderForm = {
                        message: { display: "Message", value: "", type: 'string', required: true },
                        time: { display: "Remind At", value: 0, type: 'number', required: true },
                    }

                    let onclick = `(async()=>{reminder = await X.ctaform("Create Reminder", ${JSON.stringify(reminderForm)});
                command = "remind " + reminder.message.value + " -t " + reminder.time.value;
                system.cli.i(command, true)})()`
                    console.log(onclick);

                    return `<div id='notificationPanelContainer'>
                    <div class='notifications_container'>
                        <div class='notification_wrapper'>${this.parseNotificationsToHTML()}</div>
                            <div class='notification_footer'>
                                <do_not_disrupt><span>Do not disturb</span><input id='doNotDisruptSwitch' ${system.global.doNotDisturb && "checked"} type="checkbox"><label onclick="system.global.doNotDisturb = !this.parentElement.querySelector('#doNotDisruptSwitch').checked" for="doNotDisruptSwitch"></label></do_not_disrupt>
                            <button class='button type-a' onclick='X.notification.removeAll(); document.querySelector("#notificationPanelContainer .notifications_container div.notification_wrapper").innerHTML = X.menus.notificationPanel.parseNotificationsToHTML()'>Clear</button>
                            </div>
                    </div>
                        <calendar_container>
                            <div class='calendar_wrapper'>
                                ${X.calendar.getHTML()}
                            </div>
                            <button class='button type-a' onclick='${onclick}'>Add Reminder</button>
                        </calendar_container>
                    </div>`;
                }
                if (X.status.screen == "loginScreen") {
                    return `<div id='notificationPanelContainer'>
                        <calendar_container>
                            <div class='calendar_wrapper'>
                                ${X.calendar.getHTML()}
                            </div>
                        </calendar_container>
                    </div>`;
                }
            },
            closeCondition: function (event) {
                return !elementIsInEventPath(event, document.querySelector("#notificationPanelContainer")) || (tagIsInEventPath(event, "NOTIFICATION") && event.target.tagName != "X_ICON");
            }
        },
        statusArea: {
            listenerType: "click",
            toggleElement: document.querySelector("#statusAreaButton"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementQuery: "#statusAreaContainer",
            getHTML: function () {

                if (X.status.screen == "loginScreen") {
                    return `<div id='statusAreaContainer'>
                        <li>
                            <volume_icon></volume_icon>
                            <input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
                        </li>
                        <li>
                            <brightness_icon></brightness_icon>
                            <input oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="175" value="${system.global.brightness}" step="1" type="range">
                        </li>
                        <hr>
                        <div class='dropdown_item' onclick='X.general.dropdown.toggle(this)'>
                            <li><power_off_icon></power_off_icon><span>Power Off / Log Out</span><down_icon></down_icon></li>
                            <dropdown>
                                <li onclick='X.restart();'><span>Restart</span></li>
                                <li onclick='X.shutdown();'><span>Power Off</span></li>
                            </dropdown>
                        </div>
                    </div>`
                }

                if (X.status.screen == "lockScreen") {
                    return `<div class='lockscreen' id='statusAreaContainer'>
                    <li>
                        <volume_icon></volume_icon>
                        <input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
                    </li>
                    <li>
                        <brightness_icon></brightness_icon>
                        <input oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="175" value="${system.global.brightness}" step="1" type="range">
                    </li>
                    <hr>
                    <div class='dropdown_item' onclick='X.general.dropdown.toggle(this)'>
                        <li><power_off_icon></power_off_icon><span>Power Off / Log Out</span><down_icon></down_icon></li>
                        <dropdown>
                            <li onclick='X.logoff();'><span>Log Off</span></li>
                            <hr>
                            <li onclick='X.restart();'><span>Restart</span></li>
                            <li onclick='X.shutdown();'><span>Power Off</span></li>
                        </dropdown>
                    </div>
                        </div>`
                }

                if (X.status.screen == "desktop") {
                    return `<ul id='statusAreaContainer'>
                    <li>
                    <volume_icon></volume_icon>
                    <input oninput='system.changeVolume(this.value)' id='volume_slider' min="0" max="100" value="${system.global.volume}" step="1" type="range">
                    </li>
                    <li>
                    <brightness_icon></brightness_icon>
                    <input  oninput='system.changeBrightness(this.value)' id='brightness_slider' min="25" max="175" value="${system.global.brightness}" step="1" type="range">
                    </li>
                    <hr>
                    <li><network_icon></network_icon><span>Connected</span></li>
                    <hr>
                    <li onclick="X.clearOpenMenus();processes.create('settings')"><settings_icon></settings_icon><span>Settings</span></li>
                    <li onclick='X.lockScreen.lock()'><padlock_icon></padlock_icon><span>Lock</span></li>
                    <div class='dropdown_item' onclick='X.general.dropdown.toggle(this)'>
                    <li><power_off_icon></power_off_icon><span>Power Off / Log Out</span><down_icon></down_icon></li>
                    <dropdown>
                        <li onclick='X.restart();'><span>Restart</span></li>
                        <li onclick='X.shutdown();'><span>Power Off</span></li>
                        <hr>
                        <li onclick='X.logout();'><span>Log Out</span></li>
                    </dropdown>
                    </div>
                    </ul>`;
                }

            },
            closeCondition: function (event) {
                return !elementIsInEventPath(event, document.querySelector("#statusAreaContainer"))
            },
        },
    },
    //The notification handler
    notification: {
        notifications: {},
        get: function () {
            if (this.notifications == {}) return false
            return this.notifications;
        },
        create: function (title = "", description = "", clickAction = "", iconPath = "", persistent = false, alert = true) {
            title = title || "Notification";
            description = description || "This is a default notification";
            iconPath = iconPath || "./img/about.svg";
            type = typeof (type) != "boolean" ? false : persistent; //'persistent', 'temporary'
            clickAction = clickAction || "";
            id = Object.entries(this.notifications).length == 0 ? 0 : Number(Object.keys(this.notifications).sort().slice(-1)) + 1
            //Creates an popup notification when condition is true.
            if (alert && !system.global.doNotDisturb) {
                notificationHTML = `<div onclick="${clickAction}; this.style.display = 'none'" ><title>${title}</title><description>${description}</description></div>`;
                popupNotificationContainer.insertAdjacentHTML('afterbegin', notificationHTML);
                popupNotificationContainer.children[0].style.transform = "scale(1)";

                popupNotificationContainer.children[0].style.transition = "all 0.2s linear";
                setTimeout(() => {
                    popupNotificationContainer.children[0].style.transform = "scale(0.8)";
                    popupNotificationContainer.children[0].style.opacity = "0";
                    setTimeout(() => {
                        popupNotificationContainer.children[0].remove()
                    }, 200);
                }, 5000);
            }
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
        removeAll: function () { // Removes all not persistent notifications
            for (x of Object.entries(X.notification.notifications)) {
                if (x[1].type == false) delete X.notification.notifications[x[0]]
            }
        }
    },

    calendar: {
        getHTML: function () {
            let htmlOut =
                `<div class='calendar'><month>${date.get('month>full date year')}</month><div class='calendar_content'>
<week_days><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></week_days><dates>`
            let calendarArray = this.createCalendarArray(0, 0, true, true)
            calendarArray.forEach(week => {
                htmlOut += "<week>"
                htmlOut += week.map(date => `<day><span ${date.startsWith('-') ? "class = 'not_current_months_date'" : ""} ${date.startsWith('&') ? "class = 'current_date'" : ""}>${date.replace(/-|&/gm, '') || date}</span></day>`).join('')
                htmlOut += "</week>"
            });
            return htmlOut + "</div></div>";
        },
        //Creates an calendar array. Yes a lot of Date stuff
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
                        console.log("Time updated. Next one in: ", 60 - new Date().getSeconds());
                    }, 60 * 1000);
                }, (60 - new Date().getSeconds()) * 1000); // Makes sure the update is synchronized
            },

            update: {
                //updateElements stores the elements and their options eg. 0:{element,options}

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
            //Dropdown handler...
            toggle: (element) => {
                if (!isDefined(element)) return false
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
        //Creates an overlay
        create: function (html) {
            overlayContainer.innerHTML += `<div class='overlay'>${html}</div>`;
        },
        //Simply removes any element with the overlay tag
        remove: function () {
            document.querySelectorAll('div.overlay').forEach(x => x.remove())
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
                <cta>
                    <h1>${title}</h1>
                    <span>${message}</span>
                    <div class='buttons_container'>${buttonsHTML}</div>
                </cta>
            `
        X.overlay.create(ctaHTML)

        document.querySelector("cta > .buttons_container > input").focus()
        buttonsInDOM = document.querySelectorAll("cta > .buttons_container > input");
        return new Promise(resolve => {
            for (const i in buttons) {
                buttonsInDOM[i].addEventListener('click', async event => {
                    X.overlay.remove()
                    resolve(buttons[i][1]);
                })
            }
        });

    },

    ctaform: function name(title, formObj) {
        //Has to be invoked with await to work correctly
        let formHtml = ""


        // Example of formObj
        // formObj = {
        //     Item1: { display: "First Item", value: 0, type: Number(), required: true },
        //     Item2: { display: "Second Item", value: "", type: String(), required: true },
        //     Item3: { display: "Third Item", value: "", type: String(), required: true },
        //     Item4: { display: "Fourth Item", value: "", type: String(), required: true },
        // }

        if (isObjectEmpty(formObj))
            return false

        for (const item of Object.entries(formObj)) {
            itemName = item[0]
            itemContent = item[1]

            itemType = typeof itemContent.type
            if (itemType != "number" && itemType != "string")
                itemContent.type = "";

            formHtml += `<li><span>${itemContent.display}</span><input id='${itemName}' type='${itemContent.type}' value='${itemContent.value}' ></li>`
        }

        let ctaHTML = `
                <cta>
                    <h1>${title}</h1>
                    <form>${formHtml}</form>
                    <span class='error_message'></span>
                    <div class='buttons_container'><input type='button' value='Cancel'><input type='button' value='Submit'></div>
                </cta>
            `
        X.overlay.create(ctaHTML)
        ctaFormInputsInDOM = document.querySelectorAll("cta > form input");
        buttonsInDOM = document.querySelectorAll("cta > .buttons_container > input");
        console.log(ctaFormInputsInDOM);
        return new Promise(resolve => {
            document.querySelector("cta > .buttons_container input[value='Submit']").addEventListener('click', async event => {
                // Parse form html to obj
                for (const input of ctaFormInputsInDOM) {
                    formItem = formObj[input.id]
                    if (formItem.required == true && input.value.trim() == "") {
                        document.querySelector("cta .error_message").innerHTML = `'${formItem.display}' Can't be empty`;
                        return false;
                    }

                    if (formItem.type != typeof input.value && isNaN(Number(input.value))) {
                        document.querySelector("cta .error_message").innerHTML = `'${formItem.display}' must be a ${typeof (formItem.type)}`;
                        return false;
                    }
                    formItem.value = input.value
                }
                X.overlay.remove()
                resolve(formObj);
                console.log(formObj);

            })
            document.querySelector("cta > .buttons_container input[value='Cancel']").addEventListener('click', async event => {

                X.overlay.remove()
                resolve(false);

            });

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


    topBar: {

        hide: function () {
            topBar.style.display = "none"
        },

        show: function () {
            topBar.style.display = ""
        },

        setColor: function (color = "") {
            topBar.style.backgroundColor = color
            topBar.style.borderColor = color
        },

        showWrappers: function (left = true, middle = true, right = true) {
            topBar.querySelector(".left_wrapper").style.visibility = (!left && "hidden") || ""
            topBar.querySelector(".middle_wrapper").style.visibility = (!middle && "hidden") || ""
            topBar.querySelector(".right_wrapper").style.visibility = (!right && "hidden") || ""
        },
    },

    screen: {
        set: function (screenName) {
            let availableScreens = ["loginScreen", "lockScreen", "desktop"];

            if (!availableScreens.includes(screenName))
                return;

            mainContent.innerHTML = screens[screenName].html
            X.status.screen = screenName;
            this[screenName].init()

        },

        loginScreen: {
            init: function () {
                X.topBar.showWrappers(0, 1, 1);
                X.topBar.setColor('transparent')
                system.activeUser = "";
                this.showAccounts()
            },

            setActive: function (selector) {

                mainContent.querySelectorAll(".login_screen > *").forEach(x => {
                    x.style.display = 'none'
                });
                mainContent.querySelector('#login_background').style.display = ''
                mainContent.querySelector(selector).style.display = ''

            },

            showAccounts: function () {
                this.setActive(".center_container")
                mainContent.querySelector('.account_container').innerHTML = ""
                let loginAccountsHTML = Object.values(system.accounts).map(x => {
                    if (x.username != "root")
                        return `
                    <div class='account_content' onclick="X.screen.loginScreen.showLoginForm('${x.username}')">
                        <user_icon></user_icon>
                        <span>${x.username}</span>
                    </div>
            `}).join('')

                mainContent.querySelector('.account_container').insertAdjacentHTML('afterbegin', loginAccountsHTML)
            },

            showLoginForm: function (username) {
                this.setActive("#loginForm")
                let loginForm = mainContent.querySelector('#loginForm')
                loginForm.querySelector('#loginUserName').innerHTML = username
                loginForm.reset()
                loginForm.querySelector('input').classList.remove('incorrectLogin')
                loginForm.querySelector('input').focus()
                loginForm.addEventListener('submit', event => {

                    event.preventDefault()

                    let formData = new FormData(loginForm);

                    // In future (maybe 0.5) there will be a nice token based permission system.
                    // as for now. you get logged in by X.
                    // But actually X should be just an extension of the system
                    // And the system should be the one allowing you to log in,
                    // and managing what you can or can not do with it.

                    if (system.validatePassword(username, formData.get('password'))) {
                        X.screen.set('desktop')
                        system.activeUser = username;
                        Object.entries(system.accounts[username].settings).forEach(x => {
                            let [itemName, itemProperties] = [x[0], x[1]]
                            if (isObject(itemProperties)) {
                                switch (itemProperties.type) {
                                    case "cssVar":
                                        root.style.setProperty('--' + itemProperties.variable, itemProperties.value);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                        return;
                    }
                    inputEl = loginForm.querySelector('input')
                    loginForm.querySelector('input').classList.remove('incorrectLogin')
                    void loginForm.querySelector('input').offsetWidth; //IDK. makes the animation reset work tho.
                    loginForm.querySelector('input').classList.add('incorrectLogin')
                })

            },

            showCustomLoginForm: function () {
                this.setActive('#customLoginForm')
                let customLoginForm = mainContent.querySelector('#customLoginForm')
                customLoginForm.reset()
                customLoginForm.querySelector('input').focus()
                customLoginForm.addEventListener('submit', event => {
                    event.preventDefault()
                    let formData = new FormData(customLoginForm);
                    let username = formData.get('username')

                    this.showLoginForm(username)

                });
            }
        },

        lockScreen: {
            init: function () {
                X.topBar.showWrappers(0, 0, 1);
                X.topBar.setColor('transparent')
            }
        },

        desktop: {
            init: function () {
                X.topBar.showWrappers(1, 1, 1);
                X.topBar.setColor('');

                desktop = document.querySelector("#mainContent > #desktop");
                popupNotificationContainer = document.querySelector("#mainContent > #popupNotificationsContainer");
                appsContainer = document.querySelector("#mainContent > #appsContainer");
                appList = document.querySelector("#mainContent > #appList");

            }
        }
    },

    //initializes the X object 
    initialize: function () {

        root = document.documentElement

        linux = document.querySelector("#linuxRoot");
        topBar = document.querySelector("#linuxRoot> #topBar");
        //Main Linux interface Content
        mainContent = document.querySelector("#mainContent")

        systemMenuContainer = document.querySelector("#overlayContainer > #systemMenuContainer");
        systemExitAnimationMenuContainer = document.querySelector("#overlayContainer > #systemMenuAnimationContainer");

        overlayContainer = document.querySelector("body > #overlayContainer");

        X.screen.set("lockScreen")
        // X.screen.set("loginScreen")

        X.services.clock.update.add(document.querySelector('#topBarDateTime'), "month>str date time-s")
        X.notification.create('', '', '', '', '', false)
        X.notification.create("Virus Alert", "Your computer has a virus", "X.cta('JK','No virus here...')", "./img/network.svg", true, false)


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
            elementQuery: "",
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
                            menuUIData.changeBorder && (menuUIData.toggleElement.classList.add("selected-topBar"));
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
    },
    //Clear all open menus.
    clearOpenMenus: function (forcefully = false) {
        if (X.openMenus.length != 0 || forcefully) {
            X.openMenus.forEach(openMenu => {
                X.menus[openMenu].toggleElement.classList.remove('selected-topBar');

                //If there is a exitAnimation then play it and remove the element
                if (X.menus[openMenu].elementQuery && X.menus[openMenu].exitAnimation) {
                    let element = document.querySelector(X.menus[openMenu].elementQuery);
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
            systemMenuContainer.innerHTML = "";
        }
    },
    //Creates a menu.....
    createMenu: function (menuUIData, x, y) {
        let elHTML = menuUIData.getHTML(x, y);
        let elTag = menuUIData.elementQuery;
        systemMenuContainer.insertAdjacentHTML("beforeend", elHTML) //Add the objects html to the DOM.

        if (menuUIData.createOnMousePosition) {
            let el = systemMenuContainer.querySelector(elTag)

            // Correct the menu position if the part of it appears outside the screen
            x = x > window.innerWidth - el.offsetWidth ? window.innerWidth - el.offsetWidth : x
            y = y > window.innerHeight - (el.offsetHeight + appList.offsetHeight) ? window.innerHeight - (el.offsetHeight + appList.offsetHeight + 1) : y
            el.style.top = y + 'px'
            el.style.left = x + 'px'

        }

        if (menuUIData.elementQuery != "" && menuUIData.enterAnimation != "") {
            //If there is a enterAnimation then append it
            let element = systemMenuContainer.querySelector(menuUIData.elementQuery);
            element.classList.add(menuUIData.enterAnimation);
        }

    }
}


