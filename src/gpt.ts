import { OpenAIApi, Configuration } from "openai";
import { config } from "dotenv";
config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function gptPrompt(description: string) {
	return await openai.createChatCompletion({
		messages: [
			{
				role: "system",
				content: "Voce é um programa que vai me ajudar a conseguir um emprego.",
			},
			{
				role: "user",
				content: `resuma essa descrição de emprego: ${description}`
			}
		],
		model: "gpt-3.5-turbo",
	});
}

export { openai, gptPrompt };
