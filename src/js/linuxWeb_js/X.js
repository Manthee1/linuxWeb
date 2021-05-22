X = {
    menus: {
        contextMenu: {
            //Menu options
            menuName: "contextMenu",
            createOnMousePosition: true,
            correctionType: 0,
            listenerType: "contextmenu",
            toggleElement: null,
            recreateBehaviour: "recreate",
            changeBorder: false,
            preventDefault: true,
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 100, //ms 
            elementQuery: "#context_menu",

            getHTML: function (x = 100, y = 100) {
                return ``;
            },
            // Close the menu when the condition returns true
            closeCondition: function (event) {
                return event.target.id != "context_menu"
            },
        },
        activities: {
            menuName: "activities",
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
					<div class="search_results_container"></div>
                    <div class="open_apps_preview_container"></div>
                    <div class='favorites'>
                    
					${// Parses the apps into html
                    Object.entries(apps).map(x => {
                        let appIcon = x[0][0];
                        if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                        else if (x[1].name != undefined) appIcon = `<span>${x[1].name[0]}</span>`;
                        return `<button class='app' onclick="X.clearOpenMenus();processes.create('${x[0]}');" --data-tooltip="${x[1].name}" >${appIcon}</button>`
                    }).join('')}
			        </div>
				</div>`
                return html;
            },

            closeCondition: function (event) {
                return event.target == document.querySelector("#activitiesMenuContainer")
            },

            onCreate: function () {
                //Focuses the input
                const inputElement = systemMenuContainer.querySelector(".app_search > input")
                inputElement.focus()
                // Searches the apps every time you "input". and then spits out matches, if any
                inputElement.addEventListener('input', event => {
                    searchResultHtml = X.activities.requestResults(inputElement.value)
                    if (isTextEmpty(inputElement.value)) overlayContainer.querySelector('.open_apps_preview_container').style.display = ''
                    else overlayContainer.querySelector('.open_apps_preview_container').style.display = 'none'
                    systemMenuContainer.querySelector('.search_results_container').innerHTML = searchResultHtml
                });
                //Makes the app Search result navigable with the keyboard
                let focusedChildIndex = 0
                systemMenuContainer.querySelector('#activitiesMenuContainer').addEventListener('keydown', event => {
                    const appSearchResultElement = systemMenuContainer.querySelector('.search_results_container')
                    const ignoreKeys = "ArrowRight ArrowLeft Tab Enter Escape"

                    if (event.key == "Escape") { X.clearOpenMenus(); return; }

                    if (event.key.startsWith("Arrow")) {
                        if (event.key == "ArrowRight" && appSearchResultElement.querySelectorAll('.app').length - 1 > focusedChildIndex) focusedChildIndex++
                        if (event.key == "ArrowLeft" && focusedChildIndex > 0) focusedChildIndex--
                        appSearchResultElement.querySelectorAll('.app')[focusedChildIndex].focus()
                    }

                    //When a key is typed, the input is refocused so the key is inputted into it and then we focus to the app results, if any.
                    if (!ignoreKeys.split(' ').includes(event.key)) {
                        inputElement.focus()
                        focusedChildIndex = 0
                        isDefined(appSearchResultElement.querySelector('.app')) &&
                            setTimeout(() => {
                                appSearchResultElement.querySelector('.app').focus()
                            }, 10);
                    }
                })

                appsContainer.style.display = "none"
                if (!isTextEmpty(appsContainer.innerHTML)) {
                    // If there are an any open apps it can display in the "preview" then it clears their listeners so they don't act like they're functional.
                    // In the future this will be reworked so that the app's html is not cloned but instead maybe a "screenshot" of its live preview is shown.
                    overlayContainer.querySelector('.open_apps_preview_container').innerHTML = appsContainer.innerHTML
                    overlayContainer.querySelectorAll('.open_apps_preview_container > app_container').forEach(x => {
                        x.removeAttribute('onmousedown')
                        x.addEventListener('mousedown', event => {
                            event.preventDefault()
                            event.stopPropagation()
                            X.clearOpenMenus()
                            processes.bringToTop(processes.pid[processes.getNumberPid(x.id)].getProcessElement())
                        })
                    })
                }
            },
            onClose: function () {
                appsContainer.style.display = ""
                overlayContainer.querySelector('.open_apps_preview_container').innerHTML = ""
            }

        },
        notificationPanel: {
            menuName: "notificationPanel",
            listenerType: "click",
            toggleElement: document.querySelector("#topBarDateTime"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementQuery: "#notificationPanelContainer",

            // Parses the notifications... yeah
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
            closeCondition: function (event) {
                return X.screen.activeScreen == "desktop" || X.screen.activeScreen == "loginScreen";
            },
            getHTML: function () {
                // Returns different html for the desktop and loginScreen if they're active.
                switch (X.screen.activeScreen) {
                    case "desktop":

                        const reminderForm = {
                            message: { display: "Message", value: "", type: 'string', required: true },
                            time: { display: "Remind At", value: 0, type: 'number', required: true },
                        }

                        const onclick = `(async()=>{reminder = await X.ctaform("Create Reminder", ${JSON.stringify(reminderForm)});
                command = "remind " + reminder.message.value + " -t " + reminder.time.value;
                system.cli.i(command, true)})()`

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

                    case "loginScreen":
                        return `<div id='notificationPanelContainer'>
                        <calendar_container>
                            <div class='calendar_wrapper'>
                                ${X.calendar.getHTML()}
                            </div>
                        </calendar_container>
                    </div>`;

                    default:
                        break;
                }
            },
            closeCondition: function (event) {
                return !elementIsInEventPath(event, document.querySelector("#notificationPanelContainer")) || (tagIsInEventPath(event, "NOTIFICATION") && event.target.tagName != "X_ICON");
            }
        },
        statusArea: {
            menuName: "statusArea",
            listenerType: "click",
            toggleElement: document.querySelector("#statusAreaButton"),
            enterAnimation: "bottomFadeIn",
            exitAnimation: "bottomFadeOut",
            exitAnimationTime: 200, //ms
            elementQuery: "#statusAreaContainer",
            getHTML: function () {

                switch (X.screen.activeScreen) {
                    case "loginScreen":
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
                    case "lockScreen":
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
                    case "desktop":
                        return `<div id='statusAreaContainer'>
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
                    <li onclick="X.screen.set('lockScreen')"><padlock_icon></padlock_icon><span>Lock</span></li>
                    <div class='dropdown_item' onclick='X.general.dropdown.toggle(this)'>
                    <li><power_off_icon></power_off_icon><span>Power Off / Log Out</span><down_icon></down_icon></li>
                    <dropdown>
                        <li onclick='X.restart();'><span>Restart</span></li>
                        <li onclick='X.shutdown();'><span>Power Off</span></li>
                        <hr>
                        <li onclick='X.logout();'><span>Log Out</span></li>
                    </dropdown>
                    </div>
                    </div>`;
                    default:
                        break;
                }

            },
            closeCondition: function (event) {
                return !elementIsInEventPath(event, document.querySelector("#statusAreaContainer"))
            },
        },
        taskSwitcher: {
            //Menu options
            menuName: "taskSwitcher",
            createOnMousePosition: false,
            recreateBehaviour: "no",
            changeBorder: false,
            preventDefault: false,
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 100, //ms 
            elementQuery: "#taskSwitcher",

            getHTML: function () {
                let ret = ""
                //Parse the apps container into html
                Object.values(appsContainer.querySelectorAll('app_container')).map(app => {
                    app = processes.pid[processes.getNumberPid(app.id)]
                    let appName = app.appName
                    let appIcon = apps[appName][0];
                    if (apps[appName].icon != undefined) appIcon = `<img src='${apps[appName].icon}'>`;
                    else if (apps[appName].name != undefined) appIcon = `<span>${apps[appName].name[0]}</span>`;
                    ret = `<button class='app' data-appPid="${app.id}" onclick="X.clearOpenMenus()"><div class='iconWrapper'>${appIcon}</div><span class='app_name'>${app.title}</span></button>` + ret
                }).join('')
                return `<div id="taskSwitcher">${ret}</div>`
            },
            onCreate: function () {
                //Focus the second taskSwitcher app instance
                setTimeout(() => {
                    document.querySelectorAll(this.elementQuery + "> .app")[1].focus()
                }, 1);
                const numberOfChildren = processes.getPidObject().length;
                let focusedChildIndex = 1;
                //Keyboard navigation for the taskList.
                document.querySelector(this.elementQuery).addEventListener('keydown', event => {
                    if ((event.key == "ArrowRight" || event.key == "Tab")) ++focusedChildIndex && numberOfChildren <= focusedChildIndex && (focusedChildIndex = 0);
                    if (event.key == "ArrowLeft") --focusedChildIndex && focusedChildIndex < 0 && (focusedChildIndex = numberOfChildren - 1)
                    setTimeout(() => {
                        document.querySelectorAll(this.elementQuery + " > .app")[focusedChildIndex].focus()
                    }, 10);
                })
                // if shift is released focus on the selected app
                document.querySelector(this.elementQuery).addEventListener('keyup', event => {
                    if (event.key.includes("Shift")) {
                        let appPid = document.querySelectorAll(this.elementQuery + " > .app")[focusedChildIndex].getAttribute('data-appPid')
                        processes.bringToTop(processes.pid[appPid].getProcessElement())
                        X.clearOpenMenus()
                    }
                })
            },
            createCondition: function (event) {
                console.log(event);
                return event.shiftKey && event.key == "Tab" && processes.getPidObject().length > 1
            },
            // Close the menu when the condition returns true
            closeCondition: function (event) {
                return true
            },
        },
    },

    //Activities menu thing
    activities: {
        indexedApps: [],
        requestResults: function (searchQuery) {
            //Searches the apps for a keyword and returns the html result
            // Should probably put the indexer, search and parse into separate functions
            if (isTextEmpty(searchQuery)) return ""
            searchQuery = searchQuery.toLowerCase()

            let ret = ""
            const propertiesToIndex = ["name", "description"]
            //Indexed the apps properties.
            if (this.indexedApps == 0)
                Object.entries(apps).forEach(x => {
                    const appName = x[0]
                    const appProperties = x[1]
                    this.indexedApps.push([appName, propertiesToIndex.map(property => { return (isDefined(appProperties[property]) && (appProperties[property].toLowerCase() + " ")) || "" }).join('')])
                })

            //Searches the indexed apps and parsed the matches
            this.indexedApps.forEach(x => {
                const appName = x[0]
                const appHaystack = x[1]

                if (appHaystack.includes(searchQuery)) {
                    let appIcon = apps[appName][0];
                    if (apps[appName].icon != undefined) appIcon = `<img src='${apps[appName].icon}'>`;
                    else if (apps[appName].name != undefined) appIcon = `<span>${apps[appName].name[0]}</span>`;
                    ret += `<button class='app' onclick="X.clearOpenMenus();processes.create('${appName}');" --data-tooltip="${x[1].description}" ><div class='iconWrapper'>${appIcon}</div><span class='app_name'>${apps[appName].name}</span></button>`
                }
            })
            return ret;
        }
    },
    contextMenu: {
        //Adds a custom context menu listener for a specified element
        add: function (element, layout, cacheListener = true) {
            let contextMenuInnerHTML = ""

            for (const item of layout) {
                //If the item is: "", than we assume its a separator 
                if (isTextEmpty(item[0])) {
                    contextMenuInnerHTML += "<hr>"
                    continue;
                }

                if (Array.isArray(item[1])) { // If the item is an Array than we parse it as a sub menu
                    contextMenuInnerHTML += `<span class="context_sub_menu_header">${item[0]}</span>
                    <div class='context_sub_menu'>`;
                    for (const subitem of item[1]) {
                        contextMenuInnerHTML += `<span onclick="${subitem[1]}">${subitem[0]}</span>`;
                    }
                    contextMenuInnerHTML += "</div>";
                    continue;
                }
                //  else we just parse it a s a normal clickable item
                contextMenuInnerHTML += `<span onclick="${item[1]}">${item[0]}</span>`
            }
            contextMenuEventHandler = event => {
                //Event handler for the context menu.
                // Created the menu with the parsed contextMenu Html
                let menuUIData = X.menus.contextMenu
                menuUIData.getHTML = () => `<div id='context_menu' class='fadeIn' style="top: ${event.clientY}px;left: ${event.clientX}px;">${contextMenuInnerHTML}</div>`
                X.createMenu(X.menus.contextMenu, event.clientX, event.clientY, event)
            }
            // If cacheListener is true. Cache the listener.
            if (cacheListener) X.addEventListener(element, 'contextmenu', contextMenuEventHandler)
            else element.addEventListener('contextmenu', contextMenuEventHandler)
        }
    },

    //The notification handler
    notification: {
        notifications: {},
        get: function () {
            if (isObjectEmpty(this.notifications)) return false
            return this.notifications;
        },
        create: function (title = "", description = "", clickAction = "", iconPath = "", persistent = false, alert = true) {
            //Declares some values
            title = title || "Notification";
            description = description || "This is a default notification";
            iconPath = iconPath || "./img/about.svg";
            let type = typeof persistent != "boolean" ? false : persistent; //'persistent', 'temporary' : false, true
            clickAction = clickAction || "";
            let id = Object.entries(this.notifications).length == 0 ? 0 : Number(Object.keys(this.notifications).sort().slice(-1)) + 1
            //Creates a popup notification when condition is true.
            if (alert && !system.global.doNotDisturb) {
                const notificationHTML = `<div onclick="${clickAction}; this.style.display = 'none'" ><title>${title}</title><description>${description}</description></div>`;
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
            //Saves the notification
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
        removeAll: function () { // Removes all non persistent notifications
            for (x of Object.entries(X.notification.notifications)) {
                if (x[1].type == false) delete X.notification.notifications[x[0]]
            }
        }
    },

    calendar: {
        getHTML: function () {
            //Does a lot of parsing, and returns the calendar html
            let htmlOut =
                `<div class='calendar'><month>${date.get('month>full date year')}</month><div class='calendar_content'>
                    <week_days><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></week_days>
                    <dates>`
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
            // A lot of Date stuff.
            // All in all it just makes a calendar Array.
            let ret = [];
            year = year || date.get("year");
            month = month || date.get("month");
            const monthFirstDay = new Date(`${year}/${month}/1`)
            let monthLastDay = new Date(monthFirstDay)
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
            //Adds a prefix to last and next month. SO the parser knows to separate them
            if (notMonthDatePrefix) {
                previousMonthDateRange = previousMonthDateRange.map(x => { return "-" + x });
                nextMonthDateRange = nextMonthDateRange.map(x => { return "-" + x });
            }
            //Adds a prefix to the current day. so the parser knows which one to select
            if (currentDatePrefix) {
                const day = Number(date.get('date'))
                currentMonthDateRange[day - 1] = "&" + currentMonthDateRange[day - 1]
            }
            // Adds akk the selections together
            let calendarDates = [].concat(
                previousMonthDateRange,
                currentMonthDateRange,
                nextMonthDateRange,
            ).slice(0, 42).map(x => { x = String(x); return x.length == 1 ? '0' + x : x })
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
                        this.update.updateElements.forEach(x => {
                            x.element.innerHTML = date.get(x.options);
                        });
                        console.log("Time updated. Next one in: ", 60 - new Date().getSeconds());
                    }, (60 - new Date().getSeconds()) * 1000);
                }, (60 - new Date().getSeconds()) * 1000); // Makes sure the update is synchronized
            },

            update: {
                //updateElements stores the elements and their options eg. 0:{element,options}
                updateElements: [],
                //add Adds a new element to the object
                add: function (element, options) {
                    for (const x of this.updateElements) {
                        if (x.element == element) return false
                    }
                    const newObj = { element: element, options: options }
                    this.updateElements.push(newObj)
                    this.updateNow(element, options)

                },
                //remove Removes a existing element from the object
                remove: function (element) {
                    for (const x of this.updateElements) {
                        if (x.element == element) {
                            delete x
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
            //Simple volume update function
            update: function () {
                let img;
                const volume = system.global.volume;

                if (volume > 66) img = "url('./img/volume/high.svg')";
                else if (volume > 33) img = "url('./img/volume/medium.svg')";
                else if (volume > 0) img = "url('./img/volume/low.svg')";
                else img = "url('./img/volume/mute.svg')";

                document.querySelectorAll('volume_icon').forEach(x => x.style.backgroundImage = img)
            }

        },
        keyboardShortcutHandler: {
            //Shortcuts can inly have one final key and any combination of Ctrl, shift and alt.
            shortcutsUnparsed: [
                ["Shift Tab", (event) => { event.preventDefault(); X.createMenu(X.menus.taskSwitcher, null, null, event) }],
                ["Shift q", (event) => { event.preventDefault(); X.createMenu(X.menus.activities, null, null, event) }],
            ],
            shortcuts: {},
            onStart: function () {
                this.shortcutsUnparsed.forEach(x => {
                    let shortcutKeyCombination = ""
                    let shortcutKeys = x[0].toLowerCase().split(' ');
                    const finalKey = shortcutKeys.pop(-1)
                    shortcutKeys = shortcutKeys.join(' ')
                    if (shortcutKeys.includes('ctrl')) shortcutKeyCombination += 'ctrl'
                    if (shortcutKeys.includes('shift')) shortcutKeyCombination += 'shift'
                    if (shortcutKeys.includes('alt')) shortcutKeyCombination += 'alt'
                    this.shortcuts[shortcutKeyCombination + " " + finalKey] = x[1]
                })

                document.addEventListener('keydown', event => {
                    let shortcutKeyCombination = ""
                    const eventKey = event.key.toLowerCase()
                    if (event.ctrlKey && eventKey != 'control') shortcutKeyCombination += 'ctrl'
                    if (event.shiftKey && eventKey != 'shift') shortcutKeyCombination += 'shift'
                    if (event.altKey && eventKey != 'alt') shortcutKeyCombination += 'alt'
                    shortcutKeyCombination += " " + eventKey
                    if (isFunction(this.shortcuts[shortcutKeyCombination])) {
                        this.shortcuts[shortcutKeyCombination](event)
                    }
                })

            }

        },
    },

    general: {
        dropdown: {
            //Dropdown handler...
            toggle: (element) => {
                // TODO: Rewrite this
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
            X.clearOpenMenus()
            overlayContainer.querySelector('.general').innerHTML += `<div class='overlay'>${html}</div>`;
        },
        //Simply removes any element with the overlay tag
        remove: function () {
            overlayContainer.querySelectorAll('.general > div.overlay').forEach(x => x.remove())
        }
    },


    // TODO: Combine the ctaform and cta obj.
    cta: function (title = "cta title :)", message = "This is a generic cta message", buttons = [["OK", true]]) {
        //Has to be invoked with await to work correctly

        // buttons: {["buttonText","returnValue"],["Cancel",false]}
        // returnValue is what will be return when the user clicks that button.
        if (buttons == [] || typeof buttons != 'object') return false;
        if (typeof buttons[0] != "object") buttons = [...buttons];
        // Parses the buttons int an array
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
        const buttonsInDOM = document.querySelectorAll("cta > .buttons_container > input");
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

        //Parse the formObj
        for (const item of Object.entries(formObj)) {
            const itemName = item[0]
            const itemContent = item[1]

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
        const ctaFormInputsInDOM = document.querySelectorAll("cta > form input");
        //Add the form to the overlay, add event listeners for buttons.
        return new Promise(resolve => {// Promise a response so that we cak await when the user responds to the cta
            document.querySelector("cta > .buttons_container input[value='Submit']").addEventListener('click', async event => {
                // Parse form html to obj
                for (const input of ctaFormInputsInDOM) {
                    const formItem = formObj[input.id]
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


    //Topbar manipulation.
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

    //Caches the desktop session when switching user
    cacheSession: function () {
        let sessionStateCache = system.accounts[system.activeUser].sessionStateCache
        sessionStateCache.desktopHTML = mainContent.innerHTML
        sessionStateCache.runningProcesses = processes.pid
        sessionStateCache.notifications = X.notification.notifications
        processes.pid = {}
        X.notification.notifications = {}
        activeEventListenersCache = system.accounts[system.activeUser].sessionStateCache.activeEventListeners
        if (isDefined(activeEventListenersCache))
            for (const listener of system.accounts[system.activeUser].sessionStateCache.activeEventListeners) {
                listener.element.removeEventListener(listener.event, listener.callback)
            }
        else system.accounts[system.activeUser].sessionStateCache.activeEventListeners = []
    },

    screen: {
        activeSubScreen: "",
        activeScreen: "",
        activeEventListeners: [],
        // Set to a screen
        set: function (screenName) {
            let availableScreens = ["loginScreen", "lockScreen", "desktop"];

            if (!availableScreens.includes(screenName))
                return;

            X.clearOpenMenus()
            //Cache the desktop  user session when sing off
            if (this.activeScreen == "desktop" && screenName != "desktop")
                X.cacheSession()
            // Remove all event screen specific listeners
            for (const listener of this.activeEventListeners) {
                listener.element.removeEventListener(listener.type, listener.callback)
            }
            //Load the screen html into mainContent
            mainContent.innerHTML = screens[screenName].html
            this.activeScreen = screenName
            this.activeSubScreen = ""
            this[screenName].init() // Initialize the screen's functions

        },

        setActiveSubScreen: function (selector) {
            // Hides all mainContent and show the specified element selector.
            mainContent.querySelectorAll(".login-lock_screen > *").forEach(x => {
                x.style.display = 'none'
            });
            mainContent.querySelectorAll('.ignore_hide').forEach(x => x.style.display = '')
            mainContent.querySelector(selector).style.display = ''
            this.activeSubScreen = selector
        },
        // Set an img element as a picture element with a picture.`
        setToUserProfilePicture: function (element, pictureUrl) {
            if (isDefined(pictureUrl)) {
                element.style.backgroundImage = `url('${pictureUrl}')`
                element.classList.add('custom_picture')
                return;
            }
            element.style.backgroundImage = ""
            element.classList.remove('custom_picture')
        },

        addEventListener: function (element, type, callback) {
            this.activeEventListeners.push({ element: element, type: type, callback: callback })
            element.addEventListener(type, callback)
        },

        loginUser: function (username, password) {
            // In future (maybe 0.5) there will be a nice token based permission system.
            // as for now. you get logged in by X.
            // But actually X should be just an extension of the system
            // And the system should be the one allowing you to log in,
            // and managing what you can or can not do with it.
            if (system.validatePassword(username, password)) {
                system.activeUser = username;
                Object.entries(system.accounts[username].settings).forEach(x => {
                    let [itemName, itemProperties] = [x[0], x[1]]
                    // Initializes the personal user settings
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
            }
            X.screen.set('desktop') // Changes the screen
        },

        loginScreen: {
            init: function () {
                //Initializes the loginScreen.
                X.topBar.showWrappers(0, 1, 1);
                X.topBar.setColor('transparent')
                system.activeUser = ""; // clears the active user
                root.style = "" //Removes the user set css style variables
                mainContent.querySelectorAll('.back_button').forEach(x => x.addEventListener('click', event => X.screen.loginScreen.showAccounts()))
                mainContent.querySelector('.center_container > button').addEventListener('click', event => X.screen.loginScreen.showCustomLoginForm())
                this.showAccounts()
            },

            showAccounts: function () {
                //Parses the accounts into html
                X.screen.setActiveSubScreen(".center_container")
                mainContent.querySelector('.account_container').innerHTML = ""
                let loginAccountsHTML = Object.values(system.accounts).map(x => {
                    // Don't parse root
                    if (x.username != "root") return `
                    <button class='account_content' onclick="X.screen.loginScreen.showLoginForm('${x.username}')">
                        <user_icon ${(isDefined(x.settings.profilePictureUrl) && `style="background-image:url('${x.settings.profilePictureUrl}')" class="custom_picture"`) || ''}></user_icon>
                        <span>${x.username}</span>
                    </button>
            `}).join('')
                //Insert the html and focus to the first account button
                mainContent.querySelector('.account_container').insertAdjacentHTML('afterbegin', loginAccountsHTML)
                mainContent.querySelector('.account_content').focus()
            },

            showLoginForm: function (username) { // Show the login form for a user
                if (isTextEmpty(system.accounts[username].encPassword)) { // If the user has no password then just login
                    X.screen.loginUser(username, "")
                    return;
                }
                X.screen.setActiveSubScreen("#loginForm")

                //Change the login picture and name to the user account
                const loginForm = mainContent.querySelector('#loginForm')
                loginForm.querySelector('#loginUserName').innerHTML = username
                X.screen.setToUserProfilePicture(loginForm.querySelector('user_icon'), system.accounts[username].settings.profilePictureUrl)
                loginForm.reset() // Clears the loginForm

                //Clears the incorrectLogin class and focuses the password input
                const inputEl = loginForm.querySelector('input')
                inputEl.classList.remove('incorrectLogin')
                inputEl.focus()
                loginForm.addEventListener('submit', event => {
                    event.preventDefault()

                    //Checks if the inputted password is correct. if it is then it logs the person in
                    let formData = new FormData(loginForm);
                    if (system.validatePassword(username, formData.get('password'))) {
                        X.screen.loginUser(username, formData.get('password'))
                        return;
                    }
                    //Else it plays the incorrect login animation
                    inputEl.classList.remove('incorrectLogin')
                    void inputEl.offsetWidth; //IDK. makes the animation reset work tho.
                    inputEl.classList.add('incorrectLogin')
                })
            },

            showCustomLoginForm: function () {
                // Same as showLoginForm, but instead of the password you are inputting a username
                X.screen.setActiveSubScreen('#customLoginForm')
                const customLoginForm = mainContent.querySelector('#customLoginForm')
                customLoginForm.reset()
                customLoginForm.querySelector('input').focus()
                customLoginForm.addEventListener('submit', event => {
                    event.preventDefault()
                    const formData = new FormData(customLoginForm);
                    const username = formData.get('username')

                    this.showLoginForm(username)

                });
            }
        },



        lockScreen: {
            pauseElementChange: false,
            init: function () {
                X.topBar.showWrappers(0, 0, 1);
                X.topBar.setColor('transparent')

                this.time = mainContent.querySelector('#loginTime > time')
                this.date = mainContent.querySelector('#loginTime > date')

                //Adds the elements to the clock service
                X.services.clock.update.add(this.time, 'time-s');
                X.services.clock.update.add(this.date, 'day>str month>str date');

                //Element references
                this.loginForm = mainContent.querySelector('#loginForm')
                this.loginTime = mainContent.querySelector('#loginTime')
                let loginForm = this.loginForm
                let loginTime = this.loginTime
                let inputEl = loginForm.querySelector('input')

                loginTime.classList.add('selected') // Selects the loginTime on Default

                if (isTextEmpty(system.accounts[system.activeUser].encPassword)) // If the user has no password then we show the switch user button
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(1)'

                X.screen.setToUserProfilePicture(loginForm.querySelector('user_icon'), system.accounts[system.activeUser].settings.profilePictureUrl)

                mainContent.querySelector('.login-lock_screen').addEventListener('mouseup', event => {//Onclick we toggle change the selected sunscreen
                    if (loginTime.classList.contains('selected')) this.showLoginForm()
                })
                X.screen.addEventListener(document, 'keyup', event => { // The selected sunscreen gets changed on key up as well. But with escape doing stuff
                    if (loginTime.classList.contains('selected')) return this.showLoginForm()
                    if (event.key == "Escape") this.showTime()
                });
                //Change to lockscreen when the switch user button is clicked
                mainContent.querySelector(".switch_user_button").addEventListener('click', event => X.screen.set('loginScreen'))

                // Resets the login form a nd focuses it
                loginForm.querySelector('#loginUserName').innerHTML = system.activeUser
                loginForm.reset()
                inputEl.classList.remove('incorrectLogin')
                inputEl.focus()

                loginForm.addEventListener('submit', event => {
                    event.preventDefault()
                    // Logs the person if good password.
                    let formData = new FormData(loginForm);
                    if (system.validatePassword(system.activeUser, formData.get('password'))) {
                        X.screen.loginUser(system.activeUser, formData.get('password'))
                        return;
                    }
                    //Bad password animation
                    inputEl.classList.remove('incorrectLogin')
                    void inputEl.offsetWidth; //IDK. makes the animation reset work tho.
                    inputEl.classList.add('incorrectLogin')
                })

            },

            enablePauseElementChange: function () {
                // Delay for when the selected sunscreen change
                this.pauseElementChange = true
                setTimeout(() => { this.pauseElementChange = false }, 500)
            },

            showTime: function () {

                if (!this.pauseElementChange) {// If element change is not paused, than the Time is shown
                    this.enablePauseElementChange()
                    this.loginTime.classList.add('selected')
                    this.loginForm.classList.remove('selected')
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(0)'
                }
            },

            showLoginForm: function () {
                if (isTextEmpty(system.accounts[system.activeUser].encPassword)) { //If the user has no password, switch animation played and the user is logged in
                    setTimeout(() => {
                        if (X.screen.activeScreen != "lockScreen")
                            return; //If The screen changed(mainly because of the switch user button). Don't change it to desktop
                        X.screen.loginUser(system.accounts[system.activeUser], "")
                    }, 500);
                    this.loginForm.style.display = "none"
                }
                if (!this.pauseElementChange) {// Change to the Login form
                    this.enablePauseElementChange()
                    this.loginTime.classList.remove('selected')
                    this.loginForm.classList.add('selected')
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(1)'
                    //The timeout makes the focus work
                    setTimeout(() => {
                        this.loginForm.querySelector('input').focus()
                    }, 100);
                }
            },
        },

        desktop: {
            init: function () {
                X.topBar.showWrappers(1, 1, 1);
                X.topBar.setColor('');
                //Initialize the user cache and clear it.
                if (!isObjectEmpty(system.accounts[system.activeUser].sessionStateCache)) {
                    let sessionStateCache = system.accounts[system.activeUser].sessionStateCache
                    mainContent.innerHTML = sessionStateCache.desktopHTML
                    processes.pid = sessionStateCache.runningProcesses
                    X.notification.notifications = sessionStateCache.notifications
                    for (const listener of system.accounts[system.activeUser].sessionStateCache.activeEventListeners) {
                        listener.element.addEventListener(listener.event, listener.callback)
                    }
                    sessionStateCache = {}
                }

                // References for elements
                desktop = document.querySelector("#mainContent > #desktop");
                popupNotificationContainer = document.querySelector("#mainContent > #popupNotificationsContainer");
                appsContainer = document.querySelector("#mainContent > #appsContainer");
                appList = document.querySelector("#mainContent > #appList");

                //Initialize the desktop context menu
                X.contextMenu.add(desktop, [
                    ["Change Background", "X.cta('Unavailable','This feature is not yet implemented',[['Sad Face :(']])"],
                    [""],
                    ["Terminal", "processes.create('terminal')"],
                    ["Settings", "processes.create('settings')"],
                ], false)
            }
        }
    },

    //initializes the X object 
    initialize: function () {

        // Element References
        root = document.documentElement

        linux = document.querySelector("#linuxRoot");
        topBar = document.querySelector("#linuxRoot> #topBar");
        //Main Linux interface Content
        mainContent = document.querySelector("#mainContent")

        systemMenuContainer = document.querySelector("#overlayContainer > #systemOverlays #systemMenuContainer");
        systemExitAnimationMenuContainer = document.querySelector("#overlayContainer > #systemOverlays #systemMenuAnimationContainer");

        overlayContainer = document.querySelector("body > #overlayContainer");

        //Switch to login screen on Default
        X.screen.set("loginScreen")

        //Add the topBar time update
        X.services.clock.update.add(document.querySelector('#topBarDateTime'), "month>str date time-s")
        //Create dumb test notifications
        X.notification.create('', '', '', '', '', false)
        X.notification.create("Virus Alert", "Your computer has a virus", "X.cta('JK','No virus here...')", "./img/network.svg", true, false)

        //Initialize all tge services
        Object.entries(X.services).forEach(xObj => {
            let [xObjName, xObjValue] = [xObj[0], xObj[1]];
            typeof xObjValue.onStart == 'function' && xObjValue.onStart()
        })

        // Declare variables used to handel the system menus 
        X.menus.openMenuClicked = false
        // Execute all the enable() methods in the X objects
        xObjSchema = {
            createOnMousePosition: false,
            listenerType: "click",
            toggleElement: null,
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
            if (isObject(xObjValue) && isDefined(menuUIData.toggleElement) && isFunction(menuUIData.getHTML)) {
                //Adds a 'listenerType' listener for the button element that creates a menu(activities,status menu...)
                console.log(xObjName, menuUIData.listenerType, menuUIData.toggleElement);
                menuUIData.toggleElement.addEventListener(menuUIData.listenerType, event => {
                    setTimeout(() => {
                        X.createMenu(menuUIData, event.clientX, event.clientY, event)
                    }, 1);
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
        console.log("X Initialized");
    },
    //Clear all open menus.
    clearOpenMenus: function (force = false) {
        if (systemMenuContainer.childrenElementCount != 0 || force) {
            Object.values(systemMenuContainer.children).forEach(openMenuEL => {
                const openMenuName = openMenuEL.getAttribute('data-menu-name');
                if (isDefined(X.menus[openMenuName])) {
                    const openMenuUIData = X.menus[openMenuName];
                    isDefined(openMenuUIData.toggleElement) && isDefined(openMenuUIData.toggleElement.classList) && openMenuUIData.toggleElement.classList.remove('selected');
                    if (isFunction(openMenuUIData.onClose)) openMenuUIData.onClose() // Run its onClose

                    //If there is a exitAnimation then play it and remove the element
                    if (openMenuUIData.exitAnimation) {
                        systemExitAnimationMenuContainer.insertAdjacentElement('afterbegin', openMenuEL) //Move the element into animations
                        openMenuEL.classList.add(openMenuUIData.exitAnimation)
                        if (openMenuUIData.enterAnimation) openMenuEL.classList.remove(openMenuUIData.enterAnimation)
                        setTimeout(() => {
                            //Remove the element after the animation has played
                            systemExitAnimationMenuContainer.innerHTML = ""
                        }, openMenuUIData.exitAnimationTime || 200);
                    }
                }
            })
            //Clear the menus array and container
            systemMenuContainer.innerHTML = ""
        }
    },
    //Creates a menu.....
    createMenu: function (menuUIData, x = 0, y = 0, event = null) {
        if (!isFunction(menuUIData.getHTML)) return;
        if (isDefined(systemMenuContainer.querySelector(`*[data-menu-name='${menuUIData.menuName}']`) && (menuUIData.recreateBehaviour == 'no' || menuUIData.recreateBehaviour == false))) return;
        if (isDefined(systemMenuContainer.querySelector(`*[data-menu-name='${menuUIData.menuName}']`)) && menuUIData.recreateBehaviour != 'recreate') return;
        if (!((isFunction(menuUIData.createCondition) && menuUIData.createCondition(event)) || !isFunction(menuUIData.createCondition))) return;
        this.clearOpenMenus();
        const elHTML = menuUIData.getHTML(x, y);
        systemMenuContainer.insertAdjacentHTML("beforeend", elHTML) //Add the menus html to the DOM.
        const el = systemMenuContainer.lastElementChild
        el.setAttribute('data-menu-name', menuUIData.menuName)

        menuUIData.preventDefault && event.preventDefault()

        //Block the body 'onclick' from deleting the popups when you clicked on them.
        //Block if we '!want' it closed. Get it?
        systemMenuContainer.childElementCount > 0 && systemMenuContainer.lastElementChild.addEventListener('click', (event) => {
            if ((isFunction(menuUIData.closeCondition) && !menuUIData.closeCondition(event)) || !isFunction(menuUIData.closeCondition))
                X.menus.openMenuClicked = true;
        })
        menuUIData.changeBorder && (menuUIData.toggleElement.classList.add("selected"));
        isDefined(event) && isFunction(menuUIData.onCreate) && menuUIData.onCreate(event);



        if (menuUIData.createOnMousePosition) {
            //Initialize the menu at the cursor position
            const correctionType = isDefined(menuUIData.correctionType) ? menuUIData.correctionType : 0;
            [x, y] = X.correctPosition(x, y, el.offsetWidth, el.offsetHeight, correctionType);
            el.style.left = x + "px";
            el.style.top = y + "px";
        }

        if (menuUIData.elementQuery != "" && menuUIData.enterAnimation != "") {
            //If there is a enterAnimation then append it
            el.classList.add(menuUIData.enterAnimation);
        }
    },
    correctPosition: function (x, y, width, height, correctionType = 0) {

        // Correct something's position if the part of it appears outside the screen
        const appListHeight = isDefined(appList) ? appList.offsetHeight : 0
        switch (correctionType) {
            case 0:
                x = x > window.innerWidth - width ? window.innerWidth - width : x
                y = y > window.innerHeight - (height + appListHeight) ? y - height : y
                break;
            case 1:
                x = x > window.innerWidth - width ? x - width : x
                y = y > window.innerHeight - (height + appListHeight) ? y - height : y
                break;
            default:
                break;
        }
        return [x, y]
    },
    //Add an event listener to an element and cache it to the user's cache So it can be re=initialized on login.
    // Problem is that you can't remove and add the element cause it breaks the variable reference. 
    // This could be done by passing a selector instead but I don't really wanna do it that way.
    // if I don't find another way. QuerySelector parameter it is. Until then. Re-initializing listeners will not work. :(
    addEventListener: function (element, event, callback) {
        !isDefined(system.accounts[system.activeUser].sessionStateCache.activeEventListeners) && (system.accounts[system.activeUser].sessionStateCache.activeEventListeners = []);
        system.accounts[system.activeUser].sessionStateCache.activeEventListeners.push({ element: element, event: event, callback: callback })
        element.addEventListener(event, callback);
    },
}


