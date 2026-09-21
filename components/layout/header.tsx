"use client";

import Link from "next/link";
import { useState } from "react";
import { calculators } from "@/calculators/registry";
import { Container, cn } from "../ui/container";
import { Logo } from "./logo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Calculadoras">
          {calculators.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/#como-funciona"
          className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 lg:inline-flex"
        >
          Cómo funciona
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <div
          id="mobile-nav"
          data-open={open}
          className={cn(
            "absolute inset-x-0 top-16 border-b border-slate-200 bg-background px-5 pb-6 pt-2 shadow-lg lg:hidden",
            !open && "pointer-events-none invisible -translate-y-1 opacity-0",
            "transition-all duration-200",
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Calculadoras">
            {calculators.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-slate-800 hover:bg-accent-50"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/#como-funciona"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-slate-800 hover:bg-accent-50"
            >
              Cómo funciona
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}