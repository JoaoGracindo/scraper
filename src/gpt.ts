import { OpenAIApi } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAIApi();

export {openai};