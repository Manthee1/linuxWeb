system = {
    started: false,
    encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f",
    global: {
        //Global variables and functions...
        volume: 50,
        brightness: 100,

        isValid: x => {
            return (x && x.toString().trim() !== "") || x == false;
        },
        elementExists: (el) => {
            if (typeof el != "undefined" && el != null) return true;
            else return false;
        },
        escapeHtml: (text) => {
            var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return text.replace(/[&<>"']/g, function (m) { return map[m]; });
        },
    },
    // I won't comment understandable functions here...
    changeBrightness: function (brightness) {
        this.global.brightness = brightness;
        document.querySelector("html").style.filter = `brightness(${system.global.brightness / 100})`;
    },
    changeVolume: function (volume) {
        this.global.volume = volume;
        let img
        X.services.volume.update();
    },
    startup: function () {//  Important: Should only be run once

        if (this.started) return false;
        this.started = true;
        popupContainer = document.querySelector("system_popup_container");
        appsLayer = document.querySelector("apps_layer");
        desktop = document.querySelector("desktop");
        processBar = document.querySelector("process_bar");
        system.openPopups = [];
        //Add system.build variable
        (async () => {
            system.build = await (async () => { return (await fetch("./build.ver")).text() })()
        })() // Get build version

        this.initializeX()
        X.services.clock.update.add(document.querySelector('dateTime'), "month>str date  time-s")

        //WHen the body is clicked all popup's get closed

    },
    //initializes the X object 
    initializeX: function () {
        X.openMenuClicked = false
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
        }

        // Do stuff.. Make all the objects with a toggle button show their html and handle the clicking and closing when clicked outside of html. i don't know what im writing i hope this is understandable
        Object.entries(X.menus).forEach(xObj => {
            let [xObjName, xObjValue] = [xObj[0], xObj[1]];
            let sysUIData = {};
            Object.assign(sysUIData, xObjSchema);
            Object.assign(sysUIData, xObjValue);
            // console.log(xObjName, sysUIData);
            if (typeof (xObjValue) == "object" && sysUIData.toggleElement != undefined && typeof sysUIData.getHTML == 'function') {
                //Adds a 'onclick' listener for the button element that creates a system popup (app menu,status menu...)
                sysUIData.toggleElement.addEventListener(sysUIData.listenerType, event => {
                    // console.log('sysClicked', event);
                    if (!system.openPopups.includes(xObjName) || sysUIData.recreateBehaviour == 'recreate') {
                        system.clearOpenMenus(true)
                        sysUIData.preventDefault && event.preventDefault()
                        setTimeout(() => {
                            if (sysUIData.createOnMousePosition) elHTML = sysUIData.getHTML(event.clientX, event.clientY);
                            else elHTML = sysUIData.getHTML()
                            popupContainer.innerHTML += elHTML //Add the objects html to the dom.
                            //Block the body 'onclick' from deleting the popups when you clicked on them.
                            //Block is we '!want' it closed. Get it?
                            popupContainer.children[popupContainer.children.length - 1].addEventListener('click', (event) => {
                                if ((typeof sysUIData.closeCondition == 'function' && !sysUIData.closeCondition(event)) || typeof sysUIData.closeCondition != 'function') {
                                    X.menus.openMenuClicked == false && (X.menus.openMenuClicked = true);
                                }
                            })
                            sysUIData.changeBorder && (sysUIData.toggleElement.style.borderBottom = "solid gray 2px");
                            system.openPopups.push(xObjName);
                            typeof sysUIData.onCreate == 'function' && sysUIData.onCreate(event)
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
            system.clearOpenMenus()
        });

    },
    //Clear all open system menu popups.
    clearOpenMenus: function (forcefully = false) {
        if (system.openPopups.length != 0 || forcefully) {
            // console.log("Body click");
            system.openPopups.forEach(openPopup => {
                X.menus[openPopup].toggleElement.style.borderBottom = "";
            })
            system.openPopups = [];
            // X.statusArea.volumeSliderDisplayToggle(true);
            popupContainer.innerHTML = "";
        }

    },
    validatePassword: function (password) {
        if (sha256(btoa(password)) == system.encPassword) return true;
        else return false;
    },
}
