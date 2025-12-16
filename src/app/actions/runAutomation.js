"use server";

import { executeAutomationPlan } from "@/lib/playwright-runner";

export async function runAutomation(plan) {
  return await executeAutomationPlan(plan);
}
