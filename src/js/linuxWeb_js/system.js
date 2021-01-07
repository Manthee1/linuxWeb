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
        //Add system.build variable
        (async () => {
            system.build = await (async () => { return (await fetch("./build.ver")).text() })()
        })() // Get build version
        X.initialize();

        X.services.clock.update.add(document.querySelector('dateTime'), "month>str date  time-s")

        //WHen the body is clicked all popup's get closed

    },

    validatePassword: function (password) {
        if (sha256(btoa(password)) == system.encPassword) return true;
        else return false;
    },
    cli: {
        // i A.K.A Interpreter parses the command options and calls the command function
        i: function (command = false, terminalProcess = false) {
            // if (!command || !terminalProcess) return false

            let options = {};

            let a = command.split(' ')
            callFunction = a.splice(0, 1)[0].trim()
            if (a.length != 0) {
                let optionBuffer = "";
                a.forEach(x => {
                    if (x.startsWith('-')) {
                        optionBuffer.trim() != "" && (options[optionBuffer] = '');
                        optionBuffer = x;
                    } else if (x.trim() != "") {
                        options[optionBuffer] = x;
                        optionBuffer = "";
                    }
                })
            }
            return options
        },
        methods: {

        }
    },

    shutdown: () => page.changePage('./src/html/shutdown.html'),
    logout: () => page.changePage('./src/html/X.html', "(async()=>{await retrieveMainJs(false);system.startup();})();"),
    restart: () => page.changePage('./src/html/shutdown.html', "afterShutdown='restart'", false),
}


