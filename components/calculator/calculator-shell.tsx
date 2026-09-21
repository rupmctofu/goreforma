"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerValue,
  CalculatorStep,
  EstimationResult,
} from "@/calculators/types";
import { getCalculatorById } from "@/calculators/registry";
import {
  trackCalculatorCompleted,
  trackCalculatorStarted,
  trackCalculatorStepCompleted,
  trackResultViewed,
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
  return true;
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
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [elementsTouched, setElementsTouched] = useState(false);
  const hasSentStart = useRef(false);

  const step = steps[stepIndex];

  useEffect(() => {
    if (hasSentStart.current) return;
    hasSentStart.current = true;
    if (calculator) trackCalculatorStarted(calculator.id);
  }, [calculator]);

  const currentValid = useMemo(
    () => (calculator ? stepIsValid(step, answers) : false),
    [calculator, step, answers],
  );

  const progress = ((stepIndex + 1) / steps.length) * 100;

  function setAnswer(value: AnswerValue) {
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
      return;
    }
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  async function goNext() {
    if (stepIndex < steps.length - 1) {
      if (calculator && step) {
        trackCalculatorStepCompleted({
          calculator: calculator.id,
          step: step.id,
          stepIndex,
          totalSteps: steps.length,
          progress: ((stepIndex + 1) / steps.length) * 100,
        });
      }
      setStepIndex(stepIndex + 1);
      return;
    }
    if (!calculator) return;
    setCalculationError(null);
    setIsCalculating(true);
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
      };
      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "No se pudo calcular la estimación.");
      }
      setEstimate(payload.result);
      setEstimationId(payload.id ?? null);
      setRecoveryUrl(payload.recoveryUrl ?? null);
      trackCalculatorCompleted(calculator.id);
      trackResultViewed(calculator.id);
    } catch (error) {
      setCalculationError(
        error instanceof Error
          ? error.message
          : "No se pudo calcular la estimación. Inténtalo de nuevo.",
      );
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
          <Button variant="ghost" onClick={goBack}>
            <IconArrowLeft className="size-4" />
            Volver a ajustar
          </Button>
        </div>

        <div id="guardar-estimacion" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Guarda tu estimación
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
            <div className="grid gap-3 sm:grid-cols-2">
              {step.options?.map((option) => {
                const checked = Array.isArray(answers[step.id]) &&
                  (answers[step.id] as string[]).includes(option.id);
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
          disabled={!currentValid || isCalculating}
        >
          {isCalculating
            ? "Calculando…"
            : stepIndex === steps.length - 1
              ? "Calcular mi estimación"
              : "Continuar"}
          <IconArrowRight className="size-4" />
        </Button>
      </div>
      {calculationError && (
        <p className="mt-4 text-center text-sm text-red-600" role="alert">
          {calculationError}
        </p>
      )}
    </div>
  );
}
