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
    getFirstPidFromAppName: function (appName) {
        let pidValues = this.getPidObject();
        for (let i = 0; i < pidValues.length; i++) {
            if (pidValues[i].appName == appName) return pidValues[i];
        }
    },

    getRunningInstanceList: function (appName) {
        let pidObject = this.getPidObject()
        processesList = []
        for (process of pidObject) {
            if (process.appName == appName)
                processesList.push(process)
        }
        if (processesList.length == 0) return false
        return processesList
    },

    getRunningInstanceAmount: function (appName) {

        return this.getRunningInstanceList(appName).length

    },
    //Brings the selected app to top
    bringToTop: function (element, event = null) {
        if (event != null && event.target.tagName.endsWith("ICON") && event.target.parentElement.parentElement.tagName == "APP_HEADER") return false

        const pid = this.getNumberPid(element.id);
        typeof this.pid[pid]['onFocus'] == "function" && setTimeout(() => {// If it has a onFocus then.... do that
            //Timeout set in order for the focus to work at all
            typeof this.pid[pid] != "undefined" && this.pid[pid].onFocus();
        }, 1);
        if (this.currentlySelectedProcess == this.pid[pid]) return false;
        if (this.pid[pid].minimized == true) {
            element.style.transform = "";
            element.style.opacity = "";
            element.style.display = "";
            this.pid[pid].minimized = false;
        }
        // If it is not currently on top do this
        appsContainer.insertAdjacentElement('beforeend', element) // bring to top
        this.makeProcessResizable("#" + element.id);
        this.currentlySelectedProcess != null && this.currentlySelectedProcess.getProcessBarElement().classList.remove('selected') // removes the selected class from the previous apps progress bar thingy.
        this.pid[pid].getProcessBarElement().classList.add('selected');
        this.currentlySelectedProcess = this.pid[pid];
    },

    //Default values for the app createData parameters.
    processSchema: {
        title: "Untitled App",
        titleColor: "",
        bodyColor: "",
        textColor: "",
        headerColor: "",
        headerBorderBottomColor: "transparent",
        bodyBorderSize: "",
        padding: "",
        additionalBodyCss: "",
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

    createWindowSizeProjection: function (process, fillType = "full") {
        if (isDefined(document.querySelector(`${fillType}-wsp`))) return false
        let processElement = process.getProcessElement();
        let top = topBar.offsetHeight;
        let left = 0;
        let width = document.body.offsetWidth
        let height = window.innerHeight - (appList.offsetHeight + topBar.offsetHeight);

        switch (fillType) {
            case "full":// Do nothing. :)
                break;
            case "left-half":
                width = document.body.offsetWidth / 2
                break;
            case "right-half":
                width = document.body.offsetWidth / 2
                left = document.body.offsetWidth / 2;
                break;
            default:
                break;
        }

        let style = `
            top:${top}px;
            left:${left}px;
            width:${width}px;
            height:${height}px;
        `
        process.fillType = fillType
        process.projectedFill = {
            top: top,
            left: left,
            width: width,
            height: height,
        }

        if (isDefined(document.querySelector('window_size_projection'))) {
            let el = document.querySelector('window_size_projection');
            el.style.cssText = style;
            processElement.insertAdjacentElement('beforebegin', document.querySelector('window_size_projection'));

        } else {
            this.hideWindowFillProjection(process)
            windowSizeProjectionHTML = `<window_size_projection id='#${fillType}-wsp' style='${style}' ></window_size_projection>`
            processElement.insertAdjacentHTML('beforebegin', windowSizeProjectionHTML);
        }
    },

    // Well this one is tricky. Very hard to understand
    // Nobody to this day knows the true meaning of how this method works.
    // It is said that solving it would grant the puzzler eternal... something.
    // Or maybe I'm just wasting your time ;)
    scaleToProjectedFill: function (process) {
        if (!isObjectEmpty(process.projectedFill))
            if (process.fillType == 'full') {
                this.maximize(process.elementId);
            } else
                this.scaleToFillArea(process.elementId, process.projectedFill);

        this.hideWindowFillProjection(process);

    },

    // Hide the blue fill area projection thingy. Simple...
    hideWindowFillProjection: function (process, clearStyle = false) {
        el = document.querySelector('window_size_projection')
        if (isDefined(el)) {
            if (clearStyle) {
                process.projectedFill = {}
                el.style.opacity = 0;
                setTimeout(() => {
                    el.style = "opacity:0";
                }, 100);
                return true
            }
            if (el.style.cssText == "opacity:0;") return false
            process.projectedFill = {}
            el.style.opacity = 0;
        }
    },

    //Scale an app to fill the specified area.
    scaleToFillArea: function (stringyPID, fillData = {}) {
        let pid = this.getNumberPid(stringyPID);
        let element = document.querySelector(`#${stringyPID}`);
        let process = this.pid[pid];
        this.bringToTop(element);

        if (process.scaledToArea && isObjectEmpty(fillData)) {
            let top = process.positionBeforeMaximize.y;
            let left = process.positionBeforeMaximize.x;
            let height = process.sizeBeforeMaximize.height;
            let width = process.sizeBeforeMaximize.width;
            let maxHeight = window.innerHeight - appList.offsetHeight
            let maxWidth = window.innerWidth
            //Correct the position of the app if it's outside the screen.
            // So when you unmaximize the app it won't appear partially outside the screen.
            if (top + height > maxHeight)
                top -= (top + height) - maxHeight
            if (left + width > maxWidth)
                left -= (left + width) - maxWidth
            element.style.top = top + 'px';
            element.style.left = left + 'px';
            element.style.height = process.sizeBeforeMaximize.height + 'px';
            element.style.width = process.sizeBeforeMaximize.width + 'px';
            element.querySelector('app_resize').style.display = ''
            process.maximized = false;
            process.scaledToArea = false
        } else {
            //Makes sure to only save a size/position when an app is not currently scaled
            if (!process.scaledToArea) {
                console.log("saved area");
                process.positionBeforeMaximize = { x: Number(element.style.left.replace('px', '')), y: Number(element.style.top.replace('px', '')) };
                process.sizeBeforeMaximize = { width: element.clientWidth, height: element.clientHeight }
            }
            process.scaledToArea = true
            element.style.transition = "all 0.2s ease-in-out";
            element.style.top = fillData.top + "px";
            element.style.left = fillData.left + "px";
            element.style.height = fillData.height + "px";
            element.style.width = fillData.width + "px";
        }
        setTimeout(() => {
            element.style.transition = "";
        }, 200);
    },
    // Set maximum size and offload the scaling to scaleToFillArea()
    // This method makes sure that you still maximize an app even if it already fills a different area. Otherwise it would just unmaximize
    maximize: function (stringyPID) {
        let pid = this.getNumberPid(stringyPID);
        let element = document.querySelector(`#${stringyPID}`);
        let process = this.pid[pid];
        this.bringToTop(element);
        if (process.maximized == true) {
            // Unmaximize
            element.style.transition = "all 0.2s ease-in-out";
            process.scaledToArea = true
            this.scaleToFillArea(stringyPID, {})
        } else {
            // Maximize
            fillData = {
                "top": topBar.offsetHeight,
                "left": 0,
                "height": window.innerHeight - (appList.offsetHeight + topBar.offsetHeight),
                "width": window.innerWidth,
            }
            process.maximized = true;
            this.scaleToFillArea(stringyPID, fillData)
        }
    },
    //Play a scale down animation and hide the app
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
    // Another hard one to understand. Or maybe not? probably.
    remove: function (stringyPID) {
        let pid = this.getNumberPid(stringyPID);
        const process = this.pid[pid]
        const el = document.querySelector(`#${stringyPID}`);
        process.getProcessBarElement().remove();
        delete this.pid[pid];
        this.currentlySelectedProcess = null;
        el.style.transition = "all 0.2s linear";
        el.style.transform = "scale(0.8)";
        el.style.opacity = "0";

        setTimeout(() => {
            el.remove()
        }, 200);

    },

    create: function (appName, position = { x: 'default', y: 'default' }) {
        //If the app doesn't exists.
        if (apps[appName] == undefined) {
            console.error(`Not Found: App '${appName}' does not exist`)
            return false
        }

        //If an app is already open and onlyOneInstanceAllowed then just focus on it
        if (apps[appName].createData.onlyOneInstanceAllowed && this.getRunningInstanceAmount(appName) > 0) {
            let message = `One instance of App: '${appName}' already running!`
            this.bringToTop(this.getFirstPidFormAppName(appName).getProcessElement());
            return false
        }

        let processID = processes.getNewPid();
        let stringyPID = "pid" + processID;
        let appCreateData = {};


        Object.assign(appCreateData, this.processSchema)
        Object.assign(appCreateData, apps[appName].createData)

        // Make sure the size and position is good
        appCreateData.height < appCreateData.minHeight && (appCreateData.height = appCreateData.minHeight)
        appCreateData.width < appCreateData.minWidth && (appCreateData.width = appCreateData.minWidth)
        position.y == 'default' && (position.y = window.innerHeight / 2 - appCreateData.height / 2) + "px"
        position.x == 'default' && (position.x = window.innerWidth / 2 - appCreateData.width / 2) + "px"

        //Then styles are defined here
        let containerStyles = `
			min-height:${appCreateData.minHeight}px;
			min-width:${appCreateData.minWidth}px;
		`;
        let bodyStyles = `
			background-color:${appCreateData.bodyColor};
			color:${appCreateData.textColor};
			margin:${(appCreateData.bodyBorder && appCreateData.bodyBorderSize) || '0px'};
			height:${(appCreateData.fullHeight && "100%") || "auto"};
			width:${(appCreateData.fullWidth && "100%") || "auto"};
			opacity: ${appCreateData.opacity};
			padding: ${appCreateData.padding};
			${appCreateData.additionalBodyCss}
		`;
        let headerStyles = `
			color: ${appCreateData.titleColor};
			background-color:${appCreateData.headerColor};
			border-bottom: 1px solid ${appCreateData.headerBorderBottomColor};
		`;

        //This is how the app html is created.
        appHTML = `
			<app_container onmousedown="processes.bringToTop(this,event)" id='${stringyPID}' style = "top: ${position.y}px;left: ${position.x}px;${containerStyles}" >
				<app_header style="${headerStyles}opacity:1;" onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')" >
					<app_title onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')">${appCreateData.title}</app_title>
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
        //Insert the appHTML so that the value fields of inputs and similar elements don't get wiped.
        appsContainer.insertAdjacentHTML('beforeend', appHTML);

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
            scaledToArea: false,
            positionBeforeMaximize: { x: position.x, y: position.y },
            sizeBeforeMaximize: { width: appCreateData.width, height: appCreateData.height },
            originalOffsetY: 0,
            originalOffsetX: 0,
            getProcessElement: function () { return document.querySelector(`#${this.elementId}`) },
            getProcessElementBody: function () { return document.querySelector(`#${this.elementId}>app_body`) },
            getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
            getProcessBarElement: function () { return document.querySelector(`#appListPID${this.id}`) },
        });

        let element = document.querySelector("#" + processes.pid[processID].elementId)

        this.makeProcessResizable("#" + processes.pid[processID].elementId);
        X.general.addDoubleClickListener(element, () => { processes.maximize(stringyPID) })
        this.bringToTop(processes.pid[processID].getProcessElement())

        apps[appName].onStart != undefined && apps[appName].onStart(processes.pid[processID])
        appCreateData = {};
        return true;
    },

    //Handles window movement. so yeah.
    processMouseDownHandler: function (event, stringyPID, forceRun = false) {
        pid = this.getNumberPid(stringyPID);
        let process = this.pid[pid];
        // if (event.target.tagName == "RESIZE_POINT") {
        //	 document.body.setAttribute('onmousemove', null)
        //	 process.getProcessElementHeader().setAttribute('onmouseup', null)
        // }
        if (((event.target.tagName != "APP_HEADER" && event.target.tagName != "APP_TITLE") && !forceRun)) return false
        if (process.maximized || process.scaledToArea) {
            let mouseY = event.clientY
            let mouseX = event.clientX

            document.body.onmousemove = e => {
                if (Math.abs(mouseY - e.clientY) + Math.abs(mouseX - e.clientX) > 40) {

                    let element = process.getProcessElement()
                    element.style.top = e.layerY;
                    document.body.setAttribute('onmousemove', null)

                    // Calculate the position of the app window based on your cursors position.
                    // So that the it doesn't return to it's previous location where your cursor is not present 
                    // And keep your cursors relative app header left offset 
                    let headerStartToMouseDistance = ((e.layerX / element.offsetWidth) * process.sizeBeforeMaximize.width)
                    let topOffset = e.clientY
                    let leftOffset = e.clientX - headerStartToMouseDistance
                    process.positionBeforeMaximize.x = leftOffset
                    process.positionBeforeMaximize.y = topOffset

                    process.scaledToArea = true;
                    processes.scaleToFillArea(stringyPID, {})
                    processes.initiateProcessMouseMoveHandler(process, e.layerY, headerStartToMouseDistance)
                }
            }
            return false
        }
        this.initiateProcessMouseMoveHandler(process, event.layerY, event.layerX)
    },

    //Starts the mouse move handler.
    initiateProcessMouseMoveHandler: function (process, originalOffsetY, originalOffsetX) {
        process.originalOffsetY = originalOffsetY;
        process.originalOffsetX = originalOffsetX;
        document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event,processes.pid['${pid}'])`)
        document.body.onmouseup = () => {
            if (isDefined(process.getProcessElementHeader())) {
                document.body.setAttribute('onmousemove', null)
                process.getProcessElementHeader().setAttribute('onmouseup', null)
                this.scaleToProjectedFill(process);
                this.hideWindowFillProjection(process, true)
            } else document.body.onmouseup = null
        }
    },
    //Mainly moves the app window 
    processMouseMoveHandler: function (event, process) {
        let mouseY = event.clientY
        let mouseX = event.clientX
        let y = mouseY - process.originalOffsetY;
        let x = mouseX - process.originalOffsetX;

        //Check if the mouse is at any of the 'scale to area' locations
        if (mouseY < topBar.offsetHeight)
            this.createWindowSizeProjection(process, 'full')
        else if (mouseX < 30)
            this.createWindowSizeProjection(process, 'left-half')
        else if (mouseX > document.body.offsetWidth - 30)
            this.createWindowSizeProjection(process, 'right-half')
        else
            this.hideWindowFillProjection(process)
        //Caps the apps top position to the top_bar's height.
        // Very understandable I think.
        y = y < topBar.offsetHeight ? topBar.offsetHeight : y; // Cap the position to the topBar height

        process.getProcessElement().style.top = y + "px";
        process.getProcessElement().style.left = x + "px";
    },

    makeProcessResizable: function (cssSelector) {
        //Thanks to Hung Nguyen for this code. (I simplified it a little) Original: https://codepen.io/ZeroX-DG/pen/vjdoYe

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

                // Well I was wrong. It was changed And it wil lbe changed. Idk what but it will.
                const resizeClassList = x.classList.toString()
                let height = 0;
                let width = 0;
                if (resizeClassList.includes('top')) {
                    height = original_height - (e.pageY - original_mouse_y)
                    if (height > minimum_size_y && height <= window.innerHeight) {
                        element.style.height = height + 'px'
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                } else if (resizeClassList.includes('bottom')) {
                    height = original_height + (e.pageY - original_mouse_y)
                    if (height > minimum_size_y && height <= window.innerHeight) {
                        element.style.height = height + 'px'
                    }
                }
                if (resizeClassList.includes('left')) {
                    width = original_width - (e.pageX - original_mouse_x)
                    if (width > minimum_size_x && width <= window.innerWidth) {
                        element.style.width = width + 'px'
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                } else if (resizeClassList.includes('right')) {
                    width = original_width + (e.pageX - original_mouse_x)
                    if (width > minimum_size_x && width <= window.innerWidth) {
                        element.style.width = width + 'px'
                    }
                }
                if (height >= window.innerHeight) {
                    element.style.height = window.innerHeight
                }
                if (width >= window.innerWidth) {
                    element.style.width = window.innerWidth
                }
            }
            function stopResize() {
                document.body.setAttribute('onmousemove', null)
                window.removeEventListener('mousemove', resize)
            }
        })
    }
}

