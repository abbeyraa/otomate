import { NextResponse } from "next/server";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  readSettings,
  writeSettings,
} from "./settingsStorage.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({ settings });
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const incoming = normalizeSettings(payload?.settings || {});
  const settings = await writeSettings({ ...DEFAULT_SETTINGS, ...incoming });
  return NextResponse.json({ settings });
}
