
(async () => {

	//Request the build.ver file which has the current build version in it...
	document.querySelector('build').innerHTML = "build: " + await (await fetch("./build.ver")).text()
	await delay(1000);
	let addMessage = message => document.querySelector("message_info").innerHTML += `<message><span>[ &nbsp; &nbsp; OK &nbsp; &nbsp; ]</span> ${message}</message>`;

	let timeMax = 1000; //ms
	let bootText = [
		"Started Loading JavaScript from GitHub...",
		"Created slice system-getty.slice.",
		"Created slice system-modprobe.slice.",
		"Created slice system-serial\x2dgetty.slice.",
		"Created slice User and Session Slice.",
		"Started Dispatch Password …ts to Console Directory Watch.",
		"Started Forward Password R…uests to Wall Directory Watch.",
		"Reached target Local Encrypted Volumes.",
		"Reached target Paths.",
		"Reached target Remote File Systems.",
		"Reached target Slices.",
		"Reached target Swap.",
		"Listening on Device-mapper event daemon FIFOs.",
		"Listening on Process Core Dump Socket.",
		"Listening on Journal Socket (/dev/log).",
		"Listening on Journal Socket.",
		"Listening on Network Service Netlink Socket.",
		"Listening on udev Control Socket.",
		"Listening on udev Kernel Socket.",
		"Mounting Kernel Debug File System...",
		"Mounting Temporary Directory (/tmp)...",
		"Starting Load Kernel Module drm...",
		"Starting Remount Root and Kernel File Systems...",
		"Starting Apply Kernel Variables...",
		"Starting Coldplug All udev Devices...",
		"Mounted Kernel Debug File System.",
		"Mounted Temporary Directory (/tmp).",
		"Finished Load Kernel Module drm.",
		"Finished Remount Root and Kernel File Systems.",
		"Finished Apply Kernel Variables.",
		"Starting Load/Save Random Seed...",
		"Starting Create Static Device Nodes in /dev...",
		"Finished Load/Save Random Seed.",
		"Finished Create Static Device Nodes in /dev.",
		"Reached target Local File Systems (Pre).",
		"Reached target Local File Systems.",
		"Started Entropy Daemon based on the HAVEGE algorithm.",
		"Starting Journal Service...",
		"Starting Rule-based Manage…for Device Events and Files...",
		"Finished Coldplug All udev Devices.",
		"Started Journal Service.",
		"Started Rule-based Manager for Device Events and Files.",
		"Starting Flush Journal to Persistent Storage...",
		"Starting Network Service...",
		"Finished Flush Journal to Persistent Storage.",
		"Starting Create Volatile Files and Directories...",
		"Finished Create Volatile Files and Directories.",
		"Started Network Service.",
		"Found device /dev/ttyS0.",
		"Starting Network Name Resolution...",
		"Starting Network Time Synchronization...",
		"Starting Update UTMP about System Boot/Shutdown...",
		"Started Network Time Synchronization.",
		"Stopped Network Time Synchronization.",
		"Starting Network Time Synchronization...",
		"Finished Update UTMP about System Boot/Shutdown.",
		"Started Network Time Synchronization.",
		"Stopped Network Time Synchronization.",
		"Starting Network Time Synchronization...",
		"Started Network Time Synchronization.",
		"Stopped Network Time Synchronization.",
		"Starting Network Time Synchronization...",
		"Started Network Time Synchronization.",
		"Stopped Network Time Synchronization.",
		"Starting Network Time Synchronization...",
		"Started Network Time Synchronization.",
		"Stopped Network Time Synchronization.",
		"Started Network Time Synchronization.",
		"Reached target System Initialization.",
		"Started Daily Cleanup of Temporary Directories.",
		"Reached target System Time Set.",
		"Reached target System Time Synchronized.",
		"Started Daily verification of password and group files.",
		"Reached target Timers.",
		"Listening on D-Bus System Message Bus Socket.",
		"Reached target Sockets.",
		"Reached target Basic System.",
		"Started D-Bus System Message Bus.",
		"Starting SSH Key Generation...",
		"Starting User Login Management...",
		"Started Network Name Resolution.",
		"Started User Login Management.",
		"Finished SSH Key Generation.",
		"Reached target Network.",
		"Reached target Host and Network Name Lookups.",
		"Started OpenSSH Daemon.",
		"Stopped User Login Management.",
		"Starting Load Kernel Module drm...",
		"Starting Permit User Sessions...",
		"Finished Load Kernel Module drm.",
		"Starting User Login Management...",
		"Finished Permit User Sessions.",
		"Started User Login Management.",
		"Started Getty on tty1.",
		"Started Serial Getty on ttyS0.",
		"Reached target Login Prompts.",
		"Stopped OpenSSH Daemon.",
		"Started OpenSSH Daemon.",
		"Stopped User Login Management.",
		"Starting Load Kernel Module drm...",
		"Finished Load Kernel Module drm.",
		"Starting User Login Management...",
		"Started User Login Management.",
		"Stopped OpenSSH Daemon.",
		"Started OpenSSH Daemon.",
		"Stopped User Login Management.",
		"Starting Load Kernel Module drm...",
		"Finished Load Kernel Module drm.",
		"Starting Hostname Service...",
		"Starting User Login Management...",
		"Started User Login Management.",
		"Stopped OpenSSH Daemon.",
		"Started OpenSSH Daemon.",
		"Stopped User Login Management.",
		"Starting Load Kernel Module drm...",
		"Finished Load Kernel Module drm.",
		"Starting User Login Management...",
		"Started User Login Management.",
		"Started Hostname Service.",
		"Stopped OpenSSH Daemon.",
		"Started OpenSSH Daemon.",
		"Stopped User Login Management.",
		"Started Load Kernel Module drm.",
		"Started User Login Management.",
		"Reached target Multi-User System.",
		"Reached target Graphical Interface.",
	];
	jsSources = [
		"./js/libraries/sha256.js",
		"./js/linuxWeb_js/system.js",
		"./js/linuxWeb_js/apps.js",
		"./js/linuxWeb_js/processes.js",
		"./js/linuxWeb_js/fileSystem.js",
	];
	screensSources = new Map([
		["loginScreen", "./screens/loginscreen.html"],
		["lockScreen", "./screens/lockscreen.html"],
		["desktop", "./screens/desktop.html"],
	]);

	(async () => {
		return new Promise(resolve => {
			(async () => {
				for (const jsSrc of jsSources) {
					addMessage(`Started retrieving ${jsSrc} ...`);
					await page.loadJs(jsSrc)
					addMessage(`Retrieved ${jsSrc} ...`);
				}
				resolve();
			})()
		})
	})();

	(async () => {
		return new Promise(resolve => {
			(async () => {
				for (const item of screensSources[Symbol.iterator]()) {
					addMessage(`Started retrieving ${item[1]} ...`);
					screens[item[0]] = {
						src: item[1],
						html: await page.getHtml(item[1])
					}
					addMessage(`Retrieved ${item[1]} and saved it to X.screen.data.${item[0]} ...`);
				}
				resolve();
			})()
		})
	})();


	// Loop thorough the messages and display one, wait, display another, wait...
	// let retrieveJs = page.loadAllJsFromHtml()
	// for (const text of bootText) {
	// 	addMessage(text);
	// 	await delay((Math.random() <= 0.5 && Math.random() * 3 * (timeMax / (bootText.length * 2))) || Math.random() * (timeMax / (bootText.length * 2)));
	// 	//     /\ Random delay for each boot message
	// 	document.querySelector("message_info").lastElementChild.scrollIntoView()
	// }
	// await retrieveJs
	await delay(1000);
	page.changePage("./views/X.html", 'system.startup()', true);

	//Finally load the page (Note: page.changePage() is not used because of reasons. Punk. Trust your past self)
	//Fuck you past i changed it!

	// await (await (htmlEl.innerHTML = await loginHtml)) && page.loadAllJsFromHtml();
})();


