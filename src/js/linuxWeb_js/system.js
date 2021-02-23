system = {
    started: false,
    user: "root",
    encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f",
    global: {
        //Global variables
        volume: 50,
        brightness: 100,
        doNotDisturb: false,
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

    startup: function () { // !Important: Should only be run once
        if (this.started) return false;
        this.started = true;

        //Add system.build variable [version]
        (async () => { system.build = await (async () => { return (await fetch("./build.ver")).text() })() })() // Get build version
        X.initialize();
        X.services.clock.update.add(document.querySelector('dateTime'), "month>str date time-s")
        X.notification.create('', '', '', '', '', false)
        X.notification.create("Virus Alert", "Your computer has a virus", "X.cta('JK','No virus here...')", "./img/network.svg", true, false)
    },

    validatePassword: function (password) {
        if (sha256(btoa(password)) == system.encPassword) return true;
        else return false;
    },
    cli: {
        // 'i' A.K.A Interpreter parses the command options and calls the command function
        i: function (command = false, terminalProcess = false) {
            if (!command || !terminalProcess) return false
            let options = null;

            let a = (command.trim() + " ").split(' ')
            let callMethod = a.splice(0, 1)[0].trim()

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
            try {
                const ret = system.cli.commands[callMethod] != undefined ? system.cli.commands[callMethod].method(options, terminalProcess) : `${callMethod}: command not found`
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
        help <command>`,
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
        echo <message>
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
            }, app: {
                shortHelp: "Starts an app",
                help: `Starts an app

    USAGE
        app <app name>
        ----------------
        app terminal
        app notepad`,
                method: (options) => {
                    if (options == null) return system.cli.commands.app.help;
                    let appName = options[""][0];
                    if (apps[appName] != undefined) processes.create(appName);
                    else throw `${appName}: No such app`;
                }
            },

            shutdown: {
                shortHelp: "Shoots the computer",
                help: `Makes computer go beep boob RIP.

    USAGE
        shutdown`,
                method: () => {
                    system.shutdown()
                }
            },

            restart: {
                shortHelp: "Restarts",
                help: `Restarts the computer

    USAGE
        restart`,
                method: () => {
                    system.restart()
                }
            },

            logout: {
                shortHelp: "Logouts",
                help: `Restarts the computer

    USAGE
        logout`,
                method: () => {
                    system.logout();
                }
            },
            lock: {
                shortHelp: "Locks the screen",
                help: `Locks the screen

    USAGE
        lock`,
                method: () => {
                    X.lockScreen.lock();
                }
            },
            exit: {
                shortHelp: "Exits the terminal window",
                help: `Exits the terminal window

    USAGE
        exit`,
                method: (options, terminal) => {
                    processes.remove(terminal.elementId)
                }
            },

            kill: {
                shortHelp: "Kills a process by pid",
                help: `Kills a running process

    USAGE
        kill <process pid>
        ----------------
        kill 1`,
                method: (options) => {
                    let pid = options[""][0];
                    if (isNaN(Number(pid))) throw pid + " - Must be a number";


                    if (isDefined(processes.pid[pid])) processes.remove("pid" + pid)
                    else
                        throw pid + " - No such process";
                }
            },
            killall: {
                shortHelp: "Kills processes",
                help: `Kills all running processes of a name

    USAGE
        killall <process name>
        ----------------
        killall terminal
        killall google`,
                method: (options) => {
                    let processName = options[""][0];
                    processList = processes.getRunningInstanceList(processName);
                    if (isValid(processList) && processList != false) {
                        for (const process of processList) {
                            processes.remove("pid" + process.id);
                        }
                    }
                    else throw processName + " - No processes found"
                }
            },
            remind: {
                shortHelp: "Create a reminder",
                help: `Create a reminder

    USAGE
        remind <message> -t <seconds>
        ----------------
        remind Sleep in the shed -t 180,
        remind Get in the bed -t 3600`,

                method: (options) => {
                    const message = options[""].join(' ');
                    const time = options['-t'];
                    console.log(options, message, time);
                    if (isNaN(Number(time))) throw ` -t: must be a number`;
                    if (isValid(message) && message.length != 0) setTimeout(() => {
                        X.notification.create("Reminder", message, '', '', false, true)
                    }, time * 1000);
                    else
                        throw "message - Cannot be empty";
                }
            },
            ls: {
                shortHelp: "List the contents of a directory",
                help: `List the Contents of the current or provided directory

    USAGE
        ls <directory>
        ----------------
        ls
        ls /home`,
                method: (options, terminal) => {
                    path = parseDir(options, terminal)
                    let moreInfo = "";
                    let list = fileSystem.getDir(path, false, true);
                    let ret = ` Contents of '${path}' :\n`

                    console.log(options);
                    console.log(list);


                    if (options != null)
                        moreInfo = isDefined(options['-l']) ? true : false;

                    Object.entries(list).forEach(x => {
                        if (x[0] != '\\0') {
                            if (moreInfo) {
                                let type = fileSystem.getType(x[1]) == 1 ? "-" : "d";
                                let permissions = fileSystem.getPermissions(x[1]);
                                ret += `${type} ${permissions}`;
                            }
                            console.log(x[0], x[1])
                            ret += `    ${x[0]}\n`
                        }
                    });
                    return ret.slice(0, -1);
                }
            },
            cd: {
                shortHelp: "Changes Directory",
                help: `Changes the current directory or display the current directory

    USAGE
        cd <directory>
        ----------------
        cd
        cd /home`,
                method: (options, terminal) => {
                    path = parseDir(options, terminal)
                    terminal.setCurrentDirectory(path);
                    return path;
                }
            },
            cat: {
                shortHelp: "Displays file content",
                help: `Displays the contents of a file

    USAGE
     cat <path/to/file>
        ----------------
        cat example.txt
        cat /home/example.txt`,


                method: (options, terminal) => {
                    path = parseDir(options, terminal)
                    return fileSystem.read(path)
                }
            },
            mkdir: {
                shortHelp: "Create a Directory",
                help: `Create a Directory

    USAGE
        mkdir <directory> or <path/to/directory>
        ----------------
        mkdir project
        mkdir /var/www`,

                method: (options, terminal) => {
                    path = parseDir(options, terminal);
                    fileSystem.write(path, 0, null, 777)

                }
            },
            touch: {
                shortHelp: "Creates a file",
                help: `Creates a file

    USAGE
        touch <path/to/file>
        ----------------
        touch example.txt
        touch /home/example.txt`,

                method: (options, terminal) => {
                    path = parseDir(options, terminal);
                    fileSystem.write(path, 1, "", 777)
                },


            }
        },

        shutdown: () => page.changePage('./html/shutdown.html'),
        logout: () => page.changePage('./html/X.html', "(async()=>{await retrieveMainJs(false);system.startup();})();"),
        restart: () => page.changePage('./html/shutdown.html', "afterShutdown='restart'", false),
    }

}

function parseDir(options, terminal) {
    let path = terminal.currentDirectory;
    if (options != null) {
        dir = options[""].join('').trim();
        dir.endsWith("/") ? dir.slice(0, -1) : dir;
        if (isTextEmpty(dir)) path = '/'
        else if (dir == '..') path = path.split('/').slice(0, -1).join('');
        else if (!dir.startsWith('/')) path = path + (path.endsWith("/") ? "" : '/') + dir;
        else path = dir;
    }
    path == "" && (path = '/')


    console.log(path);
    return path;
}

