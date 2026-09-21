import type { ReactNode } from "react";
import { cn } from "./container";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-7 py-3.5 text-base",
    variant === "primary" &&
      "bg-accent-600 text-white shadow-lg shadow-accent-600/25 hover:bg-accent-500 hover:shadow-accent-500/30",
    variant === "secondary" &&
      "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
    variant === "ghost" && "text-slate-700 hover:bg-slate-100",
    className,
  );
}

export function buttonVariantsInverted({
  size = "md",
  className,
}: {
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-7 py-3.5 text-base",
    "bg-white text-accent-800 shadow-lg hover:bg-accent-50 hover:shadow-xl",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <button type={type} className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}