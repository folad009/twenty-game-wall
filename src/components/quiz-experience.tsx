"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUIZ_QUESTION } from "@/lib/quiz";

type Step = "register" | "quiz" | "done";

const phoneHint = /^[\d\s+().-]{7,}$/;

export function QuizExperience() {
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [answer, setAnswer] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmitRegistration = useMemo(() => {
    return name.trim().length > 1 && phoneHint.test(phone.trim());
  }, [name, phone]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitRegistration) {
      setFormError("Enter your name and a valid phone number.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/participants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = (await res.json()) as {
        participant?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Registration failed.");
      }
      if (!data.participant?.id) {
        throw new Error("Registration failed.");
      }
      setParticipantId(data.participant.id);
      setStep("quiz");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!participantId) return;
    const trimmed = answer.trim();
    if (trimmed.length < 4) {
      setFormError("Share at least a sentence so the room can feel your story.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/participants/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: participantId, answer: trimmed }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save your answer.");
      }
      setStep("done");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save answer.");
    } finally {
      setBusy(false);
    }
  }

  function resetFlow() {
    setStep("register");
    setParticipantId(null);
    setName("");
    setPhone("");
    setAnswer("");
    setFormError(null);
  }

  const stepLabel =
    step === "register" ? "Step 1 of 2" : step === "quiz" ? "Step 2 of 2" : "Complete";

  const stepProgress = step === "register" ? 50 : 100;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
      <header className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {stepLabel}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
            Live game
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Quiz night
        </p>
        <h1 className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
          One honest thing that paid off
        </h1>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Register with how we can reach you, then answer the prompt.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
        <Link
          href="/guest-wall"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Open live guest wall
        </Link>
      </header>

      {step === "register" && (
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Enter the room</CardTitle>
            <CardDescription>
              We will show your name and phone alongside your answer on the guest
              wall.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Jamie Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 sm:h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+1 415 555 0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 sm:h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digits and common separators only—used here so teammates can spot
                  you in the list.
                </p>
              </div>
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={busy || !canSubmitRegistration}
                className="w-full sm:w-auto"
              >
                {busy ? "Saving…" : "Continue to the question"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === "quiz" && (
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Your reflection</CardTitle>
            <CardDescription>
              Take a breath—there is no wrong answer, only a true one.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAnswer}>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Question
                </p>
                <p className="mt-2 font-medium text-foreground">{QUIZ_QUESTION}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Your answer</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  rows={6}
                  placeholder="Describe the work, why it mattered, and how it paid off…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-36 sm:min-h-44"
                  required
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={resetFlow}
                disabled={busy}
                className="w-full sm:w-auto"
              >
                Start over
              </Button>
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy ? "Sending…" : "Share with the room"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === "done" && (
        <Card className="border-primary/20 bg-primary/5 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Thank you</CardTitle>
            <CardDescription>
              Your story is now part of the scrolling wall for everyone following
              along.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              Open the live guest wall page to see new answers appear every few
              seconds.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={resetFlow}>
              Register someone else
            </Button>
            <Link href="/guest-wall" className={buttonVariants()}>
              Go to live guest wall
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
