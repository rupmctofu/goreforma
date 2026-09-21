import Image from "next/image";
import { calculate } from "@/calculators/engine";
import { calculators } from "@/calculators/registry";
import { formatEUR } from "@/lib/format";
import { siteConfig } from "@/seo/site";
import { CalculatorIcon, IconArrowRight, IconCheck } from "@/components/icons";
import { Accordion } from "@/components/ui/accordion";
import { Badge, Card } from "@/components/ui/card";
import { buttonVariants, buttonVariantsInverted } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TrackedLink } from "@/components/analytics/track-link";
import { JsonLd } from "@/components/seo/json-ld";

function exampleResult(calculatorId: string) {
  const examples: Record<string, Record<string, string | number | string[]>> = {
    bath: { scope: "completa", area: 5, quality: "MEDIA", elements: [] },
    kitchen: { scope: "completa", area: 10, quality: "MEDIA", elements: [] },
    integral: { scope: "completa", area: 80, quality: "MEDIA", elements: [] },
    painting: {
      scope: "paredes_techos",
      area: 90,
      quality: "MEDIA",
      elements: ["preparacion_superficie"],
    },
  };
  const c = calculators.find((c) => c.id === calculatorId);
  if (!c) return null;
  try {
    const answer = examples[calculatorId];
    if (!answer) return null;
    const result = calculate(c, answer);
    return { range: `${formatEUR(result.min)} – ${formatEUR(result.max)}`, result };
  } catch {
    return null;
  }
}

const cardImages: Record<string, { src: string; alt: string }> = {
  bath: { src: "/images/bano.jpg", alt: "Baño reformado con azulejos blancos y lavabo moderno" },
  kitchen: {
    src: "/images/cocina.jpg",
    alt: "Cocina moderna reformada con armarios blancos y encimera de mármol",
  },
  integral: {
    src: "/images/integral.jpg",
    alt: "Salón reformado con sofá gris junto a gran ventanal",
  },
  painting: {
    src: "/images/pintura.jpg",
    alt: "Pintor aplicando pintura a una pared con rodillo durante una reforma",
  },
};

const FAQ_ITEMS = [
  {
    question: "¿Las estimaciones son vinculantes?",
    answer:
      "No. Los importes son orientativos y calculados con precios de referencia del mercado español. El coste final depende del profesional, la zona geográfica y las características concretas de tu vivienda. Pide siempre presupuesto detallado antes de empezar la obra.",
  },
  {
    question: "¿De dónde salen los precios?",
    answer:
      "El catálogo de precios de GoReforma se publica con una fecha de actualización visible en cada resultado. Combina materiales y mano de obra típicos del sector para cada tipo de reforma.",
  },
  {
    question: "¿Qué incluye el precio por m²?",
    answer:
      "Cada partida muestra su unidad (por m², por metro lineal, por unidad o global). La estimación total suma todas las partidas y aplica el nivel de acabado (básica, media o premium) que elijas.",
  },
  {
    question: "¿Puedo ajustar el resultado?",
    answer:
      "Sí. Tras ver tu estimación puedes volver atrás y cambiar metros, alcance, calidad o los elementos a incluir para afinar el rango al máximo.",
  },
];

