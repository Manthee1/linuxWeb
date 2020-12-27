system = {
    started: false,
    encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f",
    global: {
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

    changeBrightness: function (brightness) {
        this.global.brightness = brightness;
        document.querySelector("html").style.filter = `brightness(${system.global.brightness / 100})`;
    },
    changeVolume: function (volume) {
        this.global.volume = volume;
        let img
        X.statusArea.updateVolume();

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
        })()

        X.statusArea.updateStatusAreaTime();
        setTimeout(() => {
            setInterval(() => {
                X.statusArea.updateStatusAreaTime();
            }, 60 * 1000);
        }, (60 - new Date().getSeconds()) * 1000); //makes sure the update is synchronized

        Object.values(X).forEach(xObj => { if (typeof (xObj) == "object" && typeof (xObj['enable']) == "function") { xObj.enable() } })
        Object.entries(X).forEach(xObj => {
            console.log(xObj);
            if (xObj[1].toggleButtonElement != undefined) {
                console.log(xObj, "set");
                xObj[1].toggleButtonElement.addEventListener('click', () => {
                    if (!system.openPopups.includes(xObj[0])) {
                        setTimeout(() => {
                            popupContainer.innerHTML += xObj[1].getHTML();

                            popupContainer.children[popupContainer.children.length - 1].addEventListener('click', (event) => {
                                console.log(event);
                                copyOf_openPopups = [...system.openPopups]
                                system.openPopups = [];
                                setTimeout(() => {
                                    system.openPopups = [...copyOf_openPopups]
                                    copyOf_openPopups = undefined;
                                }, 1);
                            })
                            xObj[1].toggleButtonElement.style.borderBottom = "solid gray 2px";
                            system.openPopups.push(xObj[0]);
                        }, 1);
                    }

                });
            }
        })
        document.body.addEventListener("click", () => {
            system.clearOpenPopups()
        });


    },

    clearOpenPopups: function (forcefully = false) {
        if (system.openPopups.length != 0 || forcefully) {
            console.log("Body click");
            system.openPopups.forEach(openPopup => {
                X[openPopup].toggleButtonElement.style.borderBottom = "";
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