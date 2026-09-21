import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { calculators, getCalculatorBySlug } from "@/calculators/registry";
import { getCalculatorContent } from "@/content/calculators";
import { siteConfig } from "@/seo/site";
import { CalculatorShell } from "@/components/calculator/calculator-shell";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CalculatorIcon, IconCheck, IconArrowRight } from "@/components/icons";

export const dynamicParams = false;

const pageImages: Record<string, { src: string; alt: string }> = {
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

export function generateStaticParams() {
  return calculators.map((calculator) => ({ slug: calculator.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  const content = getCalculatorContent(slug);
  if (!calculator || !content) return {};

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: `/${calculator.slug}` },
    openGraph: {
      type: "website",
      title: content.metaTitle,
      description: content.metaDescription,
      url: `/${calculator.slug}`,
      images: [
        {
          url: pageImages[calculator.id]?.src,
          width: 1000,
          height: 750,
          alt: pageImages[calculator.id]?.alt,
        },
      ].filter((img) => Boolean(img.url)),
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  const content = getCalculatorContent(slug);
  if (!calculator || !content) notFound();

  const otherCalculators = calculators.filter((c) => c.id !== calculator.id);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: calculator.name,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="border-b border-slate-200/70 bg-gradient-to-b from-accent-50/60 to-background py-12">
        <Container>
          <Breadcrumbs
            items={[{ label: "Inicio", href: "/" }, { label: calculator.name }]}
          />
          <div className="mt-6 flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-100 sm:flex">
              <CalculatorIcon name={calculator.icon} className="size-7" />
            </span>
            <div>
              <Badge>Calculadora</Badge>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {calculator.name}
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            {calculator.shortDescription}
          </p>
          {pageImages[calculator.id] && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/70 shadow-sm">
              <Image
                src={pageImages[calculator.id].src}
                alt={pageImages[calculator.id].alt}
                width={1000}
                height={750}
                className="h-56 w-full object-cover sm:h-72"
                sizes="(min-width: 1024px) 80vw, 100vw"
              />
            </div>
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <CalculatorShell calculatorId={calculator.id} />

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-surface p-6">
              <h2 className="text-lg font-bold text-slate-900">En qué se basa</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {content.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                      <IconCheck className="size-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-surface p-6">
              <h2 className="text-lg font-bold text-slate-900">Otras calculadoras</h2>
              <ul className="mt-4 space-y-2">
                {otherCalculators.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/${c.slug}`}
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:border-accent-200 hover:bg-accent-50/50"
                    >
                      <span className="flex items-center gap-3">
                        <CalculatorIcon name={c.icon} className="size-5 text-accent-600" />
                        <span className="font-medium text-slate-800">{c.name}</span>
                      </span>
                      <IconArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge>Sobre el cálculo</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Precio orientativo de {calculator.name.toLowerCase()}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.intro}</p>
          </div>
          <Accordion items={content.faqs} />
        </Container>
      </section>
    </>
  );
}