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

export async function GET() {
  try {
    const content = await fs.readFile(LOG_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    const status = error.code === "ENOENT" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: "Logs not found" },
      { status }
    );
  }
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const targetUrl = payload.url?.trim() || "about:blank";
  const events = [];
  const startedAt = new Date().toISOString();

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      events.push({
        type: "navigation",
        url: frame.url(),
        ts: new Date().toISOString(),
      });
    }
  });

  await page.exposeBinding("reportClick", (_source, payload) => {
    events.push({
      type: "click",
      ts: new Date().toISOString(),
      ...payload,
    });
  });

  await page.addInitScript(() => {
    const textOf = (element) => {
      if (!element) return "";
      const raw = element.innerText || element.textContent || "";
      return raw.trim().slice(0, 120);
    };

    const selectorFor = (element) => {
      if (!element || element.nodeType !== 1) return "";
      if (element.id) return `#${element.id}`;
      const parts = [];
      let current = element;
      while (current && current.nodeType === 1 && parts.length < 4) {
        let part = current.tagName.toLowerCase();
        const classList = current.className
          ? current.className.toString().trim().split(/\s+/).filter(Boolean)
          : [];
        if (classList.length) {
          part += `.${classList.slice(0, 2).join(".")}`;
        }
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            (child) => child.tagName === current.tagName
          );
          if (siblings.length > 1) {
            part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
          }
        }
        parts.unshift(part);
        current = parent;
      }
      return parts.join(" > ");
    };

    window.addEventListener(
      "click",
      (event) => {
        try {
          const element = event.target;
          window.reportClick({
            selector: selectorFor(element),
            text: textOf(element),
            tag: element?.tagName?.toLowerCase?.() || "",
            url: window.location.href,
          });
        } catch (error) {
          // Ignore click serialization errors.
        }
      },
      true
    );
  });

  try {
    if (targetUrl) {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
    }
  } catch (error) {
    events.push({
      type: "navigation-error",
      ts: new Date().toISOString(),
      message: error.message,
    });
  }

  await page.waitForEvent("close");
  await context.close().catch(() => {});
  await browser.close().catch(() => {});

  const payloadToSave = {
    startedAt,
    endedAt: new Date().toISOString(),
    targetUrl,
    events,
  };

  await writeLog(payloadToSave);

  return NextResponse.json({
    success: true,
    eventsCount: events.length,
    logPath: "data/inspect-log.json",
  });
}
