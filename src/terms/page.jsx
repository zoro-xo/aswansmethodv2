import React from "react";
import {
  ShieldCheck,
  Camera,
  MessageCircle,
  RefreshCcw,
  Info,
  Lock,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";

/**
 * Guarantee & Refund Terms page
 * Style: Tailwind-first, matching a modern dark gradient + cards aesthetic.
 * Usage: Add a route like { path: "/guarantee", element: <GuaranteeRefundTerms /> }
 * Replace WHATSAPP_NUMBER and BRAND as needed. The wa.me link uses the E.164 digits-only format.
 */

const BRAND = "Aswan — Acne Reset";
const WHATSAPP_NUMBER_E164 = "918910069103"; // e.g. 91 + 10-digit number without "+" or spaces
const WHATSAPP_DISPLAY = "+91 8910069103"; // shown to users

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;

const lastUpdated = "August 25, 2025";

export default function GuaranteeRefundTerms() {
  const dailyTemplate = `Daily Check-in — ${BRAND}%0A%0ADay: <enter day number>%0AOrder ID: <enter order id>%0A%0ABEFORE photo: attached%0AAFTER photo (immediately after applying): attached%0A%0ANotes: <anything you noticed today>`;
  const refundTemplate = `Refund Request — ${BRAND}%0A%0AOrder ID: <enter order id>%0ARegistered email/phone: <enter>%0ADate of purchase: <enter>%0ADays of daily check-ins submitted: <enter count>%0AReason: No visible improvement%0APreferred outcome: Full refund to original payment method.`;

  return (
    <main className="relative min-h-screen bg-slate-950 text-white/90">
      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(168,85,247,0.25),rgba(14,165,233,0.15)_50%,transparent_70%)]" />

      <section className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Guarantee & Refund Terms</span>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-fuchsia-400 via-sky-300 to-cyan-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Our Promise — Clear, Fair, and Simple
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
            This page explains exactly how our guarantee works and how to
            request a refund if you don’t get results. Last updated:{" "}
            {lastUpdated}.
          </p>
        </header>

        {/* Summary cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-base font-semibold">Our Guarantee</h2>
            </div>
            <p className="mt-2 text-sm text-white/80">
              If you follow the routine as directed and don’t see meaningful
              improvement, you can request a full refund. No hidden hoops.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <h2 className="text-base font-semibold">Daily Photo Check-ins</h2>
            </div>
            <p className="mt-2 text-sm text-white/80">
              To qualify, send{" "}
              <span className="font-medium">two photos each day</span> on
              WhatsApp: a <span className="font-medium">BEFORE</span> photo just
              before applying, and an <span className="font-medium">AFTER</span>{" "}
              photo immediately after applying the routine.
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-6">
          <Card title="1) What we promise">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                {BRAND} is designed to create steady, visible improvement when
                used as directed with the recommended products/remedies.
              </li>
              <li>
                If you{" "}
                <span className="font-medium">
                  consistently follow the routine daily
                </span>{" "}
                and don’t see meaningful improvement, you may request a refund
                under the terms below.
              </li>
            </ul>
          </Card>

          <Card title="2) Eligibility requirements">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                <span className="font-medium">
                  Daily check‑ins via WhatsApp are mandatory
                </span>{" "}
                from the day you start until the day you request a refund.
              </li>
              <li>
                Each day, send: (a) one{" "}
                <span className="font-medium">BEFORE</span> photo (clean face,
                right before applying), (b) one{" "}
                <span className="font-medium">AFTER</span> photo (immediately
                after applying). Both must be{" "}
                <span className="font-medium">
                  clear, unedited, and timestamped by WhatsApp
                </span>
                .
              </li>
              <li>
                Photos should be in similar lighting and framing (front‑facing,
                no filters/beauty modes). Tie back hair, remove makeup.
              </li>
              <li>
                Use only the products/remedies specified by your plan. Tell us
                if you stop, change, or add new products.
              </li>
              <li>
                Keep packaging/invoices (if applicable) and your order ID ready
                for verification.
              </li>
            </ul>
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Important:
              </div>
              <p className="mt-1 text-sm">
                Missing daily check‑ins breaks eligibility. If you miss a day,
                message us immediately on WhatsApp to document why. Repeated
                gaps may void eligibility.
              </p>
            </div>
          </Card>

          <Card title="3) How to send your daily photos (takes ~30 seconds)">
            <ol className="list-inside list-decimal space-y-2 text-sm text-white/80">
              <li>
                Open WhatsApp to{" "}
                <span className="font-medium">{WHATSAPP_DISPLAY}</span>.
              </li>
              <li>
                Tap the button below to prefill the daily template and attach
                your two photos.
              </li>
              <li>Send before midnight local time each day.</li>
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={waLink(
                  `Daily Check-in — ${BRAND}\n\nDay: <enter day number>\nOrder ID: <enter order id>\n\nBEFORE photo: attached\nAFTER photo (immediately after applying): attached\n\nNotes: <anything you noticed today>`
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                Send Daily Check‑in
              </a>
              <span className="text-xs text-white/60">
                Sends to {WHATSAPP_DISPLAY}
              </span>
            </div>
          </Card>

          <Card title="4) When you can ask for a refund">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                You may request a refund{" "}
                <span className="font-medium">
                  any time after at least 14 consecutive days
                </span>{" "}
                of complete, daily check‑ins.
              </li>
              <li>
                Your request window stays open through{" "}
                <span className="font-medium">30 days from purchase</span> (or
                as required by local law, if longer).
              </li>
            </ul>
          </Card>

          <Card title="5) How to request a refund">
            <ol className="list-inside list-decimal space-y-2 text-sm text-white/80">
              <li>
                Tap the button below to prefill the refund request on WhatsApp
                to {WHATSAPP_DISPLAY}.
              </li>
              <li>
                Attach your most recent day’s BEFORE and AFTER photos (WhatsApp
                already contains your daily history).
              </li>
              <li>
                Our team will review within{" "}
                <span className="font-medium">3–5 business days</span> and reach
                out if we need clarifications.
              </li>
              <li>
                If approved, refunds are issued to your original payment method
                within <span className="font-medium">5–10 business days</span>{" "}
                (bank processing times vary).
              </li>
            </ol>
            <div className="mt-4">
              <a
                href={waLink(
                  `Refund Request — ${BRAND}\n\nOrder ID: <enter order id>\nRegistered email/phone: <enter>\nDate of purchase: <enter>\nDays of daily check-ins submitted: <enter count>\nReason: No visible improvement\nPreferred outcome: Full refund to original payment method.`
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/90 px-4 py-2 text-sm font-semibold text-fuchsia-950 hover:bg-fuchsia-300"
              >
                <RefreshCcw className="h-4 w-4" />
                Start Refund Request
              </a>
            </div>
          </Card>

          <Card title="6) What’s included / excluded">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CircleCheck className="h-4 w-4" />
                  Included
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-50/90">
                  <li>Full plan fee (digital guidance/coaching)</li>
                  <li>GST on the plan fee (if applicable)</li>
                </ul>
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-200">
                  <AlertTriangle className="h-4 w-4" />
                  Excluded
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-50/90">
                  <li>Physical products purchased from third parties</li>
                  <li>Shipping/handling fees (if any)</li>
                  <li>Damage from off‑plan products or procedures</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card title="7) Verification & fairness">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                We rely on your WhatsApp timestamped daily photos to verify
                consistent use.
              </li>
              <li>
                We may ask clarifying questions or additional angles (same day)
                to fairly assess progress and rule out lighting/angle effects.
              </li>
              <li>
                One refund per customer/account. Suspicious activity (filters,
                edits, reused photos) voids eligibility.
              </li>
            </ul>
          </Card>

          <Card title="8) Privacy">
            <p className="text-sm text-white/80">
              Your photos are used only to verify usage and results. We do not
              use them for marketing without your consent. Upon a final
              decision, we delete verification photos within 30 days, except
              where law requires longer retention.
            </p>
          </Card>

          <Card title="9) Need help?">
            <p className="text-sm text-white/80">
              Message us anytime on WhatsApp at{" "}
              <span className="font-medium">{WHATSAPP_DISPLAY}</span> or tap
              either button above. We’re here to help you get the result, which
              is always our first goal.
            </p>
          </Card>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
            <div className="flex items-center gap-2 font-medium text-white/80">
              <Info className="h-4 w-4" />
              Legal
            </div>
            <p className="mt-2">
              By using {BRAND}, you agree to these terms. Where consumer law
              provides additional rights, those rights apply. We may update
              these terms over time — material changes will be posted here with
              a new “Last updated” date.
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
