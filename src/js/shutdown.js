
(async () => {
    await delay(1000);
    let timeMax = 5000; //ms

    shutdownText = [
        "Started Spewing fake shutdown messages",
        "Stopped Login Service.",
        "Stopped Permit User Sessions.",
        "Stopped target Remote File Systems.",
        "Stopped target Remote File Systems(Pre).",
        "Stopped Deferred execution scheduler.",
        "Started Unattended Upgrades.",
        "Stopped System Logging Service.",
        "Stopped Accounts Service.",
        "Stopped OpenBSD Secure Shell server.",
        "Stopped target Network.",
        "Stopping ifup for eth0...",
        "Stopped target Basic System.",
        "Stopped target Slices.",
        "Removed slice User and Session Slice.",
        "Stopped target Paths.",
        "Stopped target Sockets.",
        "Closed UUID daemon activation socket.",
        "Closed ACPID Listen Socket.",
        "Closed Syslog Socket.",
        "Closed D -Bus System Message Bus Socket.",
        "Stopped target System Initialization.",
        "Stopped target Swap.",
        "Stopping Network Time Synchronization...",
        "Stopping LSB: Raise network interfaces....",
        "Stopped Apply Kernel Variables.",
        "Stopping Apply Kernel Variables...",
        "Stopped Load Kernel Modules.",
        "Stopping Load Kernel Modules...",
        "Stopping Update UIMP about System Boot/Shutdown...",
        "Stopped target Encrypted Volumes.",
        "Stopped Update UTAP about System Boot/Shutdown.",
        "Stopped Network Time Synchronization.",
        "Stopped LSB: Raise network interfaces..",
        "Stopping Load/Save Random Seed...",
        "Stopped Load/Save Random Seed.",
        "Stopped ifup for eth0.",
        "Stopped Create Volatile Files and Directories.",
        "Stopping Create Volatile Files and Directories...",
        "Stopped target Local File Systems.",
        "Unmounting /run/user/1000...",
        "Unmounting /boot/efl...",
        "Stopping Monitoring of LUNE mirrors, snapshots etc.  using dmeuentd or progress polling...",
        "Removed slice system-ifup.slice.",
        "Unmounted /run/user/1000.",
        "Unmounted /boot/ell.",
        "Unmounting /boot...",
        "Unmounted /boot.",
        "Stopped target Local File Systems (Pre).",
        "Stopped Remount Root and Kernel File Systems.",
        "Stopping Remount Root and Kernel File Systems...",
        "Stopped Create Static Device Nodes in /dev.",
        "Stopping Create Static Device Nodes in /deo...",
        "Reached target Shutdown."
    ]

    // Loop thorough the messages and display one, wait, display another, wait...
    for (const key in shutdownText) {
        text = shutdownText[key]
        document.querySelector("message_info").innerHTML += `<message><span>[ &nbsp; &nbsp; OK &nbsp; &nbsp; ]</span> ${text}</message>
        `;
        await delay((Math.random() <= 0.5 && Math.random() * 3 * (timeMax / (shutdownText.length * 2))) || Math.random() * (timeMax / (shutdownText.length * 2)));
        document.querySelector("message_info").lastElementChild.scrollIntoView()
        //     /\ Random delay for each boot message
    }

    typeof afterShutdown != "undefined" && console.log(afterShutdown);

    if (typeof afterShutdown != "undefined" && afterShutdown == 'restart') {
        afterShutdown = "";
        await delay(1000)
        page.changePage('./views/boot.html')
    }
})();


