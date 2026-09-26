"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerValue,
  CalculatorStep,
  EstimationResult,
} from "@/calculators/types";
import { getCalculatorById } from "@/calculators/registry";
import {
  trackCalculatorView,
  trackCalculatorStart,
  trackCalculatorStepCompleted,
  trackCalculatorValidationError,
  trackEstimationCreated,
  trackEstimationFailed,
  trackEstimationViewed,
} from "@/lib/analytics";
import { cn } from "../ui/container";
import { Button } from "../ui/button";
import { IconArrowLeft, IconArrowRight, IconCheck } from "../icons";
import { ResultView } from "./result-view";
import { LeadForm } from "./lead-form";

function parseNumber(value: AnswerValue | undefined): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function stepIsValid(step: CalculatorStep, answers: Record<string, AnswerValue>): boolean {
  const value = answers[step.id];
  if (step.optional && (value === undefined || value === null || value === "")) {
    return true;
  }
  if (step.fieldType === "single_choice") {
    return typeof value === "string" && value !== "";
  }
  if (step.fieldType === "number") {
    const n = parseNumber(value);
    if (n === null) return false;
    if (step.min !== undefined && n < step.min) return false;
    if (step.max !== undefined && n > step.max) return false;
    return n > 0;
  }
  return Array.isArray(value);
}

type ValidationIssue = { field: string; errorType: string; message: string };

function getValidationIssue(
  calculator: NonNullable<ReturnType<typeof getCalculatorById>>,
  step: CalculatorStep,
  answers: Record<string, AnswerValue>,
): ValidationIssue | null {
  const value = answers[step.id];
  const isSpecialPaint =
    calculator.id === "painting" &&
    Array.isArray(answers.elements) &&
    answers.elements.includes("pintura_especial");

  if (step.optional && (value === undefined || value === null || value === "")) {
    if (step.id === "special_area" && isSpecialPaint) {
      return {
        field: step.id,
        errorType: "dependency",
        message: "Indica cuántos m² de baño o cocina vas a pintar con pintura especial.",
      };
    }
    return null;
  }

  if (step.fieldType === "single_choice" && !stepIsValid(step, answers)) {
    return { field: step.id, errorType: "required", message: "Selecciona una opción para continuar." };
  }

  if (step.fieldType === "number") {
    const numeric = parseNumber(value);
    if (numeric === null) {
      return { field: step.id, errorType: "invalid_number", message: "Introduce un número válido." };
    }
    if (step.min !== undefined && numeric < step.min) {
      return { field: step.id, errorType: "below_min", message: `El valor mínimo es ${step.min}.` };
    }
    if (step.max !== undefined && numeric > step.max) {
      return { field: step.id, errorType: "above_max", message: `El valor máximo es ${step.max}.` };
    }
    if (numeric <= 0) {
      return { field: step.id, errorType: "below_min", message: "Introduce un valor mayor que cero." };
    }
    if (step.id === "special_area" && isSpecialPaint) {
      const area = parseNumber(answers.area);
      if (area !== null && numeric > area) {
        return {
          field: step.id,
          errorType: "dependency",
          message: "La superficie especial no puede ser mayor que la superficie total.",
        };
      }
    }
  }

  if (!stepIsValid(step, answers)) {
    return { field: step.id, errorType: "invalid_value", message: "Revisa este campo para continuar." };
  }
  return null;
}

function answerSummary(
  step: CalculatorStep,
  answers: Record<string, AnswerValue>,
): string | null {
  const value = answers[step.id];
  if (value === undefined || value === null || value === "") return null;
  if (step.fieldType === "number") {
    return `${value}${step.unit ? ` ${step.unit}` : ""}`;
  }
  if (step.fieldType === "single_choice") {
    return step.options?.find((o) => o.id === value)?.label ?? String(value);
  }
  if (step.fieldType === "multi_choice") {
    const selected = Array.isArray(value) ? value : [];
    return selected.length > 0
      ? `${selected.length} ${selected.length === 1 ? "elemento" : "elementos"}`
      : null;
  }
  return null;
}

