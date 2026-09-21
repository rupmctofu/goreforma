import Link from "next/link";
import { cn } from "../ui/container";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 61.34 64.1"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="30.67" cy="32.05" r="30.67" className="fill-accent-500" />
      <path
        className="fill-white"
        d="M49.02,34.1c-1.82-7.79-11.19-10.8-16.67-4.6-.59.66-.98,1.43-1.49,2.11-.07.09-.1.22-.25.18-1.57-2.69-4.22-5.17-7.45-5.53-5.27-.59-9.67,2.77-10.86,7.84-1.46,6.24,2.11,10.86,6.3,14.93,1.21,1.17,2.47,2.29,3.75,3.39s3.27.19,3.27-1.5v-12.44h10.08v12.38c0,1.7,2,2.61,3.28,1.49.74-.65,1.47-1.3,2.2-1.97,4.76-4.35,9.5-9.17,7.84-16.28Z"
      />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeMiterlimit="10"
      >
        <line x1="11.97" y1="23.15" x2="30.67" y2="14.76" />
        <line x1="49.36" y1="23.15" x2="30.67" y2="14.76" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 rounded-full font-bold tracking-tight",
        className,
      )}
      aria-label="GoReforma — inicio"
    >
      <LogoMark className="size-9 shrink-0" />
      <span className="text-lg">
        <span className={variant === "light" ? "text-white" : "text-brand-900"}>
          Go
        </span>
        <span className="text-accent-500">Reforma</span>
      </span>
    </Link>
  );
}
