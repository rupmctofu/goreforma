"use client";

import { useEffect } from "react";
import { trackEstimationRecoveryViewed, trackEstimationViewed } from "@/lib/analytics";

function ageBucket(createdAt: string): "same_day" | "1_7_days" | "8_30_days" | "31_90_days" {
  const ageDays = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  if (ageDays < 1) return "same_day";
  if (ageDays <= 7) return "1_7_days";
  if (ageDays <= 30) return "8_30_days";
  return "31_90_days";
}

export function RecoveryAnalytics({ calculatorId, createdAt }: { calculatorId: string; createdAt: string }) {
  useEffect(() => {
    trackEstimationRecoveryViewed(calculatorId, ageBucket(createdAt));
    trackEstimationViewed(calculatorId, "recovery");
  }, [calculatorId, createdAt]);

  return null;
}
