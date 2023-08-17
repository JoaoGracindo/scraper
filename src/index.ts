import puppeteer from "puppeteer";
import { config } from "dotenv";
import inquirer from "inquirer";
import { gptPrompt } from "./gpt";
config();

(async () => {
	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		headless: false,
		defaultViewport: null,
	});

	const answers = await inquirer.prompt({
		type: "input",
		message: "build CV? (y/n)",
		name: "validation",
	});

	if(answers.validation === "y") console.log('true');
	if(answers.validation === "n") console.log('false');

	browser.close();
})();
