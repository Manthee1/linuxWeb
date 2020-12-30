
(async () => {

	//Request the build.ver file which has the current build version in it...
	// document.querySelector('build').innerHTML = "build: " + await (await fetch("./build.ver")).text()
	// Fetch the main X html so it's ready while the boot messages are doing their thing
	// loginHtml = await (await fetch("./X/linuxWeb_X.html")).text();
	await delay(1000);

	timeMax = 1000; //ms
	var bootText = [
		"Setting up Interfaces ...",
		"Configuring Drivers ...",
		"Starting CPUController ...",
		"Setting up PC/SC Service ...",
		"Configuring NETappid ...",
		"Starting System Services ...",
		"Mounting /dev/sda ...",
		"Configuring the USB Controller ...",
		"Starting kernel logger ...",
		"Configuring eth0 ...",
		"Starting Gdroot ...",
		"Populating /dev with existing devices through uEvent ...",
		"Waiting for udev...",
		"Preparing NetworkProxyMirror ...",
		"Booting into LinuxGUI ...",
	];
	// Loop thorough the messages and display one, wait, display another, wait...
	for (let i = 0; i < bootText.length; i++) {
		document.querySelector("message_info").innerHTML += `<message>${bootText[i]} <span>[ OK ]</span></message>`;
		await delay(Math.random() * timeMax / bootText.length);
		//     /\ Random delay for each boot message
	}
	//Finally load the page (Note: page.changePage() is not used because of reasons. Punk. Trust your past self)
	await delay(100);
	page.changePage("./X/linuxWeb_X.html");
	// await (await (htmlEl.innerHTML = await loginHtml)) && getJS.LoadAllJsFromHead();
})();


