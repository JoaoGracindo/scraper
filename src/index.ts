import puppeteer from "puppeteer";
import Linkedin from "./objects";

(async () => {
	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		headless: false,
		defaultViewport: null,
	});

	const currentTab = await browser.newPage();
	const linkedin = new Linkedin(currentTab);

	await linkedin.search("desenvolvedor full stack");
	await linkedin.scrape(10);
	console.log("Foi");

	browser.close();
})();
