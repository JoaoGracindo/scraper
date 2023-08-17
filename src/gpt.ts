import { OpenAIApi, Configuration } from "openai";
import { config } from "dotenv";
config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function gptPrompt() {
	return await openai.createChatCompletion({
		messages: [
			{
				role: "system",
				content: "hellow world",
			},
		],
		model: "gpt-3.5-turbo",
	});
}

export { openai, gptPrompt };
