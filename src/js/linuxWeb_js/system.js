system = {
    started: false,
    activeUser: "",
    encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f",
    global: {
        //Global variables
        volume: 50,
        brightness: 100,
        doNotDisturb: false,
        css: {},
    },
    //The accounts object includes... accounts, and... more accounts...
    // It also contains the user settings and other stuff
    accounts: {
        root: { username: "root", privileged: true, encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f", settings: {}, sessionStateCache: {} },
        user1: {
            username: "user1", privileged: false, encPassword: "bf0dbd74174039131b667de9f31b5d8012baaf82011b934b2cc0e3bd53a02a1f",
            settings: {
                background: { type: "cssVar", variable: "user-background", value: "url('https://cdn.pling.com/img//hive/content-pre1/155710-1.jpg')" },
                profilePictureUrl: "https://p.favim.com/orig/2018/10/01/cartoon-profile-picture-cute-Favim.com-6346120.jpg"
            },
            sessionStateCache: {}
        },
        user2: { username: "user2", privileged: false, encPassword: "", settings: {}, sessionStateCache: {} },
    },

    //Simple. Check if the users password is valid/correct
    validatePassword: function (username, password) {
        if (!isDefined(system.accounts[username])) return false
        if (isTextEmpty(system.accounts[username].encPassword)) return true;
        if (sha256(btoa(password)) == system.accounts[username].encPassword) return true;
        return false;
    },

    // I won't comment understandable functions here...
    changeBrightness: function (brightness) {
        this.global.brightness = brightness;
        document.querySelector("html").style.filter = `brightness(${system.global.brightness / 100})`;
    },
    //Idk what this does...
    changeVolume: function (volume) {
        this.global.volume = volume;
        isDefined(X) && X.services.volume.update();
    },

    startup: function () { // !Important: Should only be run once
        if (this.started) return false;
        this.started = true;

        //Add system.build variable [version]
        (async () => { system.build = await (async () => { return (await fetch("./build.ver")).text() })() })() // Get build version
        //Initializes X if iit exists.
        isDefined(X) && X.initialize();
    },

    cli: {
        // 'i' A.K.A Interpreter parses the command options and calls the command function
        i: function (command = false, terminalProcess = false) {
            if (!command || !terminalProcess) return false
            let options = null;
            let rawArgumentString = command.trim()
            let writeToPath = false

            //Check if redirection operator exist
            if (rawArgumentString.includes('>')) {
                [rawArgumentString, writeToPath] = rawArgumentString.split('>')
                writeTocPath = parseDir(null, terminalProcess, writeToPath.trim());
            }
            let argArray = (rawArgumentString + " ").split(' ')

            //Separates the command name (callMethod) and it's arguments
            let callMethod = argArray.splice(0, 1)[0].trim();

            //Checks if the argArray is not empty
            if (argArray.length != 0 && !(argArray.length == 1 && argArray[0].trim().length === 0)) {
                //Default option object definition where @s = 
                options = { "@": [], "$raw": rawArgumentString };
                let optionBuffer = "";
                let quoteBuffer = ""
                //Main loop that parses the arguments into the options object
                //Not complex just... Intricate? Or maybe not?...
                for (let i = 0; i < argArray.length; i++) {
                    let x = argArray[i].trim()
                    if (x.startsWith('-') && x.length > 1) {
                        if (!isTextEmpty(optionBuffer)) {
                            let obj = this.appendToOptions(optionBuffer, '', options);
                            optionBuffer = "";
                        }
                        if (x.startsWith('--') && x.length > 2)
                            optionBuffer = '-' + x.replaceAll('-', '');
                        else optionBuffer = x.replaceAll('-', '');
                    } else {
                        if (isTextEmpty(optionBuffer)) options['@'].push(x);
                        else {
                            //Checks if quotes are present and then loops thorough the args till it doesn't find another quote to close the string
                            if (x.startsWith('"')) {
                                quoteBuffer += x.slice(1) + " "

                                for (let j = i + 1; j < argArray.length; j++) {
                                    let x = argArray[j] + " "
                                    if (x.startsWith('-')) {
                                        i = j
                                        break
                                    }
                                    if (x.includes('"')) {
                                        quoteBuffer += x.split('"')[0]
                                        i = j
                                        break;
                                    }
                                    quoteBuffer += x

                                }
                                x = quoteBuffer;
                                quoteBuffer = "";
                            }
                            obj = this.appendToOptions(optionBuffer, x, options);
                        }
                        optionBuffer = "";
                    }
                }
                options["@s"] = options["@"].join(' ').trim()
            }
            console.log(options);
            //Ahh the classic "if an error occurs and then throw it again" :)
            try {
                const ret = system.cli.commands[callMethod] != undefined ? system.cli.commands[callMethod].method(options, terminalProcess) : `${callMethod}: command not found`
                if (writeToPath) fileSystem.write(writeToPath, 1, ret, 777);
                else return ret;
            } catch (error) { // if an error is encountered... Throw it again...
                throw `${callMethod}: ${error}`
            }
        },
        //Append the buffer, aka the terminal option, and it's value to the obj
        appendToOptions: function (buffer, value, obj) {
            if (buffer.startsWith('-'))
                obj["-" + buffer] = value;
            else if (!isTextEmpty(buffer))
                for (const x of buffer) {
                    obj['-' + x] = value
                }
            return obj;
        },

        //The commands object containing the command names, and all of their things...
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
                        output += Object.entries(system.cli.commands).map(x => { return `${x[0].length > 15 && x[0].slice(0, 12) + "..." || x[0]}    ${x[0].length < 8 && "    " || ""}${x[1].shortHelp ?? "*No short help available*"}\n`; }).join('');
                    } else {
                        let command = options['@'][0]
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
            uname: {
                shortHelp: "Prints System Information",
                help: `Prints System Information`,
                method: (options) => {
                    return "linuxWEB"
                },
            },
            whoami: {
                shortHelp: "Prints Username Information",
                help: `Prints System Information`,
                method: (options) => {
                    return system.activeUser
                }
            },
            clear: {
                shortHelp: "Prints Username Information",
                help: `Prints System Information`,
                method: (options, terminal) => {
                    terminal.clear();
                }
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
                        let text = options["@s"]
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
  app <app name>
  ----------------
  app terminal
  app notepad`,
                method: (options) => {
                    if (!isDefined(options)) return system.cli.commands.app.help;
                    let appName = options["@s"];
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
                    setTimeout(() => {
                        X.screen.set('lockScreen');
                    }, 100); //Timeout so that the lockScreen event listener does not immediately trigger when you press enter and execute the command 
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
                    let pid = options["@s"];
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
                    const processName = options["@s"];
                    const processList = processes.getRunningInstanceList(processName);
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
  remind Go to bed -t 3600`,

                method: (options) => {
                    const message = options["@s"];
                    const time = options['-t'];
                    if (isNaN(Number(time))) throw ` -t: must be a number`;
                    if (isValid(message) && message.length != 0) setTimeout(() => {
                        X.notification.create("Reminder", message, '', '', false, true)
                    }, time * 1000);
                    else throw "message - Cannot be empty";
                }
            },

            passwd: {
                shortHelp: "Change a password",
                help: `Changes a specified account's password

USAGE
  passwd <username> -p <password>
  passwd <username> -c
  ----------------
  passwd user1 -p 123
  passwd user1 -c    //clears an users password`,


                method: (options, terminal) => {
                    const username = options["@"][0];
                    let password = ""
                    if (isTextEmpty(username)) throw "Username not provided"
                    if (!isDefined(system.accounts[username])) throw "That user does not exist"
                    if (!isDefined(options["-c"]) && !isDefined(options["-p"])) throw "-c or -p required"
                    if (isDefined(options["-c"]) && isDefined(options["-p"])) throw "You can't both clear and change a password"
                    if (isDefined(options["-p"]) && isTextEmpty(options["-p"])) throw "-p: Can't be empty"
                    else password = options["-p"];
                    if (isDefined(options["-c"])) system.accounts[username].encPassword = ""
                    else system.accounts[username].encPassword = sha256(btoa(password))
                    return "Password successfully changed"
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
                    const path = parseDir(options, terminal)
                    const list = fileSystem.getDir(path, false, true, 0);
                    let moreInfo = false;
                    let ret = `Contents of '${path}' :\n`
                    if (isDefined(options))
                        moreInfo = isDefined(options['-l']) ? true : false;
                    Object.entries(list).forEach(x => {
                        if (x[0] != '\\0') {
                            if (moreInfo) {
                                let type = fileSystem.getType(x[1]) == 1 ? "-" : "d";
                                let permissions = fileSystem.getPermissions(x[1]);
                                ret += `${type} ${permissions}`;
                            }
                            ret += ` ${x[0]}\n`
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
                    terminal.setCurrentDirectory(parseDir(options, terminal));
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
                    return fileSystem.read(parseDir(options, terminal))
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
                    fileSystem.write(parseDir(options, terminal), 0, null, 777)
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
                    const path = parseDir(options, terminal);
                    fileSystem.write(path, 1, "", 777)
                },
            },
            write: {
                shortHelp: "Writes to a file",
                help: `Writes to a file

USAGE
  write <text> -f <path/to/file>
  ----------------
  write Hello -f example.txt
  write Hi! -f /home/example.txt`,

                method: (options, terminal) => {
                    if (options != null && isDefined(options['-f'])) {
                        if (isTextEmpty(options['-f'])) throw "-f: Path can't be empty!"
                        const dir = options['-f'];
                        const text = options['@s'];
                        const path = parseDir(options, terminal, dir);
                        fileSystem.write(path, 1, text, 755)
                    } else throw "Path must be specified with -f!";
                },
            },
            rm: {
                shortHelp: "Removes a file",
                help: `Removes a file

USAGE
  rm <path/to/file>
  ----------------
  rm example.txt`,

                method: (options, terminal) => {
                    if (options == null)
                        throw "Path must be specified";
                    const dir = options['@s'];
                    const path = parseDir(options, terminal, dir);
                    fileSystem.removeFile(path, isDefined(options["-f"]))
                },
            },
            rmdir: {
                shortHelp: "Removes a directory",
                help: `Removes a directory

USAGE
  rmdir <path/to/dir>
  ----------------
  rmdir var/example`,

                method: (options, terminal) => {
                    if (options == null)
                        throw "Path must be specified";
                    const dir = options['@s'];
                    const path = parseDir(options, terminal, dir);
                    try {
                        fileSystem.removeDir(path, isDefined(options["-f"]));
                    } catch (error) {
                        if (error.startsWith('Error 10'))
                            throw "That directory is not empty"
                        throw error
                    }
                },
            },
            top: {
                shortHelp: "Lists the active processes",
                help: `List the active processes
USAGE
  top`,

                method: function (options, terminal) {
                    terminal.initUpdate(this.update, options)
                },
                update: function (terminal, options, event = null) {
                    const obj = processes.getPidObject();
                    if (obj) {
                        let ret = "PID    AppName\n";
                        for (const x of Object.values(obj)) {
                            ret += `${x.id}    ${x.appName} \n`
                        }
                        return ret;
                    }
                }
            },
        },

    },

    shutdown: () => page.changePage('./views/shutdown.html'),
    logout: async () => {
        //Reload the scripts and then the page
        for (const jsSrc of jsSources) {
            await page.loadJs(jsSrc)
        }
        page.changePage('./views/X.html', "system.startup();")
    },
    restart: () => page.changePage('./views/shutdown.html', "afterShutdown='restart'", false),

}

//Figures out which directory a user is targeting. So basically parses a String into a path to the file/directory object.
function parseDir(options, terminal = null, dir = null) {
    let path = isDefined(terminal) ? terminal.currentDirectory : '/'
    if (!isDefined(dir) && isDefined(options)) {
        dir = options["@s"];
    }
    if (isDefined(dir)) {
        dir = dir.endsWith("/") ? dir.slice(0, -1) : dir;
        if (isTextEmpty(dir)) path = '/'
        else if (dir == '..') path = path.split('/').slice(0, -1).join('/')
        else if (!dir.startsWith('/')) path = path + (path.endsWith("/") ? "" : '/') + dir;
        else path = dir;
    }
    !path.startsWith('/') && (path = '/' + path)
    return path;
}

