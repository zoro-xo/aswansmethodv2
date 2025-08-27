import React from "react";
import {
  ShieldCheck,
  Camera,
  Lock,
  Trash2,
  FileDown,
  MessageCircle,
  EyeOff,
  Info,
  AlertTriangle,
  Mail,
  CircleCheck,
} from "lucide-react";

/**
 * Privacy (Selfie Analysis & Data) — JSX version
 * Style matches the Guarantee/Integrity pages: dark gradient, glass cards, Tailwind, lucide icons.
 * Usage: Add a route like { path: "/privacy", element: <PrivacySelfieData /> }
 * Replace WHATSAPP/EMAIL and BRAND as needed. wa.me requires E.164 digits-only number.
 */

const BRAND = "Aswan — Acne Reset";
const CONTACT_EMAIL = "help.aswan@gmail.com"; // update to your real inbox
const WHATSAPP_NUMBER_E164 = "918910069103"; // e.g., 91 + 10-digit number, digits only
const WHATSAPP_DISPLAY = "+91 8910069103"; // pretty format for display

// Retention windows (customize to your ops & legal guidance)
const ANALYSIS_RETENTION_DAYS = 30; // analysis selfies & outputs
const VERIFICATION_RETENTION_DAYS = 30; // check‑in/eligibility photos after final decision
const LOG_RETENTION_DAYS = 90; // sanitized security/ops logs

