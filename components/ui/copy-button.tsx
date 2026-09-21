"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail on unsupported contexts.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-accent-200 bg-white px-3 py-2 text-sm font-semibold text-accent-700 transition-colors hover:bg-accent-50"
    >
      {copied ? (
        <>
          <IconCheck className="size-4" />
          Copiado
        </>
      ) : (
        "Copiar enlace"
      )}
    </button>
  );
}
