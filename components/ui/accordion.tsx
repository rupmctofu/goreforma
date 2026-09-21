"use client";

import { useState, type ReactNode } from "react";
import { cn } from "./container";

export function AccordionItem({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `panel-${question.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <span
          aria-hidden="true"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200",
            open && "rotate-45 bg-accent-100 text-accent-700",
          )}
        >
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="pb-5 text-sm leading-7 text-muted-foreground"
      >
        {children}
      </div>
    </div>
  );
}

export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div>
      {items.map((item, index) => (
        <AccordionItem key={item.question} question={item.question} defaultOpen={index === 0}>
          {item.answer}
        </AccordionItem>
      ))}
    </div>
  );
}