export function CalculatorShell({ calculatorId }: { calculatorId: string }) {
  const calculator = useMemo(() => getCalculatorById(calculatorId), [calculatorId]);
  const steps = calculator?.steps ?? [];
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [estimate, setEstimate] = useState<EstimationResult | null>(null);
  const [estimationId, setEstimationId] = useState<string | null>(null);
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);
  const [calculationErrors, setCalculationErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [elementsTouched, setElementsTouched] = useState(false);
  const hasSentView = useRef(false);
  const hasSentStart = useRef(false);

  const step = steps[stepIndex];

  useEffect(() => {
    if (hasSentView.current || !calculator) return;
    hasSentView.current = true;
    trackCalculatorView(calculator.id);
  }, [calculator]);

  function markCalculatorStarted() {
    if (hasSentStart.current || !calculator) return;
    hasSentStart.current = true;
    trackCalculatorStart(calculator.id);
  }

  useEffect(() => {
    if (!calculator || !estimate || !estimationId) return;
    trackEstimationViewed(calculator.id, "new");
  }, [calculator, estimate, estimationId]);

  const progress = ((stepIndex + 1) / steps.length) * 100;

  function setAnswer(value: AnswerValue) {
    markCalculatorStarted();
    const getDefaultElements = calculator?.getDefaultElements;
    setAnswers((a) => {
      const next = { ...a, [step.id]: value };
      if (
        step.id === "scope" &&
        !elementsTouched &&
        getDefaultElements
      ) {
        next.elements = getDefaultElements(next);
      }
      return next;
    });
  }

  function toggleElement(id: string) {
    markCalculatorStarted();
    setElementsTouched(true);
    const current = Array.isArray(answers[step.id]) ? (answers[step.id] as string[]) : [];
    setAnswers((a) => ({
      ...a,
      [step.id]: current.includes(id)
        ? current.filter((e) => e !== id)
        : [...current, id],
    }));
  }

  function goBack() {
    if (estimate) {
      setEstimate(null);
      setCalculationErrors([]);
      return;
    }
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  async function goNext() {
    if (!calculator || !step) return;

    const issue = getValidationIssue(calculator, step, answers);
    if (issue) {
      trackCalculatorValidationError({
        calculatorId: calculator.id,
        stepId: step.id,
        field: issue.field,
        errorType: issue.errorType,
      });
      setCalculationErrors([issue.message]);
      return;
    }

    const outcome =
      step.optional && (answers[step.id] === undefined || answers[step.id] === "")
        ? "skipped"
        : "completed";
    trackCalculatorStepCompleted({
      calculatorId: calculator.id,
      stepId: step.id,
      stepIndex,
      stepCount: steps.length,
      outcome,
    });

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    setCalculationErrors([]);
    setIsCalculating(true);
    let failureTracked = false;
    try {
      const response = await fetch("/api/estimations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculatorId: calculator.id, answers }),
      });
      const payload = (await response.json()) as {
        result?: EstimationResult;
        id?: string;
        recoveryUrl?: string;
        error?: string;
        errors?: Record<string, string>;
        algorithmVersion?: string;
      };
      if (!response.ok || !payload.result) {
        const statusClass = response.status >= 500 ? "5xx" : response.status >= 400 ? "4xx" : "network";
        if (response.status === 429) {
          trackEstimationFailed({ calculatorId: calculator.id, errorType: "rate_limit", statusClass });
          failureTracked = true;
          throw new Error("Has enviado demasiadas peticiones. Espera un minuto e inténtalo de nuevo.");
        }
        if (response.status === 413) {
          trackEstimationFailed({ calculatorId: calculator.id, errorType: "payload_too_large", statusClass });
          failureTracked = true;
          throw new Error("La petición es demasiado grande. Revisa los datos e inténtalo de nuevo.");
        }
        if (payload.errors && Object.keys(payload.errors).length > 0) {
          for (const field of Object.keys(payload.errors)) {
            trackCalculatorValidationError({
              calculatorId: calculator.id,
              stepId: field,
              field,
              errorType: "server_validation",
            });
          }
          setCalculationErrors(Object.values(payload.errors));
          trackEstimationFailed({ calculatorId: calculator.id, errorType: "validation", statusClass });
          failureTracked = true;
          throw new Error("Corrige los errores del formulario para continuar.");
        }
        trackEstimationFailed({ calculatorId: calculator.id, errorType: "server", statusClass });
        failureTracked = true;
        throw new Error(payload.error ?? "No se pudo calcular la estimación.");
      }
      setEstimate(payload.result);
      setEstimationId(payload.id ?? null);
      setRecoveryUrl(payload.recoveryUrl ?? null);
      trackEstimationCreated({
        calculatorId: calculator.id,
        catalogVersion: payload.result.catalogVersion,
        algorithmVersion: payload.algorithmVersion ?? "prototype-0",
        breakdownCount: payload.result.breakdown.length,
      });
    } catch (error) {
      if (!failureTracked) {
        trackEstimationFailed({ calculatorId: calculator.id, errorType: "network", statusClass: "network" });
      }
      const message = error instanceof Error ? error.message : "No se pudo calcular la estimación. Inténtalo de nuevo.";
      setCalculationErrors((prev) => (prev.length > 0 ? prev : [message]));
    } finally {
      setIsCalculating(false);
    }
  }

  if (!calculator) return null;

  if (estimate) {
    return (
      <div className="animate-step-in space-y-8">
        <div aria-live="polite">
          <ResultView
            estimate={estimate}
            calculatorName={calculator.name}
            recoveryUrl={recoveryUrl ?? undefined}
          />
        </div>
        <div className="text-center">
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            ¿El rango te parece alto o bajo? Vuelve atrás y cambia el acabado o los
            metros para compararlo.
          </p>
          <Button variant="ghost" onClick={goBack} className="mt-2">
            <IconArrowLeft className="size-4" />
            Volver a ajustar
          </Button>
        </div>

        <div id="guardar-estimacion" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Guarda esta estimación
            </h2>
            <span className="hidden text-sm text-muted-foreground sm:block">
              Opcional · solo con email
            </span>
          </div>
          <LeadForm
            calculatorId={calculator.id}
            calculatorName={calculator.name}
            estimationId={estimationId ?? undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-step-in rounded-[2rem] border border-slate-200 bg-surface p-6 shadow-sm sm:p-10">
      {/* Progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900" aria-live="polite">
            Paso {stepIndex + 1} de {steps.length}
          </span>
          <span className="text-muted-foreground">{step.title}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={stepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label="Progreso del formulario"
          />
        </div>
      </div>

      {steps.slice(0, stepIndex).some((s) => answerSummary(s, answers)) && (
        <ul className="mb-6 flex flex-wrap gap-2" aria-label="Pasos respondidos">
          {steps.slice(0, stepIndex).map((s, idx) => {
            const summary = answerSummary(s, answers);
            if (!summary) return null;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
                >
                  {s.title}: {summary}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pregunta */}
      <h2
        aria-live="polite"
        className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
      >
        {step.question}
      </h2>

      {/* Campo */}
      <div className="mt-8">
        {step.fieldType === "single_choice" && (
          <div role="radiogroup" aria-label={step.question} className="grid gap-3">
            {step.options?.map((option) => {
              const checked = answers[step.id] === option.id;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  key={option.id}
                  onClick={() => setAnswer(option.id)}
                  className={cn(
                    "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-150",
                    checked
                      ? "border-accent-500 bg-accent-50 ring-1 ring-accent-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      checked ? "border-accent-500 bg-accent-500" : "border-slate-300",
                    )}
                  >
                    {checked && <IconCheck className="size-3 text-white" />}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block text-sm leading-6 text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step.fieldType === "number" && (
          <div>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={typeof answers[step.id] === "string" ? (answers[step.id] as string) : ""}
                onChange={(e) => setAnswer(e.target.value)}
                min={step.min}
                max={step.max}
                placeholder={step.placeholder}
                aria-required={!step.optional}
                aria-label={step.question}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-2xl font-bold text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-accent-400"
              />
              {step.unit && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  {step.unit}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {step.help && <span>{step.help}</span>}
                {step.optional && <span className="text-xs text-slate-400">Opcional</span>}
              {step.min !== undefined && step.max !== undefined && (
                <span className="text-xs text-slate-400">
                  Entre {step.min} y {step.max} {step.unit}
                </span>
              )}
            </div>
          </div>
        )}

        {step.fieldType === "multi_choice" && (
          <div>
            {(() => {
              const defaults = calculator.getDefaultElements?.(answers) ?? [];
              const current = Array.isArray(answers[step.id]) ? (answers[step.id] as string[]) : [];
              const showDefaultHint =
                !elementsTouched &&
                defaults.length > 0 &&
                defaults.length === current.length &&
                defaults.every((id) => current.includes(id));
              return (
                <>
                  {showDefaultHint && (
                    <p className="mb-3 text-sm font-medium text-accent-700">
                      Elementos incluidos por defecto; puedes quitar los que no apliquen.
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {step.options?.map((option) => {
                      const checked = current.includes(option.id);
                      return (
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          key={option.id}
                          onClick={() => toggleElement(option.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                            checked
                              ? "border-accent-500 bg-accent-50 ring-1 ring-accent-500/20"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-md border",
                              checked
                                ? "border-accent-500 bg-accent-500 text-white"
                                : "border-slate-300 text-transparent",
                            )}
                          >
                            <IconCheck className="size-3" />
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
            {step.help && (
              <p className="mt-3 text-sm text-muted-foreground">{step.help}</p>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={goBack} className="text-slate-600">
          <IconArrowLeft className="size-4" />
          Atrás
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={goNext}
          disabled={isCalculating}
        >
          {isCalculating
            ? "Calculando…"
            : stepIndex === steps.length - 1
              ? "Calcular mi estimación"
              : "Continuar"}
          <IconArrowRight className="size-4" />
        </Button>
      </div>
      {calculationErrors.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p className="font-semibold">No se pudo calcular la estimación:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {calculationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
