import Link from "next/link";
import { cn } from "../ui/container";

/**
 * Símbolo de GoReforma: cuadrado de esquinas redondeadas con el monograma.
 * Geometría tomada de `grafica/img/logo-goReforma.svg`. Los colores llegan por
 * token de Tailwind para que el mark siga la paleta del tema.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50.35 50.35"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0"
        y="0"
        width="50.35"
        height="50.35"
        rx="11.55"
        ry="11.55"
        className="fill-accent-500"
      />
      <polygon
        className="fill-white"
        points="39.83,27.09 25.18,12.44 10.53,27.09 7.7,24.26 25.18,6.78 42.66,24.26"
      />
      <path
        className="fill-white"
        d="M25.17,42.74c-6.79,0-12.31-5.52-12.31-12.31v-10.25h4v10.25c0,4.58,3.73,8.31,8.31,8.31,3.89,0,7.17-2.69,8.06-6.31h-7.44v-4h11.68v2c0,6.79-5.52,12.31-12.31,12.31Z"
      />
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
      <LogoMark className="size-7 shrink-0" />
      <span className="text-lg">
        <span className={variant === "light" ? "text-white" : "text-brand-800"}>
          Go
        </span>
        <span className="text-accent-500">Reforma</span>
      </span>
    </Link>
  );
}
