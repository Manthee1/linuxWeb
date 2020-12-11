getJS = {
	LoadAllJsFromHead: () => {
		document.head.querySelectorAll("script").forEach(async (x) => {
			eval(await (await fetch(x.src)).text());
		});
	},
};
