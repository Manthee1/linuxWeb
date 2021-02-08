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
        isObjectEmpty: (obj) => {
            return Object.entries(obj).length == 0
        },
        css: {},
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
        // system.global.css["topBar-height"] = getComputedStyle(htmlEl).getPropertyValue('--topBar-height').replace('px', '');
        X.notification.create()
        X.notification.create("Virus Alert", "Your computer has a virus", "X.cta('JK','No virus here...')", "./img/network.svg", 'persistent')
    },

    validatePassword: function (password) {
        if (sha256(btoa(password)) == system.encPassword) return true;
        else return false;
    },
    cli: {
        // 'i' A.K.A Interpreter parses the command options and calls the command function
        i: function (command = false, terminalProcess = false) {
            // if (!command || !terminalProcess) return false
            let options = null;

            let a = (command.trim() + " ").split(' ')
            let callMethod = a.splice(0, 1)[0].trim()
            console.log(a);

            if (a.length != 0 && !(a.length == 1 && a[0].trim().length === 0)) {
                options = { "": [] };
                let optionBuffer = "";
                let i = 0;
                a.forEach(x => {
                    if (x.startsWith('-')) {
                        optionBuffer.trim() != "" && (options[optionBuffer] = '');
                        optionBuffer = x;
                    } else if (x.trim() != "") {
                        if (optionBuffer.trim() == "") options[""].push(x);
                        else options[optionBuffer] = x;
                        optionBuffer = "";
                    }
                });
            }
            console.log(options);
            try {
                const ret = system.cli.commands[callMethod] != undefined ? system.cli.commands[callMethod].method(options) : `${callMethod}: command not found`
                return ret;
            } catch (error) {
                console.log(error);
                throw `${callMethod}: ${error}`
            }

        },
        commands: {
            help: {
                shortHelp: "Displays help pages for commands",
                help: `Displays a help page for commands
                    
    USAGE
        help
        help <command>
                `,
                method: (options) => {
                    let output = "";
                    if (options == null) {
                        output = "-----help-----\n"
                        output += "For more information about a specific command type: help <command>\n\n"
                        output += Object.entries(system.cli.commands).map(x => { return `${x[0]}        ${x[1].shortHelp ?? "*No short help available*"}\n`; }).join('');
                    } else {
                        let command = Object.values(options)[0];
                        if (system.cli.commands[command] == undefined || system.cli.commands[command].help == undefined)
                            output = `No help for '${command}' try: help help`
                        else {
                            output = `----- ${command} help-----\n\n`
                            output += system.cli.commands[command].help + "\n";
                        }

                    }
                    return output;
                },
            },
            echo: {
                shortHelp: "Echos your message back to you",
                help: `Echos your message back to you
    USAGE
        echo < message >
         ----------------
        echo Hello Word`,
                method: (options) => {
                    if (options != null) {
                        let text = options[""].join(" ")
                        text = text.trim()
                        if (text[0] == '"' && text.slice(-1) == '"') text = text.slice(1, -1)[0]
                        return text
                    }
                }
            },
            app: {
                shortHelp: "Starts an app",
                help: `Starts an app
    USAGE
        app < app name >
        ----------------
        app terminal
        app notepad
`,
                method: (options) => {
                    let appName = options[""][0];
                    console.log(appName, options[""][0]);
                    if (apps[appName] != undefined) processes.create(appName)
                    else throw `${appName}: No such app`

                }
            }
        }
    },

    shutdown: () => page.changePage('./html/shutdown.html'),
    logout: () => page.changePage('./html/X.html', "(async()=>{await retrieveMainJs(false);system.startup();})();"),
    restart: () => page.changePage('./html/shutdown.html', "afterShutdown='restart'", false),
}


