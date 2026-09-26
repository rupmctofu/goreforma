import Image from "next/image";
import Link from "next/link";
import { calculate } from "@/calculators/engine";
import { calculators } from "@/calculators/registry";
import { formatEUR } from "@/lib/format";
import { siteConfig } from "@/seo/site";
import {
  CalculatorIcon,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconList,
  IconLock,
} from "@/components/icons";
import { Accordion } from "@/components/ui/accordion";
import { Badge, Card } from "@/components/ui/card";
import { buttonVariants, buttonVariantsInverted } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/seo/json-ld";
import { BetaNotice } from "@/components/ui/beta-notice";

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

const FAQ_ITEMS = [
  {
    question: "¿La estimación coincide con el presupuesto final?",
    answer:
      "No necesariamente. El precio final depende de las características concretas de la vivienda, su estado, el acceso, los materiales elegidos y las condiciones de cada profesional. GoReforma sirve como referencia inicial para entender el orden de magnitud y qué partidas intervienen.",
  },
  {
    question: "¿De dónde salen los precios?",
    answer:
      "Estamos construyendo un catálogo de precios de referencia del mercado español, organizado por partida, unidad y nivel de calidad. Cada estimación muestra el catálogo con el que se ha calculado y las hipótesis aplicadas, para que sepas exactamente cómo se ha obtenido el rango. El catálogo todavía se está afinando.",
  },
  {
    question: "¿Qué diferencia hay entre estimación y presupuesto?",
    answer:
      "Una estimación es un rango orientativo calculado con precios de referencia. Un presupuesto es una oferta concreta de un profesional para tu vivienda, tras estudiar el caso real. GoReforma no emite presupuestos ni pone a nadie en contacto contigo.",
  },
  {
    question: "¿Necesito registrarme o dejar mis datos?",
    answer:
      "No. Puedes ver el resultado completo sin dar ningún dato. El email es solo si quieres guardar la estimación y volver a consultarla después; es opcional.",
  },
  {
    question: "¿Qué incluye la estimación?",
    answer:
      "Un rango mínimo, medio y máximo, el coste por m² y un desglose por partidas. Cada partida muestra su unidad (por m², por metro lineal, por unidad o global) y las hipótesis usadas.",
  },
  {
    question: "¿Puedo ajustar el resultado?",
    answer:
      "Sí. Tras ver tu estimación vuelve atrás y cambia metros, alcance, calidad o los elementos incluidos para afinar el rango.",
  },
  {
    question: "¿Las estimaciones son vinculantes?",
    answer:
      "No. No constituyen un presupuesto ni un contrato, y no deben utilizarse como precio final de la obra.",
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
            <Badge>Gratis · Sin registro · 2 minutos</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Entiende cuánto puede costar tu reforma{" "}
              <span className="text-accent-600">antes de pedir presupuestos</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Elige qué vas a reformar, responde unas preguntas y obtén un rango de
              precio con el desglose de cada partida: qué se paga, cuánto y por qué.
              Sin registro y sin esperas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/${calculators[0].slug}`}
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Calcular mi reforma gratis
                <IconArrowRight className="size-4" />
              </Link>
              <a
                href="#calculadoras"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Ver las 4 calculadoras
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "Un rango, no un precio cerrado",
                "Cada partida con su cantidad y su precio",
                "Acabado básico, medio o premium",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <IconCheck className="size-4 text-accent-600" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 max-w-xl">
              <BetaNotice />
            </div>
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

      {/* Propuesta de valor */}
      <section className="border-y border-slate-200/70 bg-white/60 py-12">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: IconClock,
                title: "Dos minutos, no una tarde",
                text: "Responde unas preguntas y tienes el rango. No hace falta llamar a nadie ni esperar a nadie.",
              },
              {
                icon: IconList,
                title: "Entender de qué depende el precio",
                text: "El coste cambia según el estado de la vivienda, el acceso y los acabados. Por eso te mostramos las partidas, no solo un total.",
              },
              {
                icon: IconLock,
                title: "Guarda el enlace y vuelve cuando quieras",
                text: "El cálculo se queda en el enlace de esta estimación. Decide con calma, sin volver a empezar.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Calculadoras */}
      <section id="calculadoras" className="scroll-mt-20 py-20">
        <Container>
          <div className="max-w-2xl">
            <Badge>Elige tu reforma</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              ¿Qué vas a reformar?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Cuatro cálculos distintos, con el mismo nivel de detalle en el desglose.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {examples.map(({ calculator, data }) => (
              <Link
                key={calculator.id}
                href={`/${calculator.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent-200 hover:shadow-lg hover:shadow-accent-900/5"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={calculator.image.src}
                    alt={calculator.image.alt}
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
                    Calcular
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
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
              Tres pasos, dos minutos
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Dinos qué vas a cambiar",
                text: "Alcance, metros y los elementos concretos. Los más habituales ya vienen preseleccionados para que no empieces de cero.",
              },
              {
                n: "02",
                title: "Elige la calidad",
                text: "Acabado básico, medio o premium. Es lo que más mueve el precio final, así que decide con calma.",
              },
              {
                n: "03",
                title: "Recibe tu rango",
                text: "Mínimo, medio y máximo, con el coste por m² y cada partida con su cantidad. Guárdalo para consultarlo más adelante.",
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
            <Badge>Ejemplos</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Así se ve un resultado
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
              Ejemplos calculados con el mismo motor que usarás tú. Cambia los datos
              y verás cómo se mueve el rango.
          </p>
        </Container>
      </section>

      {/* De dónde salen las cifras */}
      <section id="metodo" className="scroll-mt-20 border-y border-slate-200/70 bg-white py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Badge>El método</Badge>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                De dónde salen las cifras
              </h2>
            </div>
            <div className="space-y-4 text-lg leading-8 text-muted-foreground">
              <p>
                GoReforma calcula con un catálogo de precios de referencia
                organizado por partida, unidad y nivel de calidad. Cada estimación
                muestra el catálogo con el que se ha hecho y las hipótesis aplicadas.
              </p>
              <p>
                El catálogo todavía se está afinando, así que el rango es orientativo
                y provisional. Lo que sí es exacto es el método: qué partidas entran
                en el cálculo, con qué cantidad y con qué unidad. Eso es lo que te
                permite llegar a los presupuestos sabiendo qué preguntar.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-white py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge>Preguntas frecuentes</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dudas habituales
            </h2>
            <Link
              href={`/${calculators[0].slug}`}
              className={buttonVariants({ className: "mt-6" })}
            >
              Calcular mi reforma
              <IconArrowRight className="size-4" />
            </Link>
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
              ¿Cuánto costará la tuya?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Gratis, sin registro y en dos minutos. Y si el rango te sorprende,
              mejor: llegarás a los presupuestos sabiendo qué preguntar.
            </p>
            <Link
              href={`/${calculators[0].slug}`}
              className={buttonVariantsInverted({
                size: "lg",
                className: "relative mt-8",
              })}
            >
              Calcular mi reforma gratis
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
