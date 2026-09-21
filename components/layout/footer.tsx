import Link from "next/link";
import { calculators } from "@/calculators/registry";
import { siteConfig } from "@/seo/site";
import { Container } from "../ui/container";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Calculadoras</p>
            <ul className="mt-3 space-y-2">
              {calculators.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-accent-600"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Legal</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/aviso-legal" className="text-sm text-muted-foreground transition-colors hover:text-accent-600">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-muted-foreground transition-colors hover:text-accent-600">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-slate-200 pt-6 text-xs leading-5 text-muted-foreground">
          Las estimaciones de GoReforma son orientativas y no constituyen un presupuesto ni
          un contrato. Los importes mostrados son de referencia para el mercado español y pueden
          variar según la zona, el estado real de la vivienda y el profesional contratado.
          Precios actualizados a la fecha de publicación del catálogo.
        </p>
      </Container>
    </footer>
  );
}