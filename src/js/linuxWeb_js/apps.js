apps = {

    terminal: {
        //Saddle up for this one. 
        name: "linuxWEB Terminal",
        path: "apps.terminal",
        version: "1.2.0",
        icon: "./img/terminal.svg",

        createData: {
            //The createData object is used to define the general parameters
            //so that the processes.create() knows how to customize it and create it.
            title: "Terminal",
            bodyColor: "black",
            textColor: "white",
            bodyBorder: false,
            bodyBorderSize: '0px',
            opacity: 0.9,
            padding: "10px 5px",
            getHTML: function () {
                return `
                <terminal_main>linuxWEB terminal version ${apps.terminal.version}<br></terminal_main>
                <terminal_buffer></terminal_buffer>
				<terminal_input><span>${this.methods.getPrefix()}</span><input type=text></terminal_input>
				`},

            methods: {
                // Everything here gets added to the pid object of the app.
                // So every terminal has its own separate 'commandHistory', 'addToCommandHistory()' etc.
                commandHistory: [],
                currentHistoryNumber: -1,
                currentCommand: "",

                updateInitialized: false,

                currentDirectory: "/",
                user: system.activeUser,

                updateUserName: function () {
                    this.user = system.activeUser;
                },

                getPrefix: function () {
                    this.updateUserName();
                    return `[${this.user} ${this.currentDirectory}] $&nbsp`;
                },

                addText: function (text) {
                    inputElement = this.getProcessElementBody().querySelector('terminal_input > input');
                    if (isDefined(text)) {
                        text = escapeHtml(text.toString()).replace(/\n/g, "<br>").replaceAll("    ", "&Tab;");
                        this.getProcessElementBody().querySelector('terminal_main').innerHTML += text + "<br>";
                        inputElement.scrollIntoView(false);
                    }
                },

                clear: function () {
                    this.getProcessElementBody().querySelector('terminal_main').innerHTML = "";
                },

                setCurrentDirectory: function (dir) {
                    dirObj = fileSystem.getDir(dir);
                    if (!isDefined(dirObj)) throw `${dir}: Path not found.`;
                    if (!fileSystem.isDir(dirObj)) throw `${dir}: Not a directory`;
                    this.currentDirectory = dir;
                },
                //Initiate the recursive update loop witch gets called ${updateDelay}
                initUpdate: function (update, options, updateDelay) {
                    this.updateInitialized = true;
                    this.startUpdateLoop(update, options, updateDelay);
                    this.getProcessElementBody().querySelector('terminal_input > span').style.display = 'none';
                },

                startUpdateLoop: function (update, options, event = null, updateDelay = 1000) {
                    terminal = this;
                    terminalBuffer = terminal.getProcessElementBody().querySelector('terminal_buffer')

                    //Sets the terminal content to what update() returns
                    terminalBuffer.innerHTML = escapeHtml(update(terminal, options, event)).replaceAll("    ", "&Tab;");;
                    this.getProcessElementBody().querySelector('terminal_input > input').scrollIntoView(false); // scroll the buffer into view
                    setTimeout(() => {
                        if (terminal.updateInitialized) {
                            terminal.startUpdateLoop(update, options, event, updateDelay)
                        }
                    }, updateDelay);
                },

                stopUpdateLoop: function () {
                    this.updateInitialized = false;
                },

                //This is executed by processes.bringToTop(); When app is 'focused' on.
                onFocus: function (event) {
                    let focusElement = this.getProcessElementBody().querySelector('terminal_input > input');
                    let textElement = this.getProcessElementBody().querySelector('terminal_main');
                    (document.activeElement != focusElement && !elementIsInEventPath(event, textElement)) && focusElement.focus();
                },

                //Adds a executed command to the command history array.
                addToCommandHistory: function (commandToPush) {
                    this.commandHistory.length > 30 && this.commandHistory.pop();
                    this.commandHistory.unshift(commandToPush);
                },
            }
        },
        //Returns an object with references to the wanted terminal element in the dom
        //The parameter is the terminal 'pid' object
        InitiateProcessVariables: function (process = null) {
            if (process == null) return false;
            return {
                body: process.getProcessElementBody(),
                main: process.getProcessElementBody().querySelector('terminal_main'),
                inputPrefix: process.getProcessElementBody().querySelector('terminal_input'),
                input: process.getProcessElementBody().querySelector('terminal_input > input'),
                buffer: process.getProcessElementBody().querySelector('terminal_buffer'),
            }
        },
        //Executed once when the terminal is created
        onStart: function (process) {
            console.log("onStart Initialized: ", process);
            terminalElement = this.InitiateProcessVariables(process);
            //Adds a listener for keypress.
            terminalElement.input.setAttribute('onkeydown', this.path + `.parseCommand(event,this,processes.pid[${process.id}])`);
        },

        parseCommand: async function (event, element, process) {
            let terminalElement = this.InitiateProcessVariables(process);
            //When the update loop is initialized don't parse the input as a command
            if (process.updateInitialized) {
                if (event.ctrlKey && event.key.toLowerCase() == 'c') {
                    process.updateInitialized = false;
                    process.addText(terminalElement.buffer.innerHTML);
                    terminalElement.buffer.innerHTML = ""
                    process.getProcessElementBody().querySelector('terminal_input > span').style.display = '';
                    return false;
                }

                event.preventDefault();
                return false;
            }
            //If enter was pressed do things
            if (event.code.includes('Enter')) {
                let rawText = element.value;
                let parsedTextWithPrefix = `${terminalElement.inputPrefix.innerText}${rawText}`;
                process.addText(parsedTextWithPrefix);

                if (isTextEmpty(rawText))
                    return false;

                try {
                    //Runs the command through the interpreter and gets the command output.
                    text = system.cli.i(rawText, process);
                    terminalElement.inputPrefix.querySelector('span').innerHTML = process.getPrefix()
                    process.currentHistoryNumber = -1;
                    process.addText(text);
                } catch (e) {
                    //Returns error
                    process.addText(e);
                }

                element.value = ""; // Clear the input.
                process.addToCommandHistory(rawText);
            } else if (event.code == "ArrowUp") {
                // Go thought the command history just like in a conventional terminal
                process.currentHistoryNumber == -1 && (process.currentCommand = element.value);
                this.getFromCommandHistory(process, +1)
            } else if (event.code == "ArrowDown") {
                this.getFromCommandHistory(process, -1)
            }
        },

        getFromCommandHistory: function (process, val) {
            // Go Up||Down a number in the commandHistory array, val=-1 or 1
            let command = process.commandHistory[process.currentHistoryNumber + val];
            if (process.currentHistoryNumber + val < -1) return false
            terminalElement = apps.terminal.InitiateProcessVariables(process);
            if (command != undefined) {
                // If there is a command in the history then do that. Yeah...
                terminalElement.input.value = command;
                process.currentHistoryNumber = process.currentHistoryNumber + val;
            } else if (process.currentHistoryNumber > process.currentHistoryNumber + val) {
                // If command is undefined and you you went down in history then: current command
                terminalElement.input.value = process.currentCommand;
                process.currentHistoryNumber = -1;
            }
            // Put the cursor on the end
            setTimeout(() => {
                terminalElement.input.selectionStart = terminalElement.input.selectionEnd = terminalElement.input.value.length;
            }, 0);
        },
    },

    settings: {
        name: "Settings",
        icon: "./img/settings.svg",

        //The HTML Layout gets stored object... yea kinda wired. I even remember thinking this is good...
        // Well I don't have time to fix this so you can stare at it for now.
        layout: {
            selected: 0,
            0: {
                name: "About",
                iconTag: "about_icon",
                getPanelHTML: function () {
                    return `
                    <h1>About</h1>
                    <hr>
                    <span>Build: ${system.build}</span>
                    <div>Most icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                `}
            },
            1: {
                name: "Appearance",
                iconTag: "appearance_icon",
                getPanelHTML: function () {
                    return `
                    <h1>Appearance Settings</h1>
                    <hr>
                `}
            },
            2: {
                name: "Desktop",
                iconTag: "desktop_icon",
                getPanelHTML: function () {
                    return `
                    <h1>Desktop Settings</h1>
                    <hr>
                `}
            },
            3: {
                name: "Sound",
                iconTag: "volume_icon",
                getPanelHTML: function () {
                    return `
                    <h1>Sound Settings</h1>
                    <hr>
                `}
            },
            4: {
                name: "User",
                iconTag: "user_icon",
                getPanelHTML: function () {
                    return `
                    <h1>User Settings</h1>
                    <hr>
                `}
            },

        },
        createData: {
            title: "Settings",
            fullHeight: true,
            fullWidth: true,
            minWidth: 500,
            minHeight: 500,
            onlyOneInstanceAllowed: true,
            getHTML: function () {
                let menuItems = Object.entries(apps.settings.layout).map((x) => {
                    [menuItemId, menuItem] = [x[0], x[1]]
                    if (typeof menuItem != 'object') return ''
                    return `<menuItem ${apps.settings.layout.selected == menuItemId && "class='selected'"} onclick='apps.settings.switchToPanel(${menuItemId},false,this)'><${menuItem.iconTag}></${menuItem.iconTag}>${menuItem.name}</menuItem>`
                }).join('');
                return `<div id='settingsAppContainer'><div id="sidebarMenu">${menuItems}</div><div id='contentPanel'>${apps.settings.switchToPanel(0, true)}</div></div>`;
            }
        },
        // Switches to the panel that's defined in the layout object...
        switchToPanel: function (panelMenuId, onlyGetHTML = false, element) {
            let panelHTML = this.layout[panelMenuId].getPanelHTML();
            if (onlyGetHTML) return panelHTML
            else {
                document.querySelectorAll('#settingsAppContainer .selected').forEach(x => x.classList.remove("selected"))
                document.querySelector('#settingsAppContainer > #contentPanel').innerHTML = panelHTML;
                element.classList.add("selected")
            }
            return true

        },
    },

    google: {
        name: "Google Website",

        createData: {
            title: "Google Search",
            fullHeight: true,
            fullWidth: true,
            minWidth: 1000,
            minHeight: 500,
            getHTML: function () { return `<iframe style='height:100%;' src="https://www.google.com/webhp?igu=1"></iframe>` },
        },
    },
    notepad: {
        name: "Notepad",
        icon: "./img/notepad.svg",
        createData: {
            title: "Notepad - Untitled Document",
            fullWidth: true,
            fullHeight: true,
            getHTML: function () { return `<textarea></textarea>` },
            methods: {
                onFocus: function () {
                    let focusElement = this.getProcessElementBody().querySelector('textarea')
                    document.activeElement != focusElement && focusElement.focus();
                },
            },
        },
    },
}






