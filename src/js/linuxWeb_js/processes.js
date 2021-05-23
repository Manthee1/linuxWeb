processes = {

    currentlySelectedProcess: null,
    pidPositionsIndex: { x: [], y: [] },
    pid: {},
    //Returns processes.pid. if empty returns false
    getPidObject: function () {
        let obj = {}
        Object.values(this.pid).forEach(x => {
            typeof obj == 'object' && (obj[x.id] = x)
        });
        if (isObjectEmpty(obj)) return false
        else return Object.values(obj)
    },

    //Returns a unused pid id num
    getNewPid: function () {
        if (isObjectEmpty(this.pid))
            return 0;
        else return Object.keys(this.pid).map(x => Number(x)).sort((a, b) => a - b).slice(-1)[0] + 1
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

    // Returns all the instances of the specified app name
    getRunningInstanceList: function (appName) {
        let pidObject = this.getPidObject();
        if (isObjectEmpty(pidObject)) return false
        let processesList = [];
        for (process of pidObject) {
            if (process.appName == appName) processesList.push(process);
        }
        if (processesList.length == 0) return false
        return processesList
    },
    // Returns the amount of running instances of the given app name
    getRunningInstanceAmount: function (appName) {
        return this.getRunningInstanceList(appName).length
    },
    //Brings the selected app to top
    bringToTop: function (element, event = null) {
        if (event != null && event.target.tagName.endsWith("ICON")) return false

        const pid = this.getNumberPid(element.id);

        if (this.currentlySelectedProcess == this.pid[pid]) return false;
        // If it has a onFocus then.... do that
        isFunction(this.pid[pid]['onFocus']) && setTimeout(() => {
            //Timeout set in order for the focus to work at all
            this.pid[pid].onFocus(event);
        }, 1);
        // If it is minimized then unminimize it 
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
    //Projects where the window will scale to.
    createWindowSizeProjection: function (process, fillType = "full") {
        // if (isDefined(document.querySelector(`#windowSizeProjection[data-fill-type="${fillType}-wsp"]`))) return false
        let processElement = process.getProcessElement();
        let top = topBar.offsetHeight;
        let left = 0;
        let width = document.body.offsetWidth
        let height = window.innerHeight - (appList.offsetHeight + topBar.offsetHeight);

        //Defines the width and height of the Projection
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
        // Put position and size into a style and an obj
        let style = `
            top:${top}px;
            left:${left}px;
            width:${width}px;
            height:${height}px;`

        process.fillType = fillType
        process.projectedFill = {
            top: top,
            left: left,
            width: width,
            height: height,
        }
        //If '#windowSizeProjection' exists just change it's style. else create it
        if (isDefined(document.querySelector('#windowSizeProjection'))) {
            let el = document.querySelector('#windowSizeProjection');
            el.style.cssText = style;
            el.setAttribute('data-fill-type', `${fillType}-wsp`)
            processElement.insertAdjacentElement('beforebegin', document.querySelector('#windowSizeProjection'));
        } else {
            this.hideWindowFillProjection(process)
            let WSPHTML = `<div id='windowSizeProjection' data-fill-type='${fillType}-wsp' style='${style}'></div>`
            processElement.insertAdjacentHTML('beforebegin', WSPHTML);
        }
    },

    // Well this one is tricky. Very hard to understand
    // Nobody to this day knows the true meaning of how this method works.
    // It is said that solving it would grant the puzzler eternal... something.
    // Or maybe I'm just wasting your time ;)
    scaleToProjectedFill: function (process) {
        if (!isObjectEmpty(process.projectedFill))
            if (process.fillType == 'full') this.maximize(process.elementId);
            else this.scaleToFillArea(process.elementId, process.projectedFill);
        this.hideWindowFillProjection(process);
    },

    // Hide the blue fill area projection thingy. Simple...
    hideWindowFillProjection: function (process, clearStyle = false) {
        const el = document.querySelector('#windowSizeProjection')
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

        //A lot of calculations i guess...
        if (process.scaledToArea && isObjectEmpty(fillData)) { //If scaled then descale
            let top = process.positionBeforeMaximize.y;
            let left = process.positionBeforeMaximize.x;
            let height = process.sizeBeforeMaximize.height;
            let width = process.sizeBeforeMaximize.width;
            let maxHeight = window.innerHeight - appList.offsetHeight
            let maxWidth = window.innerWidth
            //Correct the position of the app if it's outside the screen.
            // So when you unmaximize the app it won't appear partially outside the screen.
            if (top + height > maxHeight) top -= (top + height) - maxHeight
            if (left + width > maxWidth) left -= (left + width) - maxWidth
            if (top < topBar.offsetHeight) top = topBar.offsetHeight
            if (left < 0) left = 0

            element.style.top = top + 'px';
            element.style.left = left + 'px';
            element.style.height = process.sizeBeforeMaximize.height + 'px';
            element.style.width = process.sizeBeforeMaximize.width + 'px';
            element.querySelector('app_resize').style.display = ''
            process.maximized = false;
            process.scaledToArea = false
        } else if (!isObjectEmpty(fillData)) {
            //Makes sure to only save a size/position when an app is not currently scaled
            if (!process.scaledToArea) {
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
        }, 300);

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
            process.scaledToArea = true;
            this.scaleToFillArea(stringyPID, {});
        } else {
            // Maximize
            const fillData = {
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

    //Default values for the app createData parameters.
    processSchema: {
        title: "Untitled App",
        titleColor: "",
        bodyColor: "",
        textColor: "",
        headerColor: "",
        headerBorderBottomColor: "",
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

    create: function (appName, position = { x: 'default', y: 'default' }) {
        //If the app doesn't exists.
        if (apps[appName] == undefined) {
            console.error(`Not Found: App '${appName}' does not exist`)
            return false
        }

        //If an app is already open and onlyOneInstanceAllowed then just focus on it
        if (apps[appName].createData.onlyOneInstanceAllowed && this.getRunningInstanceAmount(appName) > 0) {
            let message = `One instance of App: '${appName}' already running!`
            this.bringToTop(this.getFirstPidFromAppName(appName).getProcessElement());
            return false
        }

        let processID = processes.getNewPid();
        let stringyPID = "pid" + processID;
        let appCreateData = {};

        //Create the app Object according to the schema and replace the ones provided by the app's createData
        Object.assign(appCreateData, this.processSchema)
        Object.assign(appCreateData, apps[appName].createData)

        // Make sure the size and position is good
        appCreateData.height < appCreateData.minHeight && (appCreateData.height = appCreateData.minHeight)
        appCreateData.width < appCreateData.minWidth && (appCreateData.width = appCreateData.minWidth)
        position.y = position.y == 'default' ? topBar.offsetHeight + 30 : y;
        position.x = position.x == 'default' ? 40 : x;

        this.pidPositionsIndex.x = [];
        this.pidPositionsIndex.y = [];

        //Index app positions and place the new app where there is space.
        for (const process of Object.values(this.getPidObject())) {
            this.pidPositionsIndex.x.push(process.positionBeforeMaximize.x)
            this.pidPositionsIndex.y.push(process.positionBeforeMaximize.y)
        }

        this.pidPositionsIndex.x = this.pidPositionsIndex.x.sort((a, b) => a - b)
        this.pidPositionsIndex.y = this.pidPositionsIndex.y.sort((a, b) => a - b)

        //Loops through all the indexed app positions and finds a spot to create the app window.
        for (let i = 0; i < this.pidPositionsIndex.x.length; i++) {
            if ((position.x + 20 > this.pidPositionsIndex.x[i] && position.x - 10 < this.pidPositionsIndex.x[i]) || (position.y + 20 > this.pidPositionsIndex.y[i] && position.y - 10 < this.pidPositionsIndex.y[i])) {
                //Increment the position if there's already and app window in the vicinity
                position.x += 25
                position.y += 25
                //Make sure the app is not created out of bounds
                if (position.y > window.innerHeight - (appList.offsetHeight + 430)) {
                    position.y = topBar.offsetHeight + 30;
                }
                if (position.x > window.innerWidth - 630) {
                    position.x = 40;
                }
            }
        }

        //Then styles are defined here
        const containerStyles = `
			min-height:${appCreateData.minHeight}px;
			min-width:${appCreateData.minWidth}px;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.1s linear;
            top: ${position.y}px;
            left: ${position.x}px;
		`;
        const bodyStyles = `
			background-color:${appCreateData.bodyColor};
			color:${appCreateData.textColor};
			margin:${(appCreateData.bodyBorder && appCreateData.bodyBorderSize) || '0px'};
			height:${(appCreateData.fullHeight && "100%") || "auto"};
			width:${(appCreateData.fullWidth && "100%") || "auto"};
			opacity: ${appCreateData.opacity};
			padding: ${appCreateData.padding};
			${appCreateData.additionalBodyCss}
		`;
        const headerStyles = `
			color: ${appCreateData.titleColor};
			background-color:${appCreateData.headerColor};
			border-bottom-style: solid;
            border-bottom-width: 1px;
            border-bottom-color: ${appCreateData.headerBorderBottomColor};
		`;

        //This is how the app html is created.
        const appHTML = `
			<app_container onmousedown="processes.bringToTop(this,event);" id='${stringyPID}' style = '${containerStyles}' >
				<app_header style="${headerStyles}opacity:1;" onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')" >
					<app_title>${appCreateData.title}</app_title>
					<app_minimize onclick="processes.minimize('${stringyPID}')"><minus_icon></minus_icon></app_minimize>
					<app_maximize onclick="processes.maximize('${stringyPID}')"><square_icon></square_icon></app_maximize>
					<app_exit onclick="processes.remove('${stringyPID}')"><x_icon></x_icon></app_exit>
				</app_header>
				<div class='app_body' style="${bodyStyles}">
					${appCreateData.getHTML()}
				</div>
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
        appList.insertAdjacentHTML('beforeend', `<process onclick="processes.bringToTop(document.querySelector('#${stringyPID}'))" id='appListPID${processID}'>${(isDefined(apps[appName].icon) && `<img src="${apps[appName].icon}">`) || ""}<span>${appCreateData.title}</span></process>`)

        //Add a context menu to the taskbar app
        X.contextMenu.add(mainContent.querySelector('#appList > *:last-child'), [
            ["Maximize", `processes.maximize('${stringyPID}')`],
            ["Minimize", `processes.minimize('${stringyPID}')`],
            [""],
            ["Close", `processes.remove('${stringyPID}')`],
        ])

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
            projectedFill = {},
            positionBeforeMaximize: { x: position.x, y: position.y },
            sizeBeforeMaximize: { width: appCreateData.width, height: appCreateData.height },
            originalOffsetY: 0,
            originalOffsetX: 0,
            title: appCreateData.title,
            getProcessElement: function () { return document.querySelector(`#${this.elementId} `) },
            getProcessElementBody: function () { return document.querySelector(`#${this.elementId}>.app_body`) },
            getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
            getProcessBarElement: function () { return document.querySelector(`#appListPID${this.id} `) },
            setProcessTitle: function (title) { this.getProcessBarElement().querySelector('span').innerText = title; this.getProcessElementHeader().querySelector('app_title').innerText = title; this.title = title; }
        });

        setTimeout(() => {
            const el = processes.pid[processID].getProcessElement()
            el.style.opacity = ''
            el.style.transform = ''
            el.style.transition = ''
        }, 1);

        this.makeProcessResizable("#" + processes.pid[processID].elementId);
        this.bringToTop(processes.pid[processID].getProcessElement())
        // Header double click maximize
        addDoubleClickListener(processes.pid[processID].getProcessElementHeader(), (event) => { console.log('D Maximize'); processes.maximize(stringyPID); })

        isFunction(apps[appName].onStart) && apps[appName].onStart(processes.pid[processID])
        appCreateData = {};
    },

    //Handles window movement. So... yeah.
    processMouseDownHandler: function (event, stringyPID, forceRun = false) {
        const pid = this.getNumberPid(stringyPID);
        const process = this.pid[pid];
        if (((event.target.tagName != "APP_HEADER" && event.target.tagName != "APP_TITLE") && !forceRun)) return false
        if (process.scaledToArea) {
            let mouseY = event.clientY
            let mouseX = event.clientX
            //Checks only if the mouse moved some pixels so that we can un-scale the app. Basically a separate mouse move handler than the one that actually moves the app. Which makes sense i guess.
            document.body.onmousemove = e => {
                if (Math.abs(mouseY - e.clientY) + Math.abs(mouseX - e.clientX) > 40) {
                    const element = process.getProcessElement()
                    element.style.top = e.layerY;
                    document.body.setAttribute('onmousemove', null)

                    // Calculate the position of the app window based on your cursors position.
                    // So that the it doesn't return to its previous location where your cursor is not present
                    // And keep your cursors relative app header left offset 
                    let headerStartToMouseDistance = ((e.layerX / element.offsetWidth) * process.sizeBeforeMaximize.width)
                    let topOffset = e.clientY
                    let leftOffset = e.clientX - headerStartToMouseDistance
                    process.positionBeforeMaximize.x = leftOffset
                    process.positionBeforeMaximize.y = topOffset

                    element.style.transition = '200ms width ease-in-out,200ms height ease-in-out'

                    process.scaledToArea = true;
                    processes.scaleToFillArea(stringyPID, {})
                    processes.initiateProcessMouseMoveHandler(process, e.layerY, headerStartToMouseDistance)
                }
            }
            this.initiateProcessMouseUpHandler(process);
            return false
        }
        this.initiateProcessMouseMoveHandler(process, event.layerY, event.layerX);
        this.initiateProcessMouseUpHandler(process);
    },

    //Starts the mouse move handler.
    initiateProcessMouseMoveHandler: function (process, originalOffsetY, originalOffsetX) {
        process.originalOffsetY = originalOffsetY;
        process.originalOffsetX = originalOffsetX;
        document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event, processes.pid['${process.id}'])`)
    },

    // Add a mouse up handler that clears other handlers and does other stuff
    initiateProcessMouseUpHandler: function (process) {
        document.body.onmouseup = event => {
            if (isDefined(process.getProcessElementHeader())) {
                document.body.removeAttribute('onmousemove')
                document.body.removeAttribute('onmouseup')
                process.getProcessElementHeader().removeAttribute('onmouseup')
                this.scaleToProjectedFill(process);
                this.hideWindowFillProjection(process, true)
            }
            document.body.onmouseup = null
        }
    },

    //Mainly moves the app window 
    processMouseMoveHandler: function (event, process) {
        let mouseY = event.clientY
        let mouseX = event.clientX
        let y = mouseY - process.originalOffsetY;
        let x = mouseX - process.originalOffsetX;
        let element = process.getProcessElement()
        //Check if the mouse is at any of the 'scale to area' locations
        if (mouseY < topBar.offsetHeight)
            this.createWindowSizeProjection(process, 'full')
        else if (mouseX < 30)
            this.createWindowSizeProjection(process, 'left-half')
        else if (mouseX > document.body.offsetWidth - 30)
            this.createWindowSizeProjection(process, 'right-half')
        else
            this.hideWindowFillProjection(process)
        //Caps the apps top position to the #topBar's height.
        // Very understandable I think.
        y = y < topBar.offsetHeight ? topBar.offsetHeight : y; // Cap the position to the topBar height
        let appListPosition = (window.innerHeight - appList.offsetHeight * 2)
        y = y > appListPosition ? appListPosition : y  // Makes sure the app header doesn't go under the applist
        element.style.top = y + "px";
        element.style.left = x + "px";
    },

    makeProcessResizable: function (cssSelector) {
        //Thanks to Hung Nguyen for this code. (I simplified it a little) Original: https://codepen.io/ZeroX-DG/pen/vjdoYe

        //Makes a element resizable. (Note: Not any element. Has to have resize points!)
        const element = document.querySelector(cssSelector);
        const resizePoints = document.querySelectorAll(cssSelector + ' resize_point')
        const minimumSizeX = element.style.minWidth.replace('px', '') || 150;
        const minimumSizeY = element.style.minHeight.replace('px', '') || 150;

        let originalWidth = 0;
        let originalHeight = 0;
        let originalX = 0;
        let originalY = 0;
        let originalMouseX = 0;
        let originalMouseY = 0;
        resizePoints.forEach(x => {
            x.addEventListener('mousedown', function (e) {
                e.preventDefault()
                originalWidth = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                originalHeight = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                originalX = element.getBoundingClientRect().left;
                originalY = element.getBoundingClientRect().top;
                originalMouseX = e.pageX;
                originalMouseY = e.pageY;
                window.addEventListener('mousemove', resize)
                window.addEventListener('mouseup', stopResize)
            })
            function resize(e) {
                // Easy to understand. besides it's not really gonna change so this is gonna probably be the final version of this snippet

                // Well I was wrong. It was changed And it will be changed. Idk what, but it will.
                const resizeClassList = x.classList.toString()
                let height = 0;
                let width = 0;
                if (resizeClassList.includes('top')) {
                    height = originalHeight - (e.pageY - originalMouseY)
                    if (height > minimumSizeY && height <= window.innerHeight) {
                        element.style.height = height + 'px'
                        element.style.top = originalY + (e.pageY - originalMouseY) + 'px'
                    }
                } else if (resizeClassList.includes('bottom')) {
                    height = originalHeight + (e.pageY - originalMouseY)
                    if (height > minimumSizeY && height <= window.innerHeight)
                        element.style.height = height + 'px'
                }
                if (resizeClassList.includes('left')) {
                    width = originalWidth - (e.pageX - originalMouseX)
                    if (width > minimumSizeX && width <= window.innerWidth) {
                        element.style.width = width + 'px'
                        element.style.left = originalX + (e.pageX - originalMouseX) + 'px'
                    }
                } else if (resizeClassList.includes('right')) {
                    width = originalWidth + (e.pageX - originalMouseX)
                    if (width > minimumSizeX && width <= window.innerWidth)
                        element.style.width = width + 'px'

                }
                if (height >= window.innerHeight) element.style.height = window.innerHeight
                if (width >= window.innerWidth) element.style.width = window.innerWidth
            }
            //Clears the resize listeners
            function stopResize() {
                document.body.setAttribute('onmousemove', null)
                window.removeEventListener('mousemove', resize)
            }
        })
    }
}
