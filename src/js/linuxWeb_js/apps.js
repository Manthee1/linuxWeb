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
                user: system.user,

                getPrefix: function () {
                    return `[${this.user} ${this.currentDirectory}] $ `;
                },

                setCurrentDirectory: function (dir) {
                    dirObj = fileSystem.getDir(dir);
                    if (!isDefined(dirObj)) throw `${dir}: Path not found.`;
                    if (!fileSystem.isDir(dirObj)) throw `${dir}: Not a directory`;
                    this.currentDirectory = dir;
                },

                initUpdate: function (update, options) {
                    this.updateInitialized = true;
                    this.startUpdateLoop(update, options);
                    this.getProcessElementBody().querySelector('terminal_buffer').innerHTML = escapeHtml(update(this, options, event));
                    this.getProcessElementBody().querySelector('terminal_input > span').style.display = 'none';
                },

                startUpdateLoop: function (update, options, event = null) {
                    terminal = this;
                    setTimeout(() => {
                        terminalBuffer = terminal.getProcessElementBody().querySelector('terminal_buffer')
                        if (terminal.updateInitialized) {
                            terminalBuffer.innerHTML = escapeHtml(update(terminal, options, event));
                            terminal.startUpdateLoop(update, options, event)
                        }
                    }, 1000); //1 fps basically
                },

                stopUpdateLoop: function () {
                    this.updateInitialized = false;
                },

                //This is executed by processes.bringToTop(); When the app is clicked on.
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
        //Adds a listener for keypress.  
        onStart: function (process) {
            console.log("onStart Initialized: ", process);
            terminalElement = this.InitiateProcessVariables(process);
            terminalElement.input.setAttribute('onkeydown', this.path + `.parseCommand(event,this,processes.pid[${process.id}])`);
        },
        parseCommand: async function (event, element, process) {
            let terminalElement = this.InitiateProcessVariables(process);

            if (process.updateInitialized) {
                if (event.ctrlKey && event.key.toLowerCase() == 'c') {
                    process.updateInitialized = false;
                    this.addTextToTerminal(terminalElement.buffer.innerHTML, element, process);
                    terminalElement.buffer.innerHTML = ""
                    process.getProcessElementBody().querySelector('terminal_input > span').style.display = '';
                    return false;
                }
                return false;
            }
            //If enter was pressed do things
            if (event.code.includes('Enter')) {
                let text = element.value;
                if (isTextEmpty(text)) return false;
                terminalElement.main.innerHTML += `${escapeHtml(terminalElement.inputPrefix.innerText)} ${escapeHtml(text)}<br>`;
                text = system.cli.i(text, process);
                terminalElement.inputPrefix.querySelector('span').innerHTML = process.getPrefix()
                process.currentHistoryNumber = -1;
                process.addToCommandHistory(text);
                this.addTextToTerminal(text, element, process)
            } else if (event.code == "ArrowUp") {
                // Go thought the command history just like in a conventional terminal
                process.currentHistoryNumber == -1 && (process.currentCommand = element.value);
                this.getFromCommandHistory(process, +1)
            } else if (event.code == "ArrowDown") {
                this.getFromCommandHistory(process, -1)
            }
        },

        addTextToTerminal: function (text, element, process) {
            let terminalElement = this.InitiateProcessVariables(process);
            element.value = ""; // Clear the input.
            try {
                if (typeof (text) != 'undefined') {
                    //Objects just get stringified
                    if (typeof (text) == 'object') text = JSON.stringify(text)
                    text = escapeHtml(text.toString()).replace(/\n/g, "<br>")//.replaceAll("    ", "&emsp;");
                    terminalElement.main.innerHTML += text + "<br>";
                }
            } catch (e) {
                //Returns error
                terminalElement.main.innerHTML += e + "<br>";
            }
            element.scrollIntoView(false)

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
            headerBorderBottomColor: 'var(--main-color)',
            onlyOneInstanceAllowed: true,
            getHTML: function () {
                let menuItems = Object.entries(apps.settings.layout).map((x) => {
                    [menuItemId, menuItem] = [x[0], x[1]]
                    if (typeof menuItem != 'object') return ''
                    return `<menuItem ${apps.settings.layout.selected == menuItemId && "class='selected'"} onclick='apps.settings.switchToPanel(${menuItemId},false,this)'><${menuItem.iconTag}></${menuItem.iconTag}>${menuItem.name}</menuItem>`
                }).join('');
                return `<settings><sidebarMenu>${menuItems}</sidebarMenu><panel>${apps.settings.switchToPanel(0, true)}</panel></settings>`;
            }
        },

        switchToPanel: function (panelMenuId, onlyGetHTML = false, element) {
            let panelHTML = this.layout[panelMenuId].getPanelHTML();
            if (onlyGetHTML) return panelHTML
            else {
                document.querySelectorAll('settings .selected').forEach(x => x.classList.remove("selected"))
                document.querySelector('settings > panel').innerHTML = panelHTML;
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






