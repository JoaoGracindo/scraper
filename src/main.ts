import puppeteer from "puppeteer";
import { config } from "dotenv";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner"
import { gptPrompt } from "./gpt";
import { connectDb, prisma, disconnectDB } from "./config";
config();

(async () => {

})();
