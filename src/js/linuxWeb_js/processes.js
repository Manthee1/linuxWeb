processes = {

    currentlySelectedProcess: null,

    pid: {},
    getPidObject: function () {
        let obj = {}
        Object.values(this.pid).forEach(x => {
            typeof obj == 'object' && (obj[x.id] = x)
        });
        if (obj == {}) return false
        else return Object.values(obj)
    },
    //Create a pid number
    getNewPid: function () {
        if (Object.entries(this.pid).length == 0)
            return 0;
        else return Number(Object.keys(this.pid).sort().slice(-1)) + 1
    },

    //Convert string pid into pid 'pid0' => 0
    getNumberPid: function (pid) {
        return Number(pid.split('pid')[1])
    },
    //Return the first pid object of the specified app name.
    getFirstPidFormAppName: function (appName) {

        let pidValues = this.getPidObject();
        for (let i = 0; i < pidValues.length; i++) {
            if (pidValues[i].appName == appName) return pidValues[i];
        }
    },

    runningInstanceAmount: function (appName) {

        let amount = 0;
        let pidValues = this.getPidObject()
        for (let i = 0; i < pidValues.length; i++) {
            pidValues[i].appName == appName && amount++
        }
        return amount;
    },
    //Brings the selected app to top
    bringToTop: function (element, event = null) {
        if (event != null && event.target.tagName.endsWith("ICON") && event.target.parentElement.parentElement.tagName == "APP_HEADER") {

            return false

        }
        const pid = this.getNumberPid(element.id);
        typeof (this.pid[pid]['onFocus']) == "function" && this.pid[pid].onFocus(); // If it has a onFocus then.... do that
        if (this.currentlySelectedProcess == this.pid[pid]) return false;
        if (this.pid[pid].minimized == true) {
            element.style.transform = "";
            element.style.opacity = "";
            element.style.display = "";
            this.pid[pid].minimized = false;
        }
        // If it is not currently on top do this
        appsLayer.insertAdjacentElement('beforeend', element) // bring to top
        this.makeProcessResizable("#" + element.id);
        this.currentlySelectedProcess != null && this.currentlySelectedProcess.getProcessBarElement().classList.remove('selected') // removes the selected class from the previous apps progress bar thingy.
        this.pid[pid].getProcessBarElement().classList.add('selected');
        this.currentlySelectedProcess = this.pid[pid];
        // console.log('Focused', this.pid[pid]);
    },

    //Default values for the app createData parameters.
    processSchema: {
        title: "Untitled App",
        titleColor: "inherit",
        bodyColor: "inherit",
        textColor: "inherit",
        headerColor: "var(--main-color);",
        headerBottomColor: "inherit",
        bodyBorderSize: "inherit",
        padding: "inherit",
        opacity: 1,
        HTML: String(),
        height: 300,
        width: 500,
        minHeight: 150,
        minWidth: 150,
        bodyBorder: Boolean(),
        fullHeight: false,
        fullWidth: false,
    },

    maximize: function (stringyPID) {
        let pid = this.getNumberPid(stringyPID);
        let element = document.querySelector(`#${stringyPID}`);
        this.bringToTop(element);
        if (this.pid[pid].maximized == true) {
            element.style.transition = "all 0.5s ease-in-out";
            element.style.top = this.pid[pid].positionBeforeMaximize.y;
            element.style.left = this.pid[pid].positionBeforeMaximize.x;
            element.style.height = this.pid[pid].sizeBeforeMaximize.height;
            element.style.width = this.pid[pid].sizeBeforeMaximize.width;
            element.querySelector('app_resize').style.display = ''
            this.pid[pid].maximized = false;

        } else {
            this.pid[pid].positionBeforeMaximize = { x: element.style.left, y: element.style.top };
            this.pid[pid].sizeBeforeMaximize = { width: element.clientWidth + "px", height: element.clientHeight + "px" }
            element.style.transition = "all 0.5s ease-in-out";
            element.style.top = "27px";
            element.style.left = "0px";
            element.style.height = `${window.innerHeight - 55}px`;
            element.style.width = `${window.innerWidth}px`;
            element.querySelector('app_resize').style.display = 'none'
            this.pid[pid].maximized = true;
        }

        setTimeout(() => {
            element.style.transition = "";
        }, 500);
    },
    minimize: function (stringyPID) {
        let pid = this.getNumberPid(stringyPID);
        let element = document.querySelector(`#${stringyPID}`);
        this.bringToTop(element);
        element.style.transform = "scale(0.5)";
        element.style.opacity = "0"
        this.pid[pid].minimized = true;
        this.currentlySelectedProcess = null;
        this.pid[pid].getProcessBarElement().classList.remove('selected');
        setTimeout(() => {
            element.style.display = 'none';
        }, 500);
    },
    remove: function (stringyPID) {
        let pid = this.getNumberPid(stringyPID);
        // this.pid.splice(this.runningIds.indexOf(pid), 1);
        document.querySelector(`#${stringyPID}`).remove();
        this.pid[pid].getProcessBarElement().remove();
        delete this.pid[pid];
        this.currentlySelectedProcess = null;
    },

    create: function (appName, position = { x: 'default', y: 'default' }) {

        if (apps[appName] == undefined) {
            console.error(`Not Found: App '${appName}' does not exist`)
            return false
        }

        if (apps[appName].createData.onlyOneInstanceAllowed && this.runningInstanceAmount(appName) > 0) {
            let message = `One instance of App: '${appName}' already running!`
            this.bringToTop(this.getFirstPidFormAppName(appName).getProcessElement());
            X.prompt.create(message, 'warn');
            // console.warn(message)
            return false
        }

        let processID = processes.getNewPid();
        let stringyPID = "pid" + processID;
        let appCreateData = {};


        Object.assign(appCreateData, this.processSchema)
        Object.assign(appCreateData, apps[appName].createData)

        // Object.entries(this.processSchema).forEach(entry => {
        //     //If a The app doesn't have have a defined parameter in the createData
        //     //that is defined in processSchema then we just grab that one. 'Cause its the default.
        //     if (!appCreateData[entry[0]] == undefined || typeof (appCreateData[entry[0]]) != typeof (entry[1])) {
        //         appCreateData[entry[0]] = entry[1];
        //     }
        //     // !system.global.isValid(entry[1]) && (appCreateData[entry[0]] = "");
        // })
        appCreateData.height < appCreateData.minHeight && (appCreateData.height = appCreateData.minHeight)
        appCreateData.width < appCreateData.minWidth && (appCreateData.width = appCreateData.minWidth)
        position.y == 'default' && (position.y = window.innerHeight / 2 - appCreateData.height / 2)
        position.x == 'default' && (position.x = window.innerWidth / 2 - appCreateData.width / 2)
        console.log(appCreateData.height, appCreateData.width, position);
        //Then styles are used here
        let containerStyles = `
			min-height:${appCreateData.minHeight}px;
            min-width:${appCreateData.minWidth}px;
            z-Index: 4;
		`;
        let bodyStyles = `
			background-color:${appCreateData.bodyColor};
			color:${appCreateData.textColor};
			margin:${(appCreateData.bodyBorder && appCreateData.bodyBorderSize) || '0px'};
			height:${(appCreateData.fullHeight && "100%") || "auto"};
			width:${(appCreateData.fullWidth && "100%") || "auto"};
			opacity: ${appCreateData.opacity};
			padding: ${appCreateData.padding};
        `;
        let headerStyles = `
            color: ${appCreateData.titleColor};
            background-color:${appCreateData.headerColor};
            border-bottom: 1px solid ${appCreateData.headerBottomColor};
        `;
        //This is how the html is created. read
        appsLayer.innerHTML += `
			<app_container onmousedown="processes.bringToTop(this,event)" id='${stringyPID}' style = "top: ${position.y}px;left: ${position.x}px;${containerStyles}" >
				<app_header style="${headerStyles}opacity:1;" onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')" >
					${appCreateData.title}
					<app_minimize onclick="processes.minimize('${stringyPID}')"><minus_icon></minus_icon></app_minimize>
					<app_maximize onclick="processes.maximize('${stringyPID}')"><square_icon></square_icon></app_maximize>
					<app_exit onclick="processes.remove('${stringyPID}')"><x_icon></x_icon></app_exit>
				</app_header>
				<app_body style="${bodyStyles}">
					${appCreateData.getHTML()}
				</app_body>
				<app_resize>
					<resize_point class='bottom-right'></resize_point>
					<resize_point class='bottom-left'></resize_point>
					<resize_point class='top-right'></resize_point>
					<resize_point class='top-left'></resize_point>

					<resize_point class='top'></resize_point>
					<resize_point class='left'></resize_point>
					<resize_point class='right'></resize_point>
					<resize_point class='bottom'></resize_point>
					</app_resize>

				</app_container>
			
		`;

        appList.innerHTML += `<process onclick="processes.bringToTop(document.querySelector('#${stringyPID}'))" id='appListPID${processID}'>${appCreateData.title}</process>`
        processes.pid[processID] = {}

        //Assign the createDate.methods object to the root of the apps pid object.
        Object.assign(processes.pid[processID], appCreateData.methods)

        Object.assign(processes.pid[processID], {
            id: processID,
            elementId: stringyPID,
            appName: appName,
            minimized: false,
            maximized: false,
            positionBeforeMaximize: { x: position.x, y: position.y },
            sizeBeforeMaximize: { width: appCreateData.width, height: appCreateData.height },
            originalOffsetY: 0,
            originalOffsetX: 0,
            getProcessElement: function () { return document.querySelector(`#${this.elementId}`) },
            getProcessElementBody: function () { return document.querySelector(`#${this.elementId}>app_body`) },
            getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
            getProcessBarElement: function () { return document.querySelector(`#appListPID${this.id}`) },
        });
        this.makeProcessResizable("#" + processes.pid[processID].elementId);
        this.bringToTop(processes.pid[processID].getProcessElement())
        apps[appName].onStart != undefined && apps[appName].onStart(processes.pid[processID])
        appCreateData = {};

        return true;
    },

    //Handles window movement. so yeah.
    processMouseDownHandler: function (event, stringyPID) {
        pid = this.getNumberPid(stringyPID);
        if (event.target.tagName != "APP_HEADER" || this.pid[pid].maximized) return false
        let process = this.pid[pid];
        // console.log(event, stringyPID, event.target.tagName, this.pid[pid].maximized, this.pid[pid]);
        process.originalOffsetY = event.offsetY;
        process.originalOffsetX = event.offsetX;
        document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event,processes.pid['${pid}'])`)
        process.getProcessElementHeader().onmouseup = () => {
            document.body.onmousemove = null;
            process.getProcessElementHeader().onmouseup = null;
        }
    },

    processMouseMoveHandler: function (event, process) {
        // console.log(event, process);
        // console.log(event, pid);
        var y = event.clientY - process.originalOffsetY;
        var x = event.clientX - process.originalOffsetX;
        process.getProcessElement().style.top = y + "px";
        process.getProcessElement().style.left = x + "px";
    },

    makeProcessResizable: function (cssSelector) {
        //Thanks to Hung Nguyen for this code. (I modified simplified it a little) Original: https://codepen.io/ZeroX-DG/pen/vjdoYe

        //Makes a element resizable. (Note: Not any element. Has to have resize points!)
        const element = document.querySelector(cssSelector);
        const resizePoints = document.querySelectorAll(cssSelector + ' resize_point')
        const minimum_size_x = element.style.minWidth.replace('px', '') || 150;
        const minimum_size_y = element.style.minHeight.replace('px', '') || 150;

        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;
        resizePoints.forEach(x => {
            x.addEventListener('mousedown', function (e) {
                e.preventDefault()
                original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                console.log(original_width, original_height);
                original_x = element.getBoundingClientRect().left;
                original_y = element.getBoundingClientRect().top;
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                window.addEventListener('mousemove', resize)
                window.addEventListener('mouseup', stopResize)
            })
            function resize(e) {
                // Easy to understand. besides it's not really gonna change so this is gonna probably be the final version of this snippet
                // No point in trying to understand it then
                const resizeClassList = x.classList.toString()
                if (resizeClassList.includes('top')) {
                    const height = original_height - (e.pageY - original_mouse_y)
                    if (height > minimum_size_y) {
                        element.style.height = height + 'px'
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                } else if (resizeClassList.includes('bottom')) {
                    const height = original_height + (e.pageY - original_mouse_y)
                    if (height > minimum_size_y) {
                        element.style.height = height + 'px'
                    }
                }
                if (resizeClassList.includes('left')) {
                    const width = original_width - (e.pageX - original_mouse_x)
                    if (width > minimum_size_x) {
                        element.style.width = width + 'px'
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                } else if (resizeClassList.includes('right')) {
                    const width = original_width + (e.pageX - original_mouse_x)
                    if (width > minimum_size_x) {
                        element.style.width = width + 'px'
                    }
                }
            }
            function stopResize() {
                window.removeEventListener('mousemove', resize)
            }
        })
    }
}