export default function Home() {
  const examples = [
    { calculator: calculators[0], data: exampleResult("bath") },
    { calculator: calculators[1], data: exampleResult("kitchen") },
    { calculator: calculators[2], data: exampleResult("integral") },
    { calculator: calculators[3], data: exampleResult("painting") },
  ];

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
  };

  return (
    <>
      <JsonLd data={webSiteJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-50/70 via-background to-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-10 size-96 rounded-full bg-accent-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 bottom-0 size-80 rounded-full bg-slate-200/50 blur-3xl"
        />
        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="animate-fade-up">
            <Badge>Precios de referencia en España, sin registro</Badge>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              ¿Cuánto puede costar tu <span className="text-accent-600">reforma?</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Calcula una estimación orientativa del coste de tu reforma en
              pocos minutos. Baños, cocinas, reformas integrales y pintura.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <TrackedLink
                href={`/${calculators[0].slug}`}
                calculator={calculators[0].id}
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Calcular mi reforma
                <IconArrowRight className="size-4" />
              </TrackedLink>
              <a
                href="#calculadoras"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Ver calculadoras
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Resultado en 2 minutos", "3 niveles de calidad", "Desglose por partidas"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <IconCheck className="size-4 text-accent-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-soft-float overflow-hidden rounded-[2rem] border border-accent-100 shadow-xl shadow-accent-900/10">
              <Image
                src="/images/hero-kitchen.jpg"
                alt="Cocina reformada moderna con isla y salpicadero de azulejos"
                width={1600}
                height={1067}
                priority
                className="h-[26rem] w-full object-cover"
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </div>
            <div className="animate-fade-up absolute -bottom-8 left-6 right-6 rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-lg shadow-accent-900/5 backdrop-blur">
              <p className="text-sm font-semibold text-muted-foreground">Ejemplo orientativo</p>
              <p className="mt-1 text-lg font-bold text-slate-900">Reforma de cocina de 10 m²</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-accent-600">
                {exampleResult("kitchen")?.range}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Calidad media, muebles, encimera y electrodomésticos incluidos.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Calculadoras */}
      <section id="calculadoras" className="scroll-mt-20 py-20">
        <Container>
          <div className="max-w-2xl">
            <Badge>Calculadoras</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Elige qué quieres reformar
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Cada una te guía paso a paso para calcular un presupuesto
              orientativo ajustado.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {examples.map(({ calculator, data }) => (
              <TrackedLink
                key={calculator.id}
                href={`/${calculator.slug}`}
                calculator={calculator.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent-200 hover:shadow-lg hover:shadow-accent-900/5"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={cardImages[calculator.id].src}
                    alt={cardImages[calculator.id].alt}
                    width={1000}
                    height={750}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-2xl bg-white/90 text-accent-600 shadow-sm ring-1 ring-white/60 backdrop-blur">
                    <CalculatorIcon name={calculator.icon} className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {calculator.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {calculator.shortDescription}
                  </p>
                  <p className="mt-4 font-semibold text-slate-900">
                    {data?.range ?? "—"}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600">
                    Empezar a calcular
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </TrackedLink>
            ))}
          </div>
        </Container>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-20 bg-white py-20">
        <Container>
          <div className="max-w-2xl">
            <Badge>Cómo funciona</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tres pasos, menos de 2 minutos
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Describe tu reforma",
                text: "Elige alcance, metros y qué elementos quieres cambiar. Se incluyen preselecciones según tu caso.",
              },
              {
                n: "02",
                title: "Elige la calidad",
                text: "Acabado básico, medio o premium. El rango se ajusta automáticamente a cada nivel.",
              },
              {
                n: "03",
                title: "Consulta tu estimación",
                text: "Recibe un rango orientativo por m², con desglose de partidas y las hipótesis usadas.",
              },
            ].map((s) => (
              <Card key={s.n} className="relative overflow-hidden">
                <span className="absolute right-6 top-5 text-5xl font-extrabold text-slate-100">
                  {s.n}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{s.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Ejemplos */}
      <section id="ejemplos" className="scroll-mt-20 py-20">
        <Container>
          <div className="max-w-2xl">
            <Badge>Ejemplos orientativos</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cuánto cuestan las reformas más habituales
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {examples.map(({ calculator, data }) => (
              <Card key={calculator.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
                    <CalculatorIcon name={calculator.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{calculator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {data?.result.assumptions[0]}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-xl font-bold text-slate-900">
                  {data?.range ?? "—"}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Rangos orientativos según el catálogo de precios de GoReforma, para
            acabados de calidad media. El resultado final depende de cada caso.
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-white py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge>Preguntas frecuentes</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dudas habituales sobre presupuestos
            </h2>
            <TrackedLink
              href={`/${calculators[0].slug}`}
              calculator={calculators[0].id}
              className={buttonVariants({ className: "mt-6" })}
            >
              Empezar mi estimación
              <IconArrowRight className="size-4" />
            </TrackedLink>
          </div>
          <Accordion items={FAQ_ITEMS} />
        </Container>
      </section>

      {/* CTA final */}
      <section className="py-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-900 px-8 py-14 text-center text-white sm:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-accent-500/40 blur-3xl"
            />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
              Empieza a calcular tu presupuesto
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Sin pedir tus datos: solo responde unas preguntas y obtén el rango
              orientativo de tu reforma.
            </p>
            <TrackedLink
              href={`/${calculators[0].slug}`}
              calculator={calculators[0].id}
              className={buttonVariantsInverted({
                size: "lg",
                className: "relative mt-8",
              })}
            >
              Calcular mi reforma ahora
              <IconArrowRight className="size-4" />
            </TrackedLink>
          </div>
        </Container>
      </section>
    </>
  );
}