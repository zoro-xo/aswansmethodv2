import React, { useState } from "react";
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
const imageOverrides = [
  "images/stepssrc/step1.png",
  "images/stepssrc/step2.png",
  "images/stepssrc/step3.png",
  "images/stepssrc/step4.jpg",
  "images/stepssrc/step5.png",
];

const steps = [
  {
    title: "You can choose the payment after analyzing your face.",
    body: "You can either pay full in bonus or split-payment(half now & half after you get results).",
  },
  {
    title: "Choose any plan according to your liking.",
    body: "If you are starting out I would suggest to go with the PRO plan.",
  },
  {
    title: "Fill up your details.",
    body: "Remember your details - you have to enter these while joining the course & community so that we can verify.",
  },
  {
    title:
      "After you purchase the plan click on the go back button, If you miss this don't worry - you can text us in whatsapp for the link : ",
    body: "https://wa.me/918910069103?text=I%20have%20purchased%20the%20Acne%20Reset",
  },
].map((s) => ({ ...s, id: slugify(s.title) }));

// ---------------------------------------------------------------------------
// UI primitives
// ---------------------------------------------------------------------------
function ScreenshotPlaceholder({ index, caption }) {
  return (
    <figure className="relative w-full aspect-[16/9] rounded-2xl border border-dashed border-zinc-300/60 bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-700/60 overflow-hidden">
      <div className="absolute inset-0 grid place-itemsplaceholder-center">
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

// Per‑step screenshot with graceful fallback to placeholder if missing
function Screenshot({ step, index }) {
  const [errored, setErrored] = useState(false);
  const path =
    imageOverrides[index] || step.image || `screenshots/step-${index + 1}.png`;
  const src = withBase(path);
  if (errored) return <Screenshot step={step} index={index} />;
  return (
    <img
      src={src}
      alt={step.title || `Step ${index + 1} screenshot`}
      className="w-full aspect-[16/9] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 object-cover bg-zinc-100 dark:bg-zinc-900"
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

function StepCard({ step, index }) {
  const isURL =
    typeof step.body === "string" && /^https?:\/\//i.test(step.body);
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
                {isURL ? (
                  <a
                    href={step.body}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400 max-w-prose break-all"
                  >
                    {step.body}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 max-w-prose">
                    {step.body}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              {index === 0 && step.extraImage ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Screenshot step={step} index={index} />
                  <Screenshot
                    step={{ ...step, image: step.extraImage }}
                    index={index}
                  />
                </div>
              ) : (
                <Screenshot step={step} index={index} />
              )}
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
  // Extra step requested by user with clickable body link
  const extraStep = {
    title: "Or you can join the courses & community with this link 👇",
    body: "https://www.skool.com/acne-rest-2044/",
    image: "images/stepssrc/step6.png",
    id: slugify("Or you can join the courses & community with this link 👇"),
  };
  const allSteps = [...steps, extraStep];
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
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Step‑by‑step guide after you purchase the plan
            </h1>
            <p className="mt-2 max-w-prose text-zinc-600 dark:text-zinc-300">
              If you have already purchased the plan and don't know what to do
              next - follow this step by step guide.
            </p>
            {/* TOC */}
            <nav className="mt-4" aria-label="Guide steps">
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {allSteps.map((s, i) => (
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
          {allSteps.map((s, i) => (
            <StepCard key={s.id} step={s} index={i} />
          ))}
        </ol>
      </main>
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
    console.assert(steps.length >= 5, "steps should contain at least 5 items");
    console.assert(
      imageOverrides.length >= steps.length,
      "imageOverrides should be at least steps length"
    );
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
      console.assert(
        isNonEmptyString(imageOverrides[i]),
        `imageOverrides[${i}] should be a non-empty string`
      );
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
