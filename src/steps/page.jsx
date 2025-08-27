import React from "react";
import { Link, useInRouterContext } from "react-router-dom";

// Save as: src/guide/page.jsx  (pure JSX version)
// Route suggestion: "/guide" or "/how-it-works"

// ---------------------------------------------------------------------------
// Utilities (JSX-safe, no TypeScript)
// ---------------------------------------------------------------------------
const BASE =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";
const withBase = (to = "/") =>
  to.startsWith("/") ? `${BASE}${to.slice(1)}` : `${BASE}${to}`;
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function SafeLink({ to, className = "", children, ...rest }) {
  const hasCtx = typeof useInRouterContext === "function";
  const inRouter = hasCtx ? useInRouterContext() : false;
  const href = withBase(to);
  if (inRouter)
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Data (no trailing comma on last element)
// ---------------------------------------------------------------------------
const steps = [
  {
    title: "Upload 3 clear selfies",
    body: "Use natural light if possible. We guide you to capture front, left, and right angles for the best analysis.",
  },
  {
    title: "Answer a few quick questions",
    body: "Tell us about your skin type, sensitivities, and current routine so recommendations respect your context.",
  },
  {
    title: "AI analyzes your skin",
    body: "On-device checks and server-side intelligence combine to identify key concerns and severity levels.",
  },
  {
    title: "Get your 2‑minute routine",
    body: "We assemble a simple, step-by-step plan tailored to your goals, lifestyle, and budget.",
  },
  {
    title: "Track results & adjust",
    body: "Follow your routine, check in weekly, and we’ll adapt as your skin improves.",
  },
].map((s) => ({ ...s, id: slugify(s.title) }));

// ---------------------------------------------------------------------------
// UI primitives
// ---------------------------------------------------------------------------
function ScreenshotPlaceholder({ index, caption }) {
  return (
    <figure className="relative w-full aspect-[16/9] rounded-2xl border border-dashed border-zinc-300/60 bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-700/60 overflow-hidden">
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Screenshot
          </div>
          <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Placeholder • Step {index + 1}
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        {caption || `Step ${index + 1} screenshot placeholder`}
      </figcaption>
    </figure>
  );
}

function StepCard({ step, index }) {
  return (
    <li id={step.id} className="group">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
        {/* Badge / number */}
        <div className="md:col-span-1">
          <div className="w-9 h-9 rounded-full bg-zinc-900/90 dark:bg-white text-white dark:text-zinc-900 grid place-items-center text-sm font-medium shadow-sm">
            {index + 1}
          </div>
        </div>

        {/* Card */}
        <div className="md:col-span-4">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 shadow-sm p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 max-w-prose">
                  {step.body}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {/* Replace src with actual screenshots when ready */}
              <ScreenshotPlaceholder index={index} caption={step.title} />
            </div>

            {/* Optional mini-notes row */}
            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Tip: Replace the placeholder with{" "}
              <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900">
                {withBase(`screenshots/step-${index + 1}.png`)}
              </code>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Page (JSX)
// ---------------------------------------------------------------------------
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-zinc-950/60 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <SafeLink
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            aria-label="Back to home"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </SafeLink>
          <div className="ml-auto">
            <SafeLink
              to="/"
              className="inline-flex items-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1.5 text-sm shadow-sm hover:opacity-90"
            >
              Start Analysis
            </SafeLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Step‑by‑step guide
            </h1>
            <p className="mt-2 max-w-prose text-zinc-600 dark:text-zinc-300">
              A simple walkthrough of what to expect. Each step includes a
              screenshot placeholder you can replace later.
            </p>
            {/* TOC */}
            <nav className="mt-4" aria-label="Guide steps">
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {steps.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 text-[11px]">
                        {i + 1}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </section>

      {/* Steps */}
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <ol className="space-y-8">
          {steps.map((s, i) => (
            <StepCard key={s.id} step={s} index={i} />
          ))}
        </ol>

        {/* CTA footer */}
        <div className="mt-12 flex items-center justify-center">
          <SafeLink
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 text-sm font-medium shadow-sm hover:opacity-90"
          >
            Get started
            <span aria-hidden>→</span>
          </SafeLink>
        </div>
      </main>

      {/* Footer note */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-4 py-8 text-xs text-zinc-500 dark:text-zinc-400">
          For demonstration purposes — replace screenshots when ready.
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DEV TESTS (run only in Vite dev, no-op in prod)
// ---------------------------------------------------------------------------
if (
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.DEV
) {
  const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

  console.groupCollapsed("[GuidePage tests]");
  try {
    console.assert(Array.isArray(steps), "steps should be an array");
    console.assert(steps.length === 5, "steps should contain 5 items");
    const ids = new Set();
    steps.forEach((s, i) => {
      console.assert(
        !!s && typeof s === "object",
        `step ${i} should be an object`
      );
      console.assert(
        isNonEmptyString(s.title),
        `step ${i} title should be a non-empty string`
      );
      console.assert(
        isNonEmptyString(s.body),
        `step ${i} body should be a non-empty string`
      );
      console.assert(
        isNonEmptyString(s.id),
        `step ${i} id should be a non-empty string`
      );
      console.assert(!ids.has(s.id), `step id '${s.id}' should be unique`);
      ids.add(s.id);
    });
    // Base path sanity
    console.assert(typeof BASE === "string", "BASE should be a string");
    console.assert(
      withBase("/").startsWith("/"),
      "withBase('/') should start with '/'"
    );
  } finally {
    console.groupEnd();
  }
}
