import puppeteer from "puppeteer";
import Linkedin from "./objects";

(async () => {
	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		//headless: false,
		defaultViewport: null,
	});

	const currentTab = await browser.newPage();
	const linkedin = new Linkedin(currentTab);

	const searchArray = ['node', 'nodejs', 'spring', 'java'];
	for(let i in searchArray) {
		console.log(' looking for ', searchArray[i]);
		await linkedin.search(searchArray[i]);
		await linkedin.scrape(2);
	}
	console.log("Foi");

	browser.close();
})();
