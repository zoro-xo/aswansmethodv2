import React from "react";
import {
  Timer,
  Users,
  ShieldCheck,
  AlertTriangle,
  Info,
  MessageCircle,
  Activity,
  Clock,
} from "lucide-react";

/**
 * Scarcity & Timer Integrity Policy — JSX version
 * Style matches the Guarantee page: dark gradient, glass cards, Tailwind, lucide icons.
 * Usage: Add a route like { path: "/integrity", element: <ScarcityTimerPolicy /> }
 * Replace WHATSAPP_NUMBER and BRAND as needed. wa.me requires E.164 digits-only number.
 */

const BRAND = "Aswan — Acne Reset";
const WHATSAPP_NUMBER_E164 = "918910069103"; // e.g., 91 + 10-digit number, digits only
const WHATSAPP_DISPLAY = "+91 8910069103"; // pretty format for display
const SEAT_HOLD_MINUTES = 20; // how long a reserved seat is held during checkout
const PRICE_LOCK_HOURS = 48; // if we make a mistake, we honor the prior price for this window
const TIMEZONE_LABEL = "Asia (IST)"; // timers are shown and enforced in this timezone

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
const lastUpdated = "August 25, 2025";

export default function ScarcityTimerPolicy() {
  const reportTemplate = `Integrity Report — ${BRAND}\n\nType: (Seat meter / Timer)\nObserved at (date & time): <enter>\nScreenshot/video link: <enter>\nWhat happened: <describe discrepancy>\nOrder ID (if any): <enter>\nDevice/browser: <enter>`;
  const priceLockTemplate = `Price Lock Request — ${BRAND}\n\nI saw a price/timer discrepancy and request the previous price.\nObserved at (date & time): <enter>\nScreenshot/video link: <enter>\nOrder ID (if any): <enter>`;

  return (
    <main className="relative min-h-screen bg-slate-950 text-white/90">
      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(168,85,247,0.25),rgba(14,165,233,0.15)_50%,transparent_70%)]" />

      <section className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Scarcity & Timer Integrity Policy</span>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-fuchsia-400 via-sky-300 to-cyan-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Real Capacity. Honest Timers. Zero Gimmicks.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
            This page explains how our seat meter and countdown timers work, and
            what we do to keep them accurate and fair. Last updated:{" "}
            {lastUpdated}.
          </p>
        </header>

        {/* Summary cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-base font-semibold">Seat Meter Integrity</h2>
            </div>
            <p className="mt-2 text-sm text-white/80">
              “Seats left” reflects{" "}
              <span className="font-medium">real onboarding capacity</span> —
              not fake urgency.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <h2 className="text-base font-semibold">Timer Integrity</h2>
            </div>
            <p className="mt-2 text-sm text-white/80">
              Countdowns show{" "}
              <span className="font-medium">real cohort deadlines</span> and are
              anchored to {TIMEZONE_LABEL}.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="1) Why we limit seats">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                We cap new joins to protect support quality and ensure timely
                check‑ins and guidance.
              </li>
              <li>
                The seat meter helps set expectations so you can decide without
                pressure or surprises.
              </li>
            </ul>
          </Card>

          <Card title="2) How the seat meter works">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                "Seats left" is based on our{" "}
                <span className="font-medium">daily onboarding capacity</span>{" "}
                minus current active/queued users plus pending cancellations.
              </li>
              <li>
                When someone starts checkout, a seat may be{" "}
                <span className="font-medium">
                  temporarily reserved for up to {SEAT_HOLD_MINUTES} minutes
                </span>
                . If payment fails or aborts, the seat returns automatically.
              </li>
              <li>
                The counter updates periodically and may have a small delay
                because of payment processing and network caching.
              </li>
              <li>
                We do <span className="font-medium">not</span> artificially
                decrease seats to push purchases.
              </li>
            </ul>
          </Card>

          <Card title="3) How the countdown timer works">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                Timers correspond to{" "}
                <span className="font-medium">real cohort cut‑offs</span> or
                price changes.
              </li>
              <li>
                All timers are enforced in{" "}
                <span className="font-medium">{TIMEZONE_LABEL}</span> to avoid
                confusion across regions.
              </li>
              <li>
                Extensions (rare) are announced on‑site; silent re‑starts are
                not allowed.
              </li>
              <li>
                If a technical issue resets a timer early, you qualify for our{" "}
                <span className="font-medium">Price‑Lock Honor</span> below.
              </li>
            </ul>
          </Card>

          <Card title="4) Our integrity commitments">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  We will
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-50/90">
                  <li>Base seats on real operational capacity.</li>
                  <li>
                    Anchor timers to real deadlines (not rolling fake ones).
                  </li>
                  <li>Disclose extensions and reasons when they occur.</li>
                  <li>
                    Honor the previous price if a timer error misleads you.
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-200">
                  <AlertTriangle className="h-4 w-4" />
                  We will not
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-50/90">
                  <li>Fake or randomly drop seat counts to induce panic.</li>
                  <li>Loop perpetual timers without changes to the offer.</li>
                  <li>Hide fees or change terms after you click “Pay”.</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card title="5) Price‑Lock Honor (if we mess up)">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                If a timer resets incorrectly or a seat count appears
                inconsistent, contact us with a screenshot/video.
              </li>
              <li>
                We will review and, if confirmed,{" "}
                <span className="font-medium">
                  honor the prior price for {PRICE_LOCK_HOURS} hours
                </span>{" "}
                from when you report it.
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={waLink(priceLockTemplate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/90 px-4 py-2 text-sm font-semibold text-fuchsia-950 hover:bg-fuchsia-300"
              >
                <Clock className="h-4 w-4" />
                Request Price‑Lock
              </a>
              <span className="text-xs text-white/60">
                Sends to {WHATSAPP_DISPLAY}
              </span>
            </div>
          </Card>

          <Card title="6) Report a discrepancy (takes ~30 seconds)">
            <ol className="list-inside list-decimal space-y-2 text-sm text-white/80">
              <li>
                Open WhatsApp to{" "}
                <span className="font-medium">{WHATSAPP_DISPLAY}</span>.
              </li>
              <li>
                Tap the button below to prefill the report and attach your
                screenshot/video.
              </li>
              <li>
                Include date/time and whether it was seat meter or timer
                related.
              </li>
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={waLink(reportTemplate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                Report Integrity Issue
              </a>
              <span className="text-xs text-white/60">
                Sends to {WHATSAPP_DISPLAY}
              </span>
            </div>
          </Card>

          <Card title="7) Transparency & logs">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                Seat meter changes are logged internally (admin actions, payment
                events, holds/releases).
              </li>
              <li>
                Timer settings are versioned with planned cohort dates; changes
                leave an audit trail.
              </li>
              <li>
                We periodically sample the live site to confirm values match the
                back‑end state.
              </li>
            </ul>
          </Card>

          <Card title="8) Need help?">
            <p className="text-sm text-white/80">
              Message us anytime on WhatsApp at{" "}
              <span className="font-medium">{WHATSAPP_DISPLAY}</span>. We’re
              happy to explain current capacity, cut‑offs, or help you plan your
              start date.
            </p>
          </Card>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
            <div className="flex items-center gap-2 font-medium text-white/80">
              <Info className="h-4 w-4" />
              Legal
            </div>
            <p className="mt-2">
              We aim for truthful, clear marketing. Where consumer law provides
              additional rights, those rights apply. We may update these terms;
              material changes will be posted here with a new “Last updated”
              date.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-white/60">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white/90">
        {title}
      </h2>
      {children}
    </section>
  );
}
