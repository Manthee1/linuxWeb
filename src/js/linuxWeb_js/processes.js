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

    getRunningInstanceAmount: function (appName) {

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
        typeof (this.pid[pid]['onFocus']) == "function" && setTimeout(() => {// If it has a onFocus then.... do that
            //Timeout set in order for the focus to work at all
            this.pid[pid].onFocus();
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

    createWindowSizeProjection: function (process, size) {
        let processElement = process.getProcessElement()
        let top = topBar.offsetHeight;
        let left = 0;
        let width = document.body.offsetWidth
        let height = window.innerHeight - (appList.offsetHeight - topBar.offsetHeight);
        switch (size) {
            case "maximum":// Do nothing. :)

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


        if (typeof document.querySelector(`${size}-wsp`) != "undefined") {
            let style = `
            top:${top}px;
            left:${left}px;
            width:${width}px;
            height:${height}px;
        `
            process.projectedSize = {
                top: top,
                left: left,
                width: width,
                height: height,
            }

            if (system.global.elementExists(document.querySelector('window_size_projection'))) {
                let el = document.querySelector('window_size_projection');
                el.style.cssText = style;
                processElement.insertAdjacentElement('beforebegin', document.querySelector('window_size_projection'));
            } else {
                this.hideWindowSizeProjection(process)
                windowSizeProjectionHTML = `<window_size_projection id='#${size}-wsp' style='${style}' ></window_size_projection>`
                processElement.insertAdjacentHTML('beforebegin', windowSizeProjectionHTML);
            }

        }
    },

    scaleToProjectedSize: function (process) {
        if (system.global.elementExists(process.projectedSize) && !system.global.isObjectEmpty(process.projectedSize))
            this.maximize(process.elementId, process.projectedSize)
        this.hideWindowSizeProjection(process);

    },

    hideWindowSizeProjection: function (process, clearStyle = false) {
        if (clearStyle) {
            process.projectedSize = {}
            el.style.opacity = 0;

            // el.style.transition = 'opacity linear 0.1s'
            // el.style = "opacity:0";
            setTimeout(() => {
                el.style = "opacity:0";
            }, 100);
            return true
        }
        el = document.querySelector('window_size_projection')
        if (system.global.elementExists(el)) {
            if (el.style.cssText == "opacity:0;") return false
            el.id = '';
            process.projectedSize = {}
            el.style.opacity = 0;
            // setTimeout(() => {
            //     el.style.cssText = "opacity:0;";
            // }, 300);
        }
    },

    maximize: function (stringyPID, size = {}) {
        let pid = this.getNumberPid(stringyPID);
        let element = document.querySelector(`#${stringyPID}`);
        this.bringToTop(element);
        if (this.pid[pid].maximized == true) {
            console.log(this.pid[pid].positionBeforeMaximize.y, this.pid[pid].positionBeforeMaximize.x);
            element.style.transition = "all 0.3s ease-in-out";
            element.style.top = this.pid[pid].positionBeforeMaximize.y;
            element.style.left = this.pid[pid].positionBeforeMaximize.x;
            element.style.height = this.pid[pid].sizeBeforeMaximize.height;
            element.style.width = this.pid[pid].sizeBeforeMaximize.width;
            element.querySelector('app_resize').style.display = ''
            this.pid[pid].maximized = false;
        } else {

            this.pid[pid].positionBeforeMaximize = { x: element.style.left, y: element.style.top };
            this.pid[pid].sizeBeforeMaximize = { width: element.clientWidth + "px", height: element.clientHeight + "px" }
            element.style.transition = "all 0.3s ease-in-out";
            if (!system.global.isObjectEmpty(size)) {
                element.style.top = size.top + "px";
                element.style.left = size.left + "px";
                element.style.height = size.height + "px";
                element.style.width = size.width + "px";
            } else {
                element.style.top = topBar.offsetHeight + "px";
                element.style.left = "0px";
                element.style.height = `${window.innerHeight - (appList.offsetHeight - topBar.offsetHeight)}px`;
                element.style.width = `${window.innerWidth}px`;
            }
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

        appCreateData.height < appCreateData.minHeight && (appCreateData.height = appCreateData.minHeight)
        appCreateData.width < appCreateData.minWidth && (appCreateData.width = appCreateData.minWidth)
        position.y == 'default' && (position.y = window.innerHeight / 2 - appCreateData.height / 2)
        position.x == 'default' && (position.x = window.innerWidth / 2 - appCreateData.width / 2)

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
        //Insert the appHTML so that the value fields of inputs and similar don't get wiped.
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
    processMouseDownHandler: function (event, stringyPID, forceRun = false) {
        pid = this.getNumberPid(stringyPID);
        let process = this.pid[pid];
        // if (event.target.tagName == "RESIZE_POINT") {
        //	 document.body.setAttribute('onmousemove', null)
        //	 process.getProcessElementHeader().setAttribute('onmouseup', null)
        // }
        if (((event.target.tagName != "APP_HEADER" && event.target.tagName != "APP_TITLE") && !forceRun)) return false

        if (process.maximized) {
            let mouseY = event.clientY
            let mouseX = event.clientX

            document.body.onmousemove = e => {
                if (Math.abs(mouseY - e.clientY) + Math.abs(mouseX - e.clientX) > 40) {
                    process.maximized = true;
                    let element = process.getProcessElement()
                    element.style.top = e.layerY;

                    document.body.setAttribute('onmousemove', null)
                    let headerStartToMouseDistance = ((e.layerX / element.offsetWidth) * process.sizeBeforeMaximize.width.replace('px', ''))
                    let topOffset = e.clientY
                    let leftOffset = e.clientX - headerStartToMouseDistance
                    process.originalOffsetY = e.layerY;
                    process.originalOffsetX = headerStartToMouseDistance;

                    process.positionBeforeMaximize.x = leftOffset + 'px'
                    process.positionBeforeMaximize.y = topOffset + 'px'
                    element.style.height = process.sizeBeforeMaximize.height;
                    element.style.width = process.sizeBeforeMaximize.width;
                    element.style.top = topOffset + 'px';
                    element.style.left = leftOffset + 'px';
                    process.maximized = false;
                    element.querySelector('app_resize').style.display = ''
                    processes.initiateProcessMouseMoveHandler(process)
                }
            }
            return false
        }

        process.originalOffsetY = event.layerY;
        process.originalOffsetX = event.layerX;

        console.log("click", process.originalOffsetY, process.originalOffsetX);
        this.initiateProcessMouseMoveHandler(process)


    },

    initiateProcessMouseMoveHandler: function (process) {

        document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event,processes.pid['${pid}'])`)
        document.body.onmouseup = () => {
            document.body.setAttribute('onmousemove', null)
            process.getProcessElementHeader().setAttribute('onmouseup', null)
            this.scaleToProjectedSize(process);
            this.hideWindowSizeProjection(process, true)
        }
    },

    processMouseMoveHandler: function (event, process) {
        let mouseY = event.clientY
        let mouseX = event.clientX
        let y = mouseY - process.originalOffsetY;
        let x = mouseX - process.originalOffsetX;
        if (mouseY < topBar.offsetHeight)
            this.createWindowSizeProjection(process, 'maximum')
        else if (mouseX < 30)
            this.createWindowSizeProjection(process, 'left-half')
        else if (mouseX > document.body.offsetWidth - 30)
            this.createWindowSizeProjection(process, 'right-half')
        else
            this.hideWindowSizeProjection(process)
        y = y < topBar.offsetHeight ? topBar.offsetHeight : y; // Cap the position to the topBar height

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
