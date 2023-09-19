import puppeteer from "puppeteer";
import Linkedin from "./linkedinPage";
import inquirer from "inquirer";
import { connectDb, disconnectDB, prisma } from "./config";
import { gptPrompt } from "./gpt";

(async () => {
	connectDb();

	const answers = await inquirer.prompt({
		type: "list",
		message: "which script should i use?\n",
		name: "script",
		choices: ["analyze", "find jobs", "display"],
	});

	if (answers.script === "display") {
		const jobs = await prisma.job.findMany({
			where: {
				key_words: {
					not: null,
				},
			},
		});
		for (let i in jobs) {
			console.log(jobs[i].key_words);

			const answer = await inquirer.prompt({
				type: "list",
				message: "applied?\n",
				name: "applied",
				choices: ["yes", "no"],
			});
			console.clear();
			if (answer.applied === "no") continue;

			await prisma.job.update({
				where: {
					id: jobs[i].id,
				},
				data: {
					applied: true,
				},
			});

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
		const jobs = await prisma.job.findMany({
			where: {
				key_words: null,
			},
		});
		for (let i in jobs) {
			try {
				await gptPrompt(jobs[i]);
			} catch (err) {
				console.log(err.data);
			}
		}
	}

	if (answers.script === "find jobs") {
		const browser = await puppeteer.launch({
			executablePath: "/bin/google-chrome-stable",
			slowMo: 100,
			userDataDir: process.env.USER_DIR,
			headless: false,
			defaultViewport: null,
		});

		const currentTab = await browser.newPage();
		const linkedin = new Linkedin(currentTab);

		const searchArray = ["desenvolvedor node", "desenvolvedor nodejs", "desenvolvedor typescript", "backend developer", "full-stack node"];

		for (let i in searchArray) {
			console.log("looking for", searchArray[i])
			await linkedin.search(searchArray[i]);
			await linkedin.scrape(5);
		}

		console.log("Done!");
		browser.close();
	}

	disconnectDB();
})();
