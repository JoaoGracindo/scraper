import puppeteer from "puppeteer";
import { config } from "dotenv";
import inquirer from "inquirer";
import { gptPrompt } from "./gpt";
import { connectDb, prisma, disconnectDB } from "./config";
config();

(async () => {
	connectDb();
	const jobs = await prisma.job.findMany();
	disconnectDB();
	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		headless: false,
		defaultViewport: null,
	});
	const page = await browser.newPage();

	for (let i in jobs) {
		await page.goto(jobs[i].url);

		const answers = await inquirer.prompt({
			type: "list",
			message: "build CV?\n",
			name: "validation",
			choices: ["yes", "no", "exit"],
		});

		if (answers.validation === "yes") console.log("true");
		if (answers.validation === "no") continue;
		if (answers.validation === "exit") break;
	}

	browser.close();
})();
