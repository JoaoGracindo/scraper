import puppeteer from "puppeteer";
import { config } from "dotenv";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner"
import { gptPrompt } from "./gpt";
import { connectDb, prisma, disconnectDB } from "./config";
config();

(async () => {
	connectDb();
	const jobs = await prisma.job.findMany();
	
	for (let i in jobs) {
		const spinner = createSpinner(" Waiting for gpt response.\n").start();
		const summary = await gptPrompt(jobs[i]);
		spinner.success().clear();
		console.log(summary, "\n\n");
		const answers = await inquirer.prompt({
			type: "list",
			message: "build CV?\n",
			name: "validation",
			choices: ["yes", "no", "exit"],
		});
		
		await prisma.job.update({
			where: {
				id: jobs[i].id
			},
			data: {
				analyzed: true
			}
		})
		if (answers.validation === "no") continue;
		if (answers.validation === "exit") break;
		
		prisma.job.update({
			where: {
				id: jobs[i].id
			},
			data: {
				approved: true
			}
		})
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
	
	disconnectDB();
})();
