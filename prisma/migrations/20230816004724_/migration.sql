-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_url_key" ON "Job"("url");
