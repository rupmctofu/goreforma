"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { trackLeadCtaClicked } from "@/lib/analytics";

interface TrackedLinkProps extends LinkProps {
  calculator?: string;
  className?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function TrackedLink({ calculator, onClick, children, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (calculator) trackLeadCtaClicked(calculator);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}