import puppeteer from "puppeteer";
import { openai } from "./gpt";
import { config } from "dotenv";
config();

(async () => {
	const browser = await puppeteer.launch({
		executablePath: "/bin/google-chrome-stable",
		slowMo: 100,
		userDataDir: process.env.USER_DIR,
		headless: false,
		defaultViewport: null,
	});

	const completion = await openai.createChatCompletion({
		messages: [{ 
			role: "system",
			content: "hellow world",
			 }],
		model: "gpt-3.5-turbo",
	})

	console.log(completion.data.choices[0].message)

	browser.close();
})();
