import puppeteer from "puppeteer";
import Linkedin from "./objects";
import inquirer from "inquirer";
import { connectDb, disconnectDB, prisma } from "./config";

(async () => {
	connectDb();
	const jobs = await prisma.job.findMany();

	const answers = await inquirer.prompt({
		type: "list",
		message: "which script should i use?\n",
		name: "script",
		choices: ["analyze", "find jobs", "display"],
	});

	if (answers.script === "display") {
		for (let i in jobs) {
			const browser = await puppeteer.launch({
				executablePath: "/bin/google-chrome-stable",
				slowMo: 100,
				userDataDir: process.env.USER_DIR,
				headless: false,
				defaultViewport: null,
			});
			const linkedinPage = await browser.newPage();
			linkedinPage.goto(jobs[i].url);
		}
	}

	if (answers.script === "analyze") {
		for (let i in jobs) {
			await prisma.job.update({
				where: {
					id: jobs[i].id,
				},
				data: {
					analyzed: true,
				},
			});

			prisma.job.update({
				where: {
					id: jobs[i].id,
				},
				data: {
					approved: true,
				},
			});
		}
	}

	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		defaultViewport: null,
	});

	const currentTab = await browser.newPage();
	const linkedin = new Linkedin(currentTab);

	const searchArray = [
		"nodejs",
		"desenvolvedor Java",
		"java junior",
		"backend nodejs",
		"desenvolvedor junior",
	];
	for (let i in searchArray) {
		console.log("looking for", searchArray[i]);
		await linkedin.search(searchArray[i]);
		await linkedin.scrape(2);
	}
	console.log("Done!");
	disconnectDB();
	browser.close();
})();
