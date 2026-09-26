"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculators } from "@/calculators/registry";
import { IconArrowRight } from "../icons";

const SHOW_AFTER_Y = 480;

export function MobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footerVisibleRef = { current: false };

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_Y && !footerVisibleRef.current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const footer = document.querySelector("footer");
    let observer: IntersectionObserver | undefined;
    if (footer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          footerVisibleRef.current = entry?.isIntersecting ?? false;
          onScroll();
        },
        { threshold: 0.05 },
      );
      observer.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Link
        href={`/${calculators[0].slug}`}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-600/25"
      >
        Calcular mi reforma gratis
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
}