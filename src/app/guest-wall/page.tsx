import Link from "next/link";

import { GuestSegmentsFeed } from "@/components/guest-segments-feed";
import { buttonVariants } from "@/components/ui/button";

export default function GuestWallPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const kioskParam = searchParams?.kiosk;
  const kioskMode =
    kioskParam === "1" || (Array.isArray(kioskParam) && kioskParam.includes("1"));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      {!kioskMode ? (
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Live board
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Guest wall
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Optimized for projector screens and mobile views. Updates appear every few
              seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to quiz
            </Link>
            <Link
              href="/guest-wall?kiosk=1"
              className={buttonVariants({ variant: "default" })}
            >
              Open kiosk mode
            </Link>
          </div>
        </header>
      ) : null}
      <GuestSegmentsFeed
        kioskMode={kioskMode}
        initialBigScreenMode={kioskMode}
      />
    </div>
  );
}
