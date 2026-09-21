"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerValue,
  CalculatorStep,
  EstimationResult,
} from "@/calculators/types";
import { calculate } from "@/calculators/engine";
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

export function CalculatorShell({ calculatorId }: { calculatorId: string }) {
  const calculator = useMemo(() => getCalculatorById(calculatorId), [calculatorId]);
  const steps = calculator?.steps ?? [];
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [estimate, setEstimate] = useState<EstimationResult | null>(null);
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
    setAnswers((a) => ({ ...a, [step.id]: value }));
  }

  function toggleElement(id: string) {
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

  function goNext() {
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
    try {
      const result = calculate(calculator, answers);
      setEstimate(result);
      trackCalculatorCompleted(calculator.id);
      trackResultViewed(calculator.id);
    } catch (err) {
      console.error("[goreforma] No se pudo calcular la estimación", err);
    }
  }

  if (!calculator) return null;

  if (estimate) {
    return (
      <div className="animate-step-in space-y-8">
        <ResultView estimate={estimate} calculatorName={calculator.name} />
        <div className="text-center">
          <Button variant="ghost" onClick={goBack}>
            <IconArrowLeft className="size-4" />
            Volver a ajustar
          </Button>
        </div>

        <div id="presupuestos" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Consigue presupuestos reales
            </h2>
            <span className="hidden text-sm text-muted-foreground sm:block">
              Rellena el formulario y te contactaremos
            </span>
          </div>
          <LeadForm
            calculatorId={calculator.id}
            calculatorName={calculator.name}
            estimatedBudget={estimate.avg}
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
          <span className="font-semibold text-slate-900">
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

      {/* Pregunta */}
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
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
          disabled={!currentValid}
        >
          {stepIndex === steps.length - 1 ? "Calcular mi estimación" : "Continuar"}
          <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}