const TIMEZONE_LABEL = "Asia (IST)";
const lastUpdated = "August 25, 2025";

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
const mailto = (subject) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export default function PrivacySelfieData() {
  const deleteTemplate = `Data Deletion Request — ${BRAND}\n\nI request deletion of my selfies, check‑in photos, and related records.\nRegistered email/phone: <enter>\nOrder ID (if any): <enter>\nNotes: <optional>`;
  const exportTemplate = `Data Export Request — ${BRAND}\n\nPlease send me a copy of my personal data (selfies, check‑ins, analysis, account info).\nRegistered email/phone: <enter>\nOrder ID (if any): <enter>`;
  const withdrawTemplate = `Withdraw Consent — ${BRAND}\n\nI withdraw consent for non‑essential processing (e.g., analytics or model improvement).\nRegistered email/phone: <enter>\nOrder ID (if any): <enter>`;
  const privacyIssueTemplate = `Privacy Issue Report — ${BRAND}\n\nDescribe the issue: <enter>\nWhen observed: <enter>\nScreenshots/video link: <enter>\nOrder ID (if any): <enter>`;

  return (
    <main className="relative min-h-screen bg-slate-950 text-white/90">
      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(168,85,247,0.25),rgba(14,165,233,0.15)_50%,transparent_70%)]" />

      <section className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Privacy — Selfie Analysis & Data</span>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-fuchsia-400 via-sky-300 to-cyan-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Your Face. Your Data. Your Control.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
            This page explains what we collect around selfie analysis and daily
            check‑ins, why we use it, how we keep it safe, and how you can
            control or delete it. Last updated: {lastUpdated}.
          </p>
        </header>

        {/* Summary cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <h2 className="text-base font-semibold">What We Collect</h2>
            </div>
            <ul className="mt-2 list-inside list-disc text-sm text-white/80">
              <li>Selfies you submit for analysis (and derived metrics)</li>
              <li>
                Daily BEFORE/AFTER check‑in photos (if you opt into the
                guarantee)
              </li>
              <li>Routine answers, interactions, and device/session info</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              <h2 className="text-base font-semibold">What We Don’t Do</h2>
            </div>
            <ul className="mt-2 list-inside list-disc text-sm text-white/80">
              <li>No selling personal data</li>
              <li>No ad‑network sharing of selfie content</li>
              <li>
                No use for model training{" "}
                <span className="italic">unless you explicitly opt‑in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="1) What this covers">
            <p className="text-sm text-white/80">
              This policy focuses on (a){" "}
              <span className="font-medium">
                selfies submitted for analysis
              </span>{" "}
              to generate or adjust your routine, and (b){" "}
              <span className="font-medium">
                daily BEFORE/AFTER check‑in photos
              </span>{" "}
              if you choose to participate in our guarantee program. General
              account and payments are covered by our broader privacy notice.
            </p>
          </Card>

          <Card title="2) Why we process this data (lawful purposes)">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                Provide and improve guidance (skin assessments, routine
                adjustments).
              </li>
              <li>Verify eligibility and fair use of the guarantee program.</li>
              <li>
                Customer support, troubleshooting, and safety/fraud prevention.
              </li>
              <li>Compliance with legal obligations and record‑keeping.</li>
            </ul>
          </Card>

          <Card title="3) Where and how we process">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                We store/process data on secure cloud infrastructure and trusted
                service providers.
              </li>
              <li>
                WhatsApp messages you send are governed by WhatsApp’s terms; we
                only use your check‑in photos to verify usage.
              </li>
              <li>
                We use reputable AI inference providers for automated analysis.
                We do not allow them to train on your content unless you opt‑in.
              </li>
              <li>
                Timers and dates are standardized to{" "}
                <span className="font-medium">{TIMEZONE_LABEL}</span> to reduce
                ambiguity.
              </li>
            </ul>
          </Card>

          <Card title="4) How long we keep things (retention)">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                <span className="font-medium">Analysis selfies & outputs:</span>{" "}
                kept up to {ANALYSIS_RETENTION_DAYS} days to help you compare
                and adjust, then deleted or anonymized unless you ask us to keep
                them longer.
              </li>
              <li>
                <span className="font-medium">
                  Check‑in (guarantee) photos:
                </span>{" "}
                retained until a final eligibility decision, then deleted within{" "}
                {VERIFICATION_RETENTION_DAYS} days (see Guarantee page).
              </li>
              <li>
                <span className="font-medium">Security/ops logs:</span>{" "}
                anonymized and rotated within ~{LOG_RETENTION_DAYS} days.
              </li>
            </ul>
          </Card>

          <Card title="5) Sharing and third‑party processors">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                We share personal data only with vendors who help us operate
                (cloud storage, AI inference, payment/messaging).
              </li>
              <li>
                They act under contract, must protect data, and cannot use it
                for their own marketing.
              </li>
              <li>We do not sell your personal data.</li>
            </ul>
          </Card>

          <Card title="6) Your controls & rights">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                Access/Export — get a copy of your selfies, check‑ins, and
                analysis.
              </li>
              <li>
                Delete — ask us to erase your selfies and check‑ins (subject to
                legal/anti‑fraud duties).
              </li>
              <li>
                Withdraw consent — stop non‑essential processing (e.g.,
                analytics/model improvement).
              </li>
              <li>
                Correct — update contact/account details tied to your records.
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={waLink(exportTemplate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                <FileDown className="h-4 w-4" />
                Request Data Export
              </a>
              <a
                href={waLink(deleteTemplate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-rose-400/90 px-4 py-2 text-sm font-semibold text-rose-950 hover:bg-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                Request Deletion
              </a>
              <a
                href={waLink(withdrawTemplate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                Withdraw Consent
              </a>
              <a
                href={mailto("Privacy Request — " + BRAND)}
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/90 px-4 py-2 text-sm font-semibold text-fuchsia-950 hover:bg-fuchsia-300"
              >
                <Mail className="h-4 w-4" />
                Email {CONTACT_EMAIL}
              </a>
            </div>
          </Card>

          <Card title="7) Security by design">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                Encryption in transit (TLS) and at rest for stored media where
                supported by our providers.
              </li>
              <li>
                Strict access controls; only trained staff can view verification
                photos when needed.
              </li>
              <li>
                EXIF/location stripping for uploaded photos where technically
                feasible.
              </li>
              <li>Short‑lived links and signed URLs for media access.</li>
              <li>Abuse and spam controls on WhatsApp/email interactions.</li>
            </ul>
          </Card>

          <Card title="8) Children & sensitive data">
            <ul className="list-inside list-disc space-y-2 text-sm text-white/80">
              <li>
                This service is not intended for children under 13, or under 16
                where local law requires parental consent.
              </li>
              <li>
                Please do not upload government IDs or medical documents through
                WhatsApp or the app.
              </li>
            </ul>
          </Card>

          <Card title="9) Questions or concerns?">
            <p className="text-sm text-white/80">
              Message us on WhatsApp at{" "}
              <span className="font-medium">{WHATSAPP_DISPLAY}</span> or email{" "}
              <a
                className="underline"
                href={mailto("Privacy Query — " + BRAND)}
              >
                {CONTACT_EMAIL}
              </a>
              . We’ll respond as soon as possible.
            </p>
          </Card>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
            <div className="flex items-center gap-2 font-medium text-white/80">
              <Info className="h-4 w-4" />
              Legal
            </div>
            <p className="mt-2">
              This page provides a clear summary of how we handle selfie and
              check‑in data. It does not replace any mandatory notices required
              by local law. If this page conflicts with our main Privacy Notice,
              the stricter protection for you applies.
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
