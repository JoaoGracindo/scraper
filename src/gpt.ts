import { OpenAIApi, Configuration } from "openai";
import { config } from "dotenv";
import { Job } from "@prisma/client";
config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function gptPrompt(job: Job) {
	const chatCompletion = await openai.createChatCompletion({
		messages: [
			{
				role: "system",
				content: "voce é um programa que analisa vaga de emprego de desenvolvedor de software.",
			},
			{
				role: "user",
				content: `liste as palavras-chave desta vaga: ${job.jobDescription}`
			}
		],
		model: "gpt-3.5-turbo",
	});

	const response = chatCompletion.data.choices[0].message.content;
	return response;
}

export { openai, gptPrompt };
