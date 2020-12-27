apps = {

    terminal: {
        name: "linuxWeb Terminal",
        path: "apps.terminal",
        version: "1.0.4",

        createData: {
            title: "JS Terminal",
            bodyColor: "black",
            textColor: "white",
            bodyBorder: false,
            bodyBorderSize: '0px',
            opacity: '0.9',
            padding: "10px 5px",
            HTML: `
				<terminal_main >Linux terminal version 1.0.3<br></terminal_main>
				<terminal_input >LinuxWeb@root:-$<input type=text></terminal_input>
				`,
            methods: {
                commandHistory: [],
                currentHistoryNumber: -1,
                currentCommand: "",
                onFocus: function () {
                    // let terminalBody = this.getProcessElementBody()
                    //Timeout set in order for the focus to work at all
                    setTimeout(() => {
                        let focusElement = this.getProcessElementBody().querySelector('terminal_input > input')
                        console.log(document.activeElement, focusElement);
                        document.activeElement != focusElement && focusElement.focus();
                    }, 1);
                },
                addToCommandHistory: function (commandToPush) {
                    this.commandHistory.length > 30 && this.commandHistory.pop();
                    this.commandHistory.unshift(commandToPush);
                },
            }
        },

        InitiateVariables: function (processInstance = null) {
            if (processInstance == null) return false;
            return {
                body: processInstance.getProcessElementBody(),
                main: processInstance.getProcessElementBody().querySelector('terminal_main'),
                inputPrefix: processInstance.getProcessElementBody().querySelector('terminal_input'),
                input: terminalInput = processInstance.getProcessElementBody().querySelector('terminal_input > input')
            }
        },

        onStart: function (processInstance) {
            console.log("onStart Initialized: ", processInstance);
            terminalElement = this.InitiateVariables(processInstance);
            terminalElement.input.setAttribute('onkeydown', this.path + `.parseCommand(event,this,processes.pid[${processInstance.id}])`)
        },

        parseCommand: async function (event, element, processInstance) {
            if (event.code == 'Enter') {
                terminalElement = this.InitiateVariables(processInstance);
                text = element.value;
                element.value = "";
                terminalElement.main.innerHTML += `${system.global.escapeHtml(terminalElement.inputPrefix.innerText)} ${system.global.escapeHtml(text)}<br>`;
                try {
                    commandExecuted = eval(text);
                    if (typeof (commandExecuted) != 'undefined') {
                        if (typeof (commandExecuted) != 'object') {
                            commandExecuted = system.global.escapeHtml(commandExecuted.toString()).replace(/\n/g, "<br>");
                        } else commandExecuted = text
                        terminalElement.main.innerHTML += commandExecuted + "<br>";
                    }
                } catch (e) {
                    terminalElement.main.innerHTML += e + "<br>";
                }
                processInstance.addToCommandHistory(text);
                element.scrollIntoView(false)
            } else if (event.code == "ArrowUp") {
                processInstance.currentHistoryNumber == -1 && (processInstance.currentCommand = element.value);
                this.getFromCommandHistory(processInstance, +1)
            } else if (event.code == "ArrowDown") {
                this.getFromCommandHistory(processInstance, -1)
            }
        },
        getFromCommandHistory: function (processInstance, val) {//go up||down a number in history
            let command = processInstance.commandHistory[processInstance.currentHistoryNumber + val];
            if (processInstance.currentHistoryNumber + val < -1) return false
            if (command != undefined) {
                terminalElement = apps.terminal.InitiateVariables(processInstance);
                terminalElement.input.value = command
                processInstance.currentHistoryNumber = processInstance.currentHistoryNumber + val
            } else if (processInstance.currentHistoryNumber > processInstance.currentHistoryNumber + val) {
                terminalElement = apps.terminal.InitiateVariables(processInstance);
                terminalElement.input.value = processInstance.currentCommand;
                processInstance.currentHistoryNumber = -1;

            }
        },
    },



    linuxWeb: {
        name: "linuxWeb Websites",

        createData: {
            title: "linuxWeb",
            fullHeight: true,
            fullWidth: true,
            minWidth: 1000,
            minHeight: 500,
            HTML: `<iframe style='height:100%;' src="http://127.0.0.1:5500/"></iframe>`,

        }
    },

    google: {
        name: "Google Websites",

        createData: {
            title: "Google Search",
            fullHeight: true,
            fullWidth: true,
            minWidth: 1000,
            minHeight: 500,
            HTML: `<iframe style='height:100%;' src="https://www.google.com/webhp?igu=1"></iframe>`
        }

    }
}