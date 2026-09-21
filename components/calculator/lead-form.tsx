"use client";

import { useEffect, useState } from "react";
import { trackLeadFormStarted, trackLeadSubmitted } from "@/lib/analytics";
import { Button } from "../ui/button";
import { IconCheck } from "../icons";

interface LeadFormProps {
  calculatorId: string;
  calculatorName: string;
  estimatedBudget?: number;
}

type Errors = Partial<Record<"name" | "email" | "phone" | "postalCode", string>>;

const PHONE_RE = /^[+()\d\s.-]{9,15}$/;
const POSTAL_RE = /^\d{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadForm({ calculatorId, calculatorName, estimatedBudget }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  useEffect(() => {
    trackLeadFormStarted(calculatorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Introduce un email válido.";
    if (!PHONE_RE.test(form.phone.trim())) next.phone = "Introduce un teléfono válido.";
    if (form.postalCode.trim() !== "" && !POSTAL_RE.test(form.postalCode.trim()))
      next.postalCode = "Debe tener 5 dígitos.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          postalCode: form.postalCode.trim() || undefined,
          projectType: calculatorName,
          estimatedBudget: estimatedBudget ? Math.round(estimatedBudget).toString() : "",
        }),
      });
      if (!res.ok) throw new Error("error");
      trackLeadSubmitted(calculatorId);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-accent-100 bg-accent-50 p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-600 text-white">
          <IconCheck className="size-6" />
        </span>
        <p className="mt-4 text-lg font-bold text-slate-900">¡Solicitud enviada!</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Hemos guardado tu estimación de <strong>{calculatorName}</strong>. Te contactaremos
          cuando tengamos profesionales disponibles en tu zona.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" noValidate>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Consigue presupuestos reales</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Déjanos tus datos para que te lleguen presupuestos de profesionales.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 sm:inline-flex">
          Estimación: {estimatedBudget ? `${Math.round(estimatedBudget).toLocaleString("es-ES")} €` : "—"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-800">
          Nombre
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent-400"
            placeholder="P. ej. María García"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent-400"
            placeholder="maria@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Teléfono
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent-400"
            placeholder="600 000 000"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Código postal <span className="font-normal text-muted-foreground">(opcional)</span>
          <input
            type="text"
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={5}
            value={form.postalCode}
            onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent-400"
            placeholder="28001"
            aria-invalid={Boolean(errors.postalCode)}
          />
          {errors.postalCode && (
            <span className="mt-1 block text-xs text-red-600">{errors.postalCode}</span>
          )}
        </label>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Enviando…" : "Solicitar presupuestos"}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sin compromiso. Solo usaremos tus datos para este trámite y nunca los venderemos.
      </p>

      {status === "error" && (
        <p className="mt-3 text-center text-sm text-red-600">
          No se pudo enviar la solicitud. Inténtalo de nuevo en un momento.
        </p>
      )}
    </form>
  );
}