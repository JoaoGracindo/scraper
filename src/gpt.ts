import { OpenAIApi, Configuration } from "openai";
import { config } from "dotenv";
config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration);

export {openai};