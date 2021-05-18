X = {
    openMenus: [],
    status: {

        screen: "lockScreen"

    },
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
					${Object.entries(apps).map(x => {
                    let appIcon;
                    if (x[1].icon != undefined) appIcon = `<img src='${x[1].icon}'>`;
                    else if (x[1].name != undefined) appIcon = `<span>${x[1].name[0]}</span>`;
                    else appIcon = x[0][0];
                    return `<button class='app' onclick="X.clearOpenMenus();processes.create('${x[0]}');" --data-tooltip="${x[1].name}" >${appIcon}</button>`
                }).join('')}
			        </div>

				</div>
		`
                return html;
            },

            closeCondition: function (event) {
                return event.target == document.querySelector("#activitiesMenuContainer")
            },


            onCreate: function () {
                const inputElement = systemMenuContainer.querySelector(".app_search > input")
                inputElement.focus()
                inputElement.addEventListener('input', event => {
                    searchResultHtml = X.activities.requestResults(inputElement.value)
                    if (isTextEmpty(inputElement.value)) overlayContainer.querySelector('.open_apps_preview_container').style.display = ''
                    else overlayContainer.querySelector('.open_apps_preview_container').style.display = 'none'
                    systemMenuContainer.querySelector('.search_results_container').innerHTML = searchResultHtml

                })
                let focusedChildIndex = 0
                systemMenuContainer.querySelector('#activitiesMenuContainer').addEventListener('keydown', event => {
                    appSearchResultElement = systemMenuContainer.querySelector('.search_results_container')
                    ignoreKeys = "ArrowRight ArrowLeft Tab Enter Escape"

                    if (event.key == "Escape") { X.clearOpenMenus(); return; }

                    if (event.key.startsWith("Arrow")) {
                        if (event.key == "ArrowRight" && appSearchResultElement.querySelectorAll('.app').length - 1 > focusedChildIndex) focusedChildIndex++
                        if (event.key == "ArrowLeft" && focusedChildIndex > 0) focusedChildIndex--
                        appSearchResultElement.querySelectorAll('.app')[focusedChildIndex].focus()
                    }


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
            menuName: "statusArea",
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
                    </ul>`;
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
            listenerType: "keydown",
            toggleElement: document,
            recreateBehaviour: "toggle",
            changeBorder: false,
            preventDefault: false,
            enterAnimation: "fadeIn",
            exitAnimation: "fadeOut",
            exitAnimationTime: 100, //ms 
            elementQuery: "#taskSwitcher",

            getHTML: function () {
                let ret = ""
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
                document.querySelector(this.elementQuery + " .app").focus()
                const numberOfChildren = processes.getPidObject().length - 1;
                let focusedChildIndex = 0;
                document.querySelector(this.elementQuery).addEventListener('keydown', event => {
                    if ((event.key == "ArrowRight" || event.key == "Tab") && numberOfChildren > focusedChildIndex) focusedChildIndex++
                    if (event.key == "ArrowLeft" && focusedChildIndex > 0) focusedChildIndex--
                    setTimeout(() => {
                        document.querySelectorAll(this.elementQuery + " > .app")[focusedChildIndex].focus()
                    }, 10);


                })
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

        requestResults: function (searchQuery) {
            if (isTextEmpty(searchQuery)) return ""
            searchQuery = searchQuery.toLowerCase()

            let ret = ""
            let indexedApps = []
            const propertiesToIndex = ["name", "description"]

            Object.entries(apps).forEach(x => {
                const appName = x[0]
                const appProperties = x[1]
                indexedApps.push([appName, propertiesToIndex.map(property => { return (isDefined(appProperties[property]) && (appProperties[property].toLowerCase() + " ")) || "" }).join('')])
            })

            indexedApps.forEach(x => {

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

        stored: [],

        add: function (element, layout, cacheListener = true) {
            let contextMenuInnerHTML = ""

            for (const item of layout) {

                if (isTextEmpty(item[0])) {
                    contextMenuInnerHTML += "<hr>"
                    continue;
                }

                if (Array.isArray(item[1])) {
                    contextMenuInnerHTML += `<span class="context_sub_menu_header">${item[0]}</span>
                    <div class='context_sub_menu'>`
                    for (const subitem of item[1]) {
                        contextMenuInnerHTML += `<span onclick="${subitem[1]}">${subitem[0]}</span>`
                    }
                    contextMenuInnerHTML += "</div>"
                    continue;
                }

                contextMenuInnerHTML += `<span onclick="${item[1]}">${item[0]}</span>`
            }
            // this.stored.push({ element: element, layout: layout, innerHTML: contextMenuInnerHTML })

            contextMenuEventHandler = event => {
                X.clearOpenMenus();

                let menuUIData = X.menus.contextMenu
                menuUIData.getHTML = () => `<div id='context_menu' class='fadeIn' style="top: ${event.clientY}px;left: ${event.clientX}px;">${contextMenuInnerHTML}</div>`

                X.createMenu(X.menus.contextMenu, event.clientX, event.clientY)
                // systemMenuContainer.insertAdjacentHTML('beforeend', contextMenuHTML)
            }

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
            title = title || "Notification";
            description = description || "This is a default notification";
            iconPath = iconPath || "./img/about.svg";
            let type = typeof persistent != "boolean" ? false : persistent; //'persistent', 'temporary' : false, true
            clickAction = clickAction || "";
            let id = Object.entries(this.notifications).length == 0 ? 0 : Number(Object.keys(this.notifications).sort().slice(-1)) + 1
            //Creates a popup notification when condition is true.
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
                        this.update.updateElements.forEach(x => {
                            x.element.innerHTML = date.get(x.options);
                        });
                        console.log("Time updated. Next one in: ", 60 - new Date().getSeconds());
                    }, 60 * 1000);
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
                    newObj = { element: element, options: options }
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
            X.clearOpenMenus()
            overlayContainer.querySelector('.general').innerHTML += `<div class='overlay'>${html}</div>`;
        },
        //Simply removes any element with the overlay tag
        remove: function () {
            overlayContainer.querySelectorAll('.general > div.overlay').forEach(x => x.remove())
        }
    },

    cta: function (title = "cta title :)", message = "This is a generic cta message", buttons = [["OK", true]]) {
        //Has to be invoked with await to work correctly

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

    cacheSession: function () {
        let sessionStateCache = system.accounts[system.activeUser].sessionStateCache
        sessionStateCache.desktopHTML = mainContent.innerHTML
        sessionStateCache.runningProcesses = processes.pid
        sessionStateCache.notifications = X.notification.notifications
        processes.pid = {}
        X.notification.notifications = {}
        for (const listener of system.accounts[system.activeUser].sessionStateCache.activeEventListeners) {
            listener.element.removeEventListener(listener.event, listener.callback)
        }
    },

    screen: {
        activeSubScreen: "",
        activeScreen: "",
        activeEventListeners: [],
        set: function (screenName) {
            let availableScreens = ["loginScreen", "lockScreen", "desktop"];

            if (!availableScreens.includes(screenName))
                return;

            X.clearOpenMenus()

            if (this.activeScreen == "desktop" && screenName != "desktop")
                X.cacheSession()

            for (const listener of this.activeEventListeners) {
                listener.element.removeEventListener(listener.type, listener.callback)
            }

            mainContent.innerHTML = screens[screenName].html
            X.status.screen = screenName;
            this.activeScreen = screenName
            this.activeSubScreen = ""
            this[screenName].init()

        },

        setActiveSubScreen: function (selector) {

            mainContent.querySelectorAll(".login-lock_screen > *").forEach(x => {
                x.style.display = 'none'
            });
            mainContent.querySelectorAll('.ignore_hide').forEach(x => x.style.display = '')
            mainContent.querySelector(selector).style.display = ''
            this.activeSubScreen = selector
        },

        setToUserProfilePicture: function (element, pictureUrl) {

            if (isDefined(pictureUrl)) {
                element.style.backgroundImage = `url('${pictureUrl}')`
                element.classList.add('custom_picture')
            } else {
                element.style.backgroundImage = ""
                element.classList.remove('custom_picture')
            }

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
            X.screen.set('desktop')
        },

        loginScreen: {
            init: function () {
                X.topBar.showWrappers(0, 1, 1);
                X.topBar.setColor('transparent')
                system.activeUser = "";
                root.style = ""
                this.showAccounts()
            },

            showAccounts: function () {
                X.screen.setActiveSubScreen(".center_container")
                mainContent.querySelector('.account_container').innerHTML = ""
                let loginAccountsHTML = Object.values(system.accounts).map(x => {
                    if (x.username != "root")
                        return `
                    <div class='account_content' onclick="X.screen.loginScreen.showLoginForm('${x.username}')">
                        <user_icon ${(isDefined(x.settings.profilePictureUrl) && `style="background-image:url('${x.settings.profilePictureUrl}')" class="custom_picture"`) || ''}></user_icon>
                        <span>${x.username}</span>
                    </div>
            `}).join('')

                mainContent.querySelector('.account_container').insertAdjacentHTML('afterbegin', loginAccountsHTML)
            },

            showLoginForm: function (username) {

                if (isTextEmpty(system.accounts[username].encPassword)) {
                    X.screen.loginUser(username, "")
                    return
                }
                X.screen.setActiveSubScreen("#loginForm")

                let loginForm = mainContent.querySelector('#loginForm')
                loginForm.querySelector('#loginUserName').innerHTML = username
                X.screen.setToUserProfilePicture(loginForm.querySelector('user_icon'), system.accounts[username].settings.profilePictureUrl)
                loginForm.reset()
                let inputEl = loginForm.querySelector('input')
                inputEl.classList.remove('incorrectLogin')
                inputEl.focus()
                loginForm.addEventListener('submit', event => {
                    event.preventDefault()

                    let formData = new FormData(loginForm);
                    if (system.validatePassword(username, formData.get('password'))) {
                        X.screen.loginUser(username, formData.get('password'))
                        return;
                    }

                    inputEl.classList.remove('incorrectLogin')
                    void inputEl.offsetWidth; //IDK. makes the animation reset work tho.
                    inputEl.classList.add('incorrectLogin')
                })

            },

            showCustomLoginForm: function () {
                X.screen.setActiveSubScreen('#customLoginForm')
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
            pauseElementChange: false,
            init: function () {
                X.topBar.showWrappers(0, 0, 1);
                X.topBar.setColor('transparent')

                this.time = mainContent.querySelector('#loginTime > time')
                this.date = mainContent.querySelector('#loginTime > date')

                X.services.clock.update.add(this.time, 'time-s');
                X.services.clock.update.add(this.date, 'day>str month>str date');

                let loginForm = mainContent.querySelector('#loginForm')
                let loginTime = mainContent.querySelector('#loginTime')
                let inputEl = loginForm.querySelector('input')

                loginTime.classList.add('selected')

                if (isTextEmpty(system.accounts[system.activeUser].encPassword))
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(1)'

                X.screen.setToUserProfilePicture(loginForm.querySelector('user_icon'), system.accounts[system.activeUser].settings.profilePictureUrl)

                mainContent.querySelector('.login-lock_screen').addEventListener('mouseup', event => {
                    if (loginTime.classList.contains('selected')) this.showLoginForm()
                })
                X.screen.addEventListener(document, 'keyup', event => {
                    console.log(event);
                    if (loginTime.classList.contains('selected')) return this.showLoginForm()

                    if (event.code == "Escape") this.showTime()
                })


                loginForm.querySelector('#loginUserName').innerHTML = system.activeUser
                loginForm.reset()
                inputEl.classList.remove('incorrectLogin')
                inputEl.focus()

                loginForm.addEventListener('submit', event => {
                    event.preventDefault()

                    let formData = new FormData(loginForm);
                    if (system.validatePassword(system.activeUser, formData.get('password'))) {
                        X.screen.loginUser(system.activeUser, formData.get('password'))
                        return;
                    }
                    inputEl.classList.remove('incorrectLogin')
                    void inputEl.offsetWidth; //IDK. makes the animation reset work tho.
                    inputEl.classList.add('incorrectLogin')
                })

            },

            enablePauseElementChange: function () {
                this.pauseElementChange = true
                setTimeout(() => { this.pauseElementChange = false }, 500)
            },

            showTime: function () {

                if (!this.pauseElementChange) {
                    this.enablePauseElementChange()
                    loginTime.classList.add('selected')
                    loginForm.classList.remove('selected')
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(0)'
                }
            },

            showLoginForm: function () {


                if (isTextEmpty(system.accounts[system.activeUser].encPassword)) {
                    setTimeout(() => {
                        if (X.screen.activeScreen != "lockScreen")
                            return; //If The screen changed(mainly because of the switch user button). Don't change it to desktop
                        X.screen.loginUser(system.accounts[system.activeUser], "")
                    }, 500);
                    loginForm.style.display = "none"
                }
                if (!this.pauseElementChange) {
                    this.enablePauseElementChange()
                    loginTime.classList.remove('selected')
                    loginForm.classList.add('selected')
                    mainContent.querySelector('.switch_user_button').style.transform = 'scale(1)'
                    //The timeout makes the focus work
                    setTimeout(() => {
                        loginForm.querySelector('input').focus()
                    }, 100);
                }
            },
        },

        desktop: {
            init: function () {
                X.topBar.showWrappers(1, 1, 1);
                X.topBar.setColor('');

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


                desktop = document.querySelector("#mainContent > #desktop");
                popupNotificationContainer = document.querySelector("#mainContent > #popupNotificationsContainer");
                appsContainer = document.querySelector("#mainContent > #appsContainer");
                appList = document.querySelector("#mainContent > #appList");

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

        root = document.documentElement

        linux = document.querySelector("#linuxRoot");
        topBar = document.querySelector("#linuxRoot> #topBar");
        //Main Linux interface Content
        mainContent = document.querySelector("#mainContent")

        systemMenuContainer = document.querySelector("#overlayContainer > #systemOverlays #systemMenuContainer");
        systemExitAnimationMenuContainer = document.querySelector("#overlayContainer > #systemOverlays #systemMenuAnimationContainer");

        overlayContainer = document.querySelector("body > #overlayContainer");

        X.screen.set("loginScreen")

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
                    if ((!X.openMenus.includes(xObjName) || menuUIData.recreateBehaviour == 'recreate') && ((isFunction(menuUIData.createCondition) && menuUIData.createCondition(event)) || !isFunction(menuUIData.createCondition))) {
                        X.clearOpenMenus(true)
                        menuUIData.preventDefault && event.preventDefault()
                        setTimeout(() => {
                            X.createMenu(menuUIData, event.clientX, event.clientY)
                            //Block the body 'onclick' from deleting the popups when you clicked on them.
                            //Block if we '!want' it closed. Get it?
                            systemMenuContainer.childElementCount > 0 && systemMenuContainer.children[systemMenuContainer.children.length - 1].addEventListener('click', (event) => {
                                if ((typeof menuUIData.closeCondition == 'function' && !menuUIData.closeCondition(event)) || typeof menuUIData.closeCondition != 'function') {
                                    X.menus.openMenuClicked == false && (X.menus.openMenuClicked = true);
                                }
                            })
                            menuUIData.changeBorder && (menuUIData.toggleElement.classList.add("selected-topBar"));
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
    clearOpenMenus: function (force = false) {
        if (X.openMenus.length != 0 || force) {
            X.openMenus.forEach(openMenu => {
                if (isDefined(X.menus[openMenu])) {
                    isDefined(X.menus[openMenu].toggleElement) && isDefined(X.menus[openMenu].toggleElement.classList) && X.menus[openMenu].toggleElement.classList.remove('selected-topBar');
                    //If there is a exitAnimation then play it and remove the element
                    if (X.menus[openMenu].elementQuery && X.menus[openMenu].exitAnimation) {
                        let element = document.querySelector(X.menus[openMenu].elementQuery);
                        if (isDefined(element)) {
                            systemExitAnimationMenuContainer.insertAdjacentElement('afterbegin', element);
                            if (isDefined(X.menus[openMenu].onClose) && typeof X.menus[openMenu].onClose == "function") X.menus[openMenu].onClose()
                            element.classList.add(X.menus[openMenu].exitAnimation)
                            if (X.menus[openMenu].enterAnimation) element.classList.remove(X.menus[openMenu].enterAnimation)
                            setTimeout(() => {
                                systemExitAnimationMenuContainer.innerHTML = ""
                            }, X.menus[openMenu].exitAnimationTime || 200);
                        }
                    }
                }
            })
            X.openMenus = [];
            systemMenuContainer.innerHTML = "";
        }
    },
    //Creates a menu.....
    createMenu: function (menuUIData, x, y) {
        this.clearOpenMenus();
        let elHTML = menuUIData.getHTML(x, y);
        let elTag = menuUIData.elementQuery;
        systemMenuContainer.insertAdjacentHTML("beforeend", elHTML) //Add the objects html to the DOM.

        if (menuUIData.createOnMousePosition) {
            const el = systemMenuContainer.querySelector(elTag);
            const correctionType = isDefined(menuUIData.correctionType) ? menuUIData.correctionType : 0;
            [x, y] = X.correctPosition(x, y, el.offsetWidth, el.offsetHeight, correctionType);
            console.log(x, y, el.offsetWidth, el.offsetHeight, correctionType);
            el.style.left = x + "px";
            el.style.top = y + "px";
        }

        if (menuUIData.elementQuery != "" && menuUIData.enterAnimation != "") {
            //If there is a enterAnimation then append it
            let element = systemMenuContainer.querySelector(menuUIData.elementQuery);
            element.classList.add(menuUIData.enterAnimation);
        }
        X.openMenus.push(menuUIData.menuName);
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
    addEventListener: function (element, event, callback) {
        !isDefined(system.accounts[system.activeUser].sessionStateCache.activeEventListeners) && (system.accounts[system.activeUser].sessionStateCache.activeEventListeners = []);
        system.accounts[system.activeUser].sessionStateCache.activeEventListeners.push({ element: element, event: event, callback: callback })
        element.addEventListener(event, callback);
    },
}


