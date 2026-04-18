"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Participant } from "@/lib/quiz";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function SegmentGroup({
  group,
  segmentIndex,
  participantKeyPrefix,
}: {
  group: Participant[];
  segmentIndex: number;
  participantKeyPrefix: string;
}) {
  return (
    <section className="rounded-xl border bg-card p-3 shadow-sm ring-1 ring-border/60 sm:p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Segment {segmentIndex + 1}
      </p>
      <Separator className="my-3" />
      <ul className="space-y-4">
        {group.map((p) => (
          <li key={`${participantKeyPrefix}-${p.id}`} className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-bold leading-tight break-words">{p.name}</span>
             
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {p.answer ? (
                p.answer
              ) : (
                <span className="italic text-muted-foreground">
                  Waiting for their answer…
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GuestSegmentsFeed({
  initialBigScreenMode = false,
  kioskMode = false,
}: {
  initialBigScreenMode?: boolean;
  kioskMode?: boolean;
} = {}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bigScreenMode, setBigScreenMode] = useState(initialBigScreenMode);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/participants");
      if (!res.ok) throw new Error("Could not load guests.");
      const data = (await res.json()) as { participants: Participant[] };
      setParticipants(data.participants);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load guests.");
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(id);
  }, [load]);

  const segments = useMemo(
    () => chunk(participants, 3),
    [participants]
  );

  const durationSec = useMemo(() => {
    const base = Math.max(28, segments.length * 14);
    return Math.min(base, 120);
  }, [segments.length]);
  const answeredCount = useMemo(
    () => participants.filter((p) => Boolean(p.answer)).length,
    [participants]
  );
  const waitingCount = participants.length - answeredCount;

  return (
    <Card
      className={
        bigScreenMode
          ? "fixed inset-0 z-40 m-0 rounded-none border-none bg-background/95 p-0"
          : "border-dashed bg-muted/30 shadow-sm"
      }
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-heading text-lg sm:text-xl">Live guest wall</CardTitle>
          {!kioskMode ? (
            <button
              type="button"
              onClick={() => setBigScreenMode((s) => !s)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {bigScreenMode ? "Exit big-screen mode" : "Big-screen mode"}
            </button>
          ) : null}
        </div>
        {!kioskMode ? (
          <CardDescription>
            Every registration and answer appears in scrolling segments so the room
            can read along together.
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {!kioskMode ? (
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-primary">
                Total guests
              </p>
              <p className="mt-1 text-base font-semibold">{participants.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Answered
              </p>
              <p className="mt-1 text-base font-semibold">{answeredCount}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Waiting
              </p>
              <p className="mt-1 text-base font-semibold">{waitingCount}</p>
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div
          className="relative h-[min(72vh,680px)] overflow-hidden rounded-xl border bg-background/90 shadow-inner sm:h-[min(78vh,760px)]"
          aria-live="polite"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background via-background/80 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-background via-background/80 to-transparent"
            aria-hidden
          />

          {participants.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <p className="max-w-sm text-sm text-muted-foreground">
                No guests yet. When people register and share their honest work,
                you will see them glide through in grouped segments here.
              </p>
            </div>
          ) : (
            <div className="h-full overflow-hidden px-2 py-2 sm:px-3">
              <div
                className="flex flex-col gap-5 hover:[animation-play-state:paused]"
                style={{
                  animation: `guest-marquee ${durationSec}s linear infinite`,
                }}
              >
                <div className="flex flex-col gap-5">
                  {segments.map((group, segIndex) => (
                    <SegmentGroup
                      key={`a-${segIndex}`}
                      group={group}
                      segmentIndex={segIndex}
                      participantKeyPrefix="a"
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-5" aria-hidden>
                  {segments.map((group, segIndex) => (
                    <SegmentGroup
                      key={`b-${segIndex}`}
                      group={group}
                      segmentIndex={segIndex}
                      participantKeyPrefix="b"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {!kioskMode ? (
          <p className="text-xs text-muted-foreground">
            {participants.length} guest
            {participants.length === 1 ? "" : "s"} on the wall · refreshes every few
            seconds
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
