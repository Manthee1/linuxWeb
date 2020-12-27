processes = {

    currentlySelectedProcess: null,

    pid: {},

    getNewPid: function () {

        if (Object.entries(this.pid).length == 0)
            return 0;
        else return Number(Object.keys(this.pid).sort().slice(-1)) + 1
    },


    getNumberPid: function (pid) {
        return Number(pid.split('pid')[1])

    },

    bringToTop: function (element) {

        const pid = this.getNumberPid(element.id);
        typeof (this.pid[pid]['onFocus']) == "function" && this.pid[pid].onFocus();
        if (this.currentlySelectedProcess == this.pid[pid]) return false;
        // if (element == appsLayer.children[appsLayer.children.length - 1]) return false;
        appsLayer.insertAdjacentElement('beforeend', element)
        this.makeProcessResizable("#" + element.id);
        this.currentlySelectedProcess != null && this.currentlySelectedProcess.getProcessBarElement().classList.remove('selected')
        this.pid[pid].getProcessBarElement().classList.add('selected');
        this.currentlySelectedProcess = this.pid[pid];
        console.log('Focused', this.pid[pid]);
    },

    processSchema: {
        title: "Untitled App",
        titleColor: "inherit",
        bodyColor: "inherit",
        textColor: "inherit",
        headerColor: "var(--main-color);",
        bodyBorderSize: "inherit",
        padding: "inherit",
        opacity: 1,
        HTML: String(),
        minWidth: Number(),
        minHeight: Number(),
        bodyBorder: Boolean(),
        fullHeight: Boolean(),
        fullWidth: Boolean(),

    },

    remove: function (stringyPID) {
        pid = this.getNumberPid(stringyPID);
        // this.pid.splice(this.runningIds.indexOf(pid), 1);
        document.querySelector(`#${stringyPID}`).remove();
        this.pid[pid].getProcessBarElement().remove();
        this.pid[pid] = null;
        this.currentlySelectedProcess = null;
    },

    create: function (appName, position = { x: 100, y: 100 }) {
        let processID = processes.getNewPid();
        let stringyPID = "pid" + processID
        if (apps[appName] == undefined) {
            console.error(`Not Found: App '${appName}' does not exist`)
            return false
        }
        let appCreateData = apps[appName].createData;

        Object.entries(this.processSchema).forEach(entry => {
            if (!appCreateData[entry[0]] == undefined || typeof (appCreateData[entry[0]]) != typeof (entry[1])) {
                appCreateData[entry[0]] = entry[1];
            }
            // !system.global.isValid(entry[1]) && (appCreateData[entry[0]] = "");
        })


        let containerStyles = `
			min-height:${appCreateData.minHeight};
			min-width:${appCreateData.minWidth};
		`

        let bodyStyles = `
			background-color:${appCreateData.bodyColor};
			color:${appCreateData.textColor};
			margin:${(appCreateData.bodyBorder && appCreateData.bodyBorderSize) || '0px'};
			height:${(appCreateData.fullHeight && "100%") || "auto"};
			width:${(appCreateData.fullWidth && "100%") || "auto"};
			opacity: ${appCreateData.opacity};
			padding: ${appCreateData.padding};
		`

        appsLayer.innerHTML += `
			<app_container onmousedown="processes.bringToTop(this)" id='${stringyPID}' style = "top: ${position.y}px;left: ${position.x}px;${containerStyles}" >
				<app_header style="color:${appCreateData.titleColor};background-color:${appCreateData.headerColor};" onmousedown="processes.processMouseDownHandler(event, '${stringyPID}')" >
					${appCreateData.title}
					<app_exit onmousedown="document.body.removeAttribute('onmousemove')" onclick="processes.remove('${stringyPID}')" />
				</app_header>
				<app_body style="${bodyStyles}">
					${appCreateData.HTML}
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

        processBar.innerHTML += `<process onclick="processes.bringToTop(document.querySelector('#${stringyPID}'))" id='processBarPID${processID}'>${appCreateData.title}</process>`
        processes.pid[processID] = {}

        //Assign Functions
        Object.assign(processes.pid[processID], appCreateData.methods)

        Object.assign(processes.pid[processID], {
            id: processID,
            elementId: stringyPID,
            originalOffsetY: 0,
            originalOffsetX: 0,
            getProcessElement: function () { return document.querySelector(`#${this.elementId}`) },
            getProcessElementBody: function () { return document.querySelector(`#${this.elementId}>app_body`) },
            getProcessElementHeader: function () { return document.querySelector(`#${this.elementId} app_header`) },
            getProcessBarElement: function () { return document.querySelector(`#processBarPID${this.id}`) },
        });
        this.makeProcessResizable("#" + processes.pid[processID].elementId);
        this.bringToTop(processes.pid[processID].getProcessElement())
        apps[appName].onStart(processes.pid[processID])
        appCreateData = {};

        return true;
    },

    processMouseDownHandler: function (event, stringyPID) {
        if (event.target.tagName != "APP_HEADER") return false
        pid = this.getNumberPid(stringyPID);
        let process = this.pid[pid];
        process.originalOffsetY = event.offsetY;
        process.originalOffsetX = event.offsetX;
        document.body.setAttribute('onmousemove', `processes.processMouseMoveHandler(event,processes.pid['${pid}'])`)
        process.getProcessElementHeader().onmouseup = () => {
            document.body.onmousemove = null;
            process.getProcessElementHeader().onmouseup = null;
        }
    },

    processMouseMoveHandler: function (event, process) {
        // console.log(event, pid);
        var y = event.clientY - process.originalOffsetY;
        var x = event.clientX - process.originalOffsetX;
        process.getProcessElement().style.top = y + "px";
        process.getProcessElement().style.left = x + "px";
    },

    makeProcessResizable: function (cssSelector) {
        //Thanks to Hung Nguyen for this code. (I modified simplified it a little) Original: https://codepen.io/ZeroX-DG/pen/vjdoYe
        const element = document.querySelector(cssSelector);
        const resizePoints = document.querySelectorAll(cssSelector + ' resize_point')
        const minimum_size = 150;
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
                const resizeClassList = x.classList.toString()
                if (resizeClassList.includes('top')) {
                    const height = original_height - (e.pageY - original_mouse_y)
                    if (height > minimum_size) {
                        element.style.height = height + 'px'
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                } else if (resizeClassList.includes('bottom')) {
                    const height = original_height + (e.pageY - original_mouse_y)
                    if (height > minimum_size) {
                        element.style.height = height + 'px'
                    }
                }
                if (resizeClassList.includes('left')) {
                    const width = original_width - (e.pageX - original_mouse_x)
                    if (width > minimum_size) {
                        element.style.width = width + 'px'
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                } else if (resizeClassList.includes('right')) {
                    const width = original_width + (e.pageX - original_mouse_x)
                    if (width > minimum_size) {
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
