import { NextResponse } from "next/server";
import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_PATH = path.join(process.cwd(), "data", "inspect-log.json");

async function writeLog(data) {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.writeFile(LOG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const targetUrl = payload.targetUrl?.trim() || "";
  const groups = Array.isArray(payload.groups) ? payload.groups : [];

  const report = {
    type: "run",
    startedAt: new Date().toISOString(),
    endedAt: null,
    targetUrl,
    status: "running",
    error: null,
    steps: [],
  };

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    if (targetUrl) {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      report.steps.push({
        group: "system",
        step: "Target URL",
        action: "Navigate",
        status: "success",
        ts: new Date().toISOString(),
      });
    }

    for (const group of groups) {
      const steps = Array.isArray(group.steps) ? group.steps : [];
      for (const step of steps) {
        const stepReport = {
          group: group.name || group.id || "Group",
          step: step.title || step.id || "Step",
          action: step.type || "Unknown",
          selector: step.selector || "",
          status: "pending",
          ts: new Date().toISOString(),
        };

        try {
          switch (step.type) {
            case "Click":
              if (!step.selector) throw new Error("Selector is required");
              await page.click(step.selector);
              break;
            case "Input":
              if (!step.selector) throw new Error("Selector is required");
              await page.fill(step.selector, step.value || "");
              break;
            case "Read Text":
              if (!step.selector) throw new Error("Selector is required");
              stepReport.result = await page.locator(step.selector).innerText();
              break;
            case "Wait":
              {
                const ms = Number.parseInt(step.waitMs, 10) || 1000;
                await page.waitForTimeout(ms);
              }
              break;
            case "Navigate":
              if (!step.url) throw new Error("URL is required");
              await page.goto(step.url, { waitUntil: "domcontentloaded" });
              break;
            default:
              throw new Error("Unsupported action type");
          }

          stepReport.status = "success";
        } catch (error) {
          stepReport.status = "failed";
          stepReport.error = error.message;
          report.steps.push(stepReport);
          report.status = "failed";
          report.error = {
            message: error.message,
            group: group.name || group.id || "Group",
            step: step.title || step.id || "Step",
          };
          throw error;
        }

        report.steps.push(stepReport);
      }
    }

    report.status = "success";
  } catch (error) {
    report.status = report.status === "failed" ? report.status : "failed";
  } finally {
    report.endedAt = new Date().toISOString();
    await writeLog(report);
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  if (report.status !== "success") {
    return NextResponse.json(
      { success: false, error: report.error?.message || "Run failed", report },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, report });
}
