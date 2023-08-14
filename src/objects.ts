import { Page } from "puppeteer";
import { prisma, connectDb } from "./config";
import dotenv from "dotenv";
dotenv.config();

type Job = {
	time: string;
	local: string;
	company: string;
	url: string;
	jobDescription: string;
};

export default class Linkedin {
	private page;
	private prisma;
	private email = process.env.LINKEDIN_EMAIL;
	private password = process.env.LINKEDIN_PASSWORD;

	constructor(page: Page) {
		connectDb();
		this.page = page;
		this.prisma = prisma;
	}

	public async login() {
		await this.page.goto("https://www.linkedin.com/login/");
		await this.page.type('input[id="username"]', this.email);
		await this.page.type('input[id="password"]', this.password);
		await this.page.keyboard.down("Enter");
		await this.page.waitForNavigation();
	}

	private async save(data: Job) {
		const hasOnDb = await this.prisma.job.findUnique({
			where: {
				url: data.url,
			},
		});
		if (hasOnDb || !this.filterJobs(data)) return;
		await this.prisma.job.create({
			data,
		});
	}

	public async getJobInfo() {
		const element = await this.page.evaluate(
			() =>
				document.querySelector(
					"div.jobs-unified-top-card__primary-description span.tvm__text"
				).textContent
		);

		const time = element.split("\n")[1].trim();

		const description = await this.page.evaluate(
			() =>
				document.querySelector("div.jobs-unified-top-card__primary-description")
					.children[0].textContent
		);
		const trimedDescription = description
			.split(" ")
			.filter((e) => e.length > 0 || e !== "\n")
			.join(" ");
		const info = trimedDescription.split(time)[0].trim().split(" · ");

		const jobDescription = await this.page.evaluate(
			() =>
				document.querySelector(
					"div.jobs-description-content__text--stretch span"
				).textContent
		);

		return {
			time,
			local: info[1],
			company: info[0],
			jobDescription,
		};
	}

	private async getJobsId() {
		const links = await this.page.evaluate(async () =>
			Array.from(document.querySelectorAll("a"), (e) => e.href)
		);
		const regex = new RegExp(/^(https:\/\/www\.linkedin\.com\/jobs\/view)/);
		return links
			.filter((link) => regex.test(link))
			.map((link) => link.split("/")[5]);
	}

	private async goToPage(number: number) {
		await this.page.waitForSelector(`button[aria-label="Página ${number}"]`);
		await this.page.click(`button[aria-label="Página ${number}"]`);
		await this.page.waitForSelector(
			`button[aria-label="Página ${number + 1}"]`
		);
	}

	private async goToJob(id: string) {
		const url = this.page.url();
		const urlInstance = new URL(url);
		urlInstance.searchParams.set("currentJobId", id);
		await this.page.goto(urlInstance.href);
		await this.page.waitForSelector(
			"div.jobs-unified-top-card__primary-description"
		);
	}

	public async scrapeJob(id: string): Promise<void> {
		await this.goToJob(id);
		const url = this.page.url();
		const jobUrl = new URL(url).href;

		const jobInfo = await this.getJobInfo();
		const job: Job = {
			...jobInfo,
			url: jobUrl,
		};
		await this.save(job);
	}

	public async scrapePage(jobsId: string[]): Promise<void> {
		for (let i in jobsId) {
			await this.scrapeJob(jobsId[i]);
		}
	}

	public async scrape(total: number) {
		let nextPage = 2;
		await this.page.waitForSelector(`button[aria-label="Página ${nextPage}"]`);
		const jobsInfo = [];
		for (let i = 0; i < total; i++) {
			const jobsId = await this.getJobsId();
			const jobInfo = await this.scrapePage(jobsId);
			jobsInfo.push(jobInfo);
			await this.goToPage(nextPage);
			nextPage++;
		}
		return jobsInfo;
	}

	public async search(queryString: string) {
		await this.page.goto("https://www.linkedin.com/jobs");
		await this.page.waitForSelector("a");
		await this.page.type(
			'input[aria-label="Pesquisar cargo, competência ou empresa"]',
			queryString
		);
		await this.page.keyboard.down("Enter");
	}

	public filterJobs(job: Job): boolean {
		const { time, local } = job;
		const timePattern = /dias?|horas?|minutos?/i;
		const localPattern = /(remoto)|(rio de janeiro)/i;
		const rightTimePeriod = timePattern.test(time);
		const rightLocal = localPattern.test(local);
		console.log(time, rightTimePeriod);

		if (rightLocal && rightTimePeriod) return true;

		return false;
	}
}
