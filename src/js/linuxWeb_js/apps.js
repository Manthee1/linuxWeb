apps = {

    terminal: {
        //Saddle up for this one. 
        name: "linuxWEB Terminal",
        path: "apps.terminal",
        version: "1.0.4",
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
                <terminal_main >linuxWEB terminal version 1.0.3<br></terminal_main>
				<terminal_input >linuxWEB@root:-$ <input type=text></terminal_input>
				`},
            methods: {
                // Everything here gets aded to the pid object of the app.
                // So every terminal has its own separate 'commandHistory', 'addToCommandHistory()'
                commandHistory: [],
                currentHistoryNumber: -1,
                currentCommand: "",
                //This is executed by processes.bringToTop(); When the app is clicked on.
                onFocus: function () {
                    let focusElement = this.getProcessElementBody().querySelector('terminal_input > input')
                    document.activeElement != focusElement && focusElement.focus();
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
        InitiateVariables: function (processInstance = null) {
            if (processInstance == null) return false;
            return {
                body: processInstance.getProcessElementBody(),
                main: processInstance.getProcessElementBody().querySelector('terminal_main'),
                inputPrefix: processInstance.getProcessElementBody().querySelector('terminal_input'),
                input: terminalInput = processInstance.getProcessElementBody().querySelector('terminal_input > input')
            }
        },
        //Executed once when the terminal is created
        //Adds a listener for keypress.  
        onStart: function (processInstance) {
            console.log("onStart Initialized: ", processInstance);
            terminalElement = this.InitiateVariables(processInstance);
            terminalElement.input.setAttribute('onkeydown', this.path + `.parseCommand(event,this,processes.pid[${processInstance.id}])`)
        },
        parseCommand: async function (event, element, processInstance) {
            //If enter was pressed do things
            if (event.code.includes('Enter')) {
                let terminalElement = this.InitiateVariables(processInstance);
                let text = element.value;
                element.value = "";
                //system.global.escapeHtml() - make string not html. understood?... Good!
                terminalElement.main.innerHTML += `${system.global.escapeHtml(terminalElement.inputPrefix.innerText)} ${system.global.escapeHtml(text)}<br>`;
                try {
                    processInstance.currentHistoryNumber = -1;
                    // If eval return nothing then just don't return it to the terminal
                    // let commandExecuted = eval(`(async()=>{${text}})();`);

                    // let commandExecuted = eval(text);
                    commandExecuted = system.cli.i(text);
                    console.log(commandExecuted);
                    if (typeof (commandExecuted) != 'undefined') {
                        //Objects just get outputted as they were written
                        if (typeof (commandExecuted) == 'object')
                            commandExecuted = JSON.stringify(commandExecuted)
                        commandExecuted = system.global.escapeHtml(commandExecuted.toString()).replace(/\n/g, "<br>").replaceAll("    ", "&emsp;");
                        terminalElement.main.innerHTML += commandExecuted + "<br>";
                    }

                } catch (e) {
                    //Returns error
                    terminalElement.main.innerHTML += e + "<br>";
                }
                processInstance.addToCommandHistory(text);
                element.scrollIntoView(false)
            } else if (event.code == "ArrowUp") {
                // Go thought the command history just like in a conventional terminal
                processInstance.currentHistoryNumber == -1 && (processInstance.currentCommand = element.value);
                this.getFromCommandHistory(processInstance, +1)
            } else if (event.code == "ArrowDown") {
                this.getFromCommandHistory(processInstance, -1)
            }
        },
        getFromCommandHistory: function (processInstance, val) {
            // Go Up||Down a number in the commandHistory array, val=-1 or 1
            let command = processInstance.commandHistory[processInstance.currentHistoryNumber + val];
            if (processInstance.currentHistoryNumber + val < -1) return false
            terminalElement = apps.terminal.InitiateVariables(processInstance);
            if (command != undefined) {
                // If there is a command in the history then do that. Yeah...
                terminalElement.input.value = command;
                processInstance.currentHistoryNumber = processInstance.currentHistoryNumber + val;
            } else if (processInstance.currentHistoryNumber > processInstance.currentHistoryNumber + val) {
                // If command is undefined and you you went down in history then: current command
                terminalElement.input.value = processInstance.currentCommand;
                processInstance.currentHistoryNumber = -1;
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
            headerBottomColor: 'var(--main-color-b)',
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






