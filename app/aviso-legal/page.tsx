import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Aviso legal de GoReforma, web de estimación orientativa de costes de reforma.",
};

export default function AvisoLegalPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Aviso legal" }]}
        />
        <Badge className="mt-6">Aviso legal</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Aviso legal
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="font-bold text-slate-900">Información general</h2>
            <p className="mt-2">
              Este sitio web se ofrece como una herramienta de estimación
              orientativa de costes de reformas del hogar. Las estimaciones se
              calculan mediante fórmulas propias con precios de referencia del
              mercado español y no constituyen, en ningún caso, un presupuesto
              ni un asesoramiento profesional en construcción o reformas.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Naturaleza de los resultados</h2>
            <p className="mt-2">
              Los importes mostrados son rangos orientativos con fines
              informativos. El coste real de una reforma depende de la zona
              geográfica, el estado de la vivienda, el profesional contratado,
              los materiales elegidos y otras circunstancias particulares. Antes
              de iniciar cualquier obra, solicita siempre presupuestos
              detallados a profesionales homologados.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Exención de responsabilidad</h2>
            <p className="mt-2">
              No garantizamos la exactitud, actualidad o idoneidad de las
              estimaciones para tu caso concreto. No nos hacemos responsables de
              decisiones tomadas sobre la base de esta información ni de los
              perjuicios que pudieran derivarse.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Propiedad intelectual</h2>
            <p className="mt-2">
              El contenido, diseño, logotipo y código de este sitio son
              propiedad de sus titulares. Queda prohibida su reproducción,
              distribución o uso sin autorización expresa.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Legislación aplicable</h2>
            <p className="mt-2">
              Este aviso se rige por la legislación española. Para cualquier
              controversia, las partes se someten a los juzgados y tribunales que
              resulten competentes conforme a la ley.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}