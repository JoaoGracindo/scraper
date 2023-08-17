import puppeteer from "puppeteer";
import { config } from "dotenv";
import inquirer from "inquirer";
import { gptPrompt } from "./gpt";
import { connectDb, prisma, disconnectDB } from "./config";
import { createSpinner } from "nanospinner";
config();

(async () => {
	connectDb();
	const jobs = await prisma.job.findMany();

	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		headless: false,
		defaultViewport: null,
	});
	const page = await browser.newPage();

	for (let i in jobs) {
		// await page.goto(jobs[i].url);
		const answer = await gptPrompt(jobs[i].jobDescription);
		console.log(answer.data.choices[0].message.content);
		const answers = await inquirer.prompt({
			type: "list",
			message: "build CV?\n",
			name: "validation",
			choices: ["yes", "no", "exit"],
		});

		if (answers.validation === "no") continue;
		if (answers.validation === "exit") break;
		console.clear();

		const spinner = createSpinner("building CV").start();
		console.clear();
	}

	disconnectDB();
	browser.close();
})();
