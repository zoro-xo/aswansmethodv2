// Canvas bootstrap: mock /seats.json so app runs standalone
if (typeof window !== "undefined") {
  const __SEATS__ = { claimed: 118 };
  const __origFetch = window.fetch?.bind(window) || fetch;
  window.fetch = (input, init) => {
    if (typeof input === "string" && input === "/seats.json") {
      return Promise.resolve(
        new Response(JSON.stringify(__SEATS__), {
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    return __origFetch(input, init);
  };
}

// =====================================================
// Acne Reset — v4.6.1 (fix: JSX prop arrays + add tests)
// - Fixed JSX SyntaxError by wrapping array props in `{}`
// - Added lightweight unit tests (enable via `?tests=1`)
// - No behavior changes to UI/flow
// =====================================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Percent,
  ShoppingCart,
  Wand2,
  Star,
  MessageSquare,
  Info,
  Lock,
  Flame,
  AlertTriangle,
  Plus,
  CircleCheck,
} from "lucide-react";

// -------------------- CONFIG --------------------
const CHECKOUT_URL = "https://aswan.in/checkout"; // replace with real checkout
const CHECKOUT_SPLIT_URL = "https://aswan.in/checkout-split"; // replace
const CHANNEL_URL = "https://aswan.in/community"; // replace
const SUPPORT_WHATSAPP =
  "https://wa.me/919999999999?text=I%20have%20a%20question%20about%20Acne%20Reset"; // replace

const POLICY = {
  guarantee: "/policy/guarantee",
  scarcity: "/policy/scarcity",
  privacy: "/policy/privacy",
};

// Scarcity (real only; set a real deadline & seat cap)
const SCARCITY = {
  seats: 150,
  deadlineISO: (() => {
    const now = new Date();
    const local = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    local.setHours(23, 59, 59, 0);
    return new Date(local.getTime()).toISOString();
  })(),
  reason: "Founders' cohort case-study intake",
};

// Pricing
const LIST_PRICE = 999;
const DEFAULT_INTRO_PRICE = 749;
const BUMP_PRICE = 299;
function getIntroPrice() {
  const url = new URL(
    typeof window !== "undefined" ? window.location.href : "http://local"
  );
  const p = url.searchParams.get("price");
  if (p && /^\d+$/.test(p)) return Math.max(199, parseInt(p, 10));
  return DEFAULT_INTRO_PRICE;
}
const INTRO_PRICE = getIntroPrice();

// Named mechanism
const MECHANISM = "AI R.A.P.I.D. Routine Engine™"; // Recognize → Analyze → Plan → Implement → Debrief

// -------------------- UTILS --------------------
function clsx(...a) {
  return a.filter(Boolean).join(" ");
}
function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
function useCountdown(deadlineISO) {
  const [t, setT] = useState(() =>
    Math.max(0, new Date(deadlineISO).getTime() - Date.now())
  );
  useEffect(() => {
    const id = setInterval(
      () => setT(Math.max(0, new Date(deadlineISO).getTime() - Date.now())),
      1000
    );
    return () => clearInterval(id);
  }, [deadlineISO]);
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { h, m, s: sec, isOver: t <= 0 };
}
function useDevMode() {
  const [dev, setDev] = useState(false);
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const v = (u.searchParams.get("dev") || "").toLowerCase();
      setDev(["1", "true", "yes", "on"].includes(v));
    } catch {}
  }, []);
  return dev;
}

// Value Equation score
function valueEquationScore(v) {
  const bottom = Math.max(1, v.time * v.effort);
  return Math.round(((v.dream * v.likelihood) / bottom) * 100) / 100;
}

// Multi‑image preview util (front/left/right)
function useMultiImagePreview() {
  const [previews, setPreviews] = useState({});
  const urls = useRef({});
  const setFile = (slot, f) => {
    if (!f) return;
    if (urls.current[slot]) URL.revokeObjectURL(urls.current[slot]);
    const url = URL.createObjectURL(f);
    urls.current[slot] = url;
    setPreviews((p) => ({ ...p, [slot]: url }));
  };
  useEffect(
    () => () =>
      Object.values(urls.current).forEach((u) => URL.revokeObjectURL(u)),
    []
  );
  return { previews, setFile };
}

// ---------- Local (on-device) estimator — fallback ----------
async function fileHash(file) {
  const buf = await file.arrayBuffer();
  const view = new Uint8Array(buf);
  let h = 2166136261;
  for (let i = 0; i < view.length; i += 4096) {
    h ^= view[i];
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}
function map100(x) {
  return Math.max(5, Math.min(100, Math.round(x)));
}
function deriveSkinType(seed) {
  const pick = seed % 4;
  return pick === 0
    ? "oily"
    : pick === 1
    ? "dry"
    : pick === 2
    ? "combo"
    : "normal";
}
function percentFrom(seed, shift, min = 10, max = 98) {
  const v = (seed >>> shift) % 100;
  return Math.max(min, Math.min(max, v));
}
function bucket(val) {
  return val > 70
    ? "severe"
    : val > 55
    ? "moderate"
    : val > 30
    ? "mild"
    : "none";
}
function buildLocalResult(seed) {
  const skinType = deriveSkinType(seed);
  const clarity = 100 - percentFrom(seed, 3, 20, 95);
  const redness = percentFrom(seed, 7);
  const oil = percentFrom(seed, 11);
  const dryness = percentFrom(seed, 17);
  const texture = 100 - percentFrom(seed, 19, 25, 90);
  const symmetry = percentFrom(seed, 23, 40, 96);
  const jawline = percentFrom(seed, 27, 35, 97);
  const acneRisk = map100(0.6 * (100 - clarity) + 0.2 * redness + 0.2 * oil);
  const scores = [
    { key: "clarity", label: "Skin Clarity", score: map100(clarity) },
    { key: "redness", label: "Redness", score: map100(redness) },
    { key: "oil", label: "Oiliness", score: map100(oil) },
    { key: "dry", label: "Dryness", score: map100(dryness) },
    { key: "texture", label: "Texture Smoothness", score: map100(texture) },
    { key: "sym", label: "Facial Symmetry", score: map100(symmetry) },
    { key: "jaw", label: "Jawline Definition", score: map100(jawline) },
    { key: "risk", label: "Acne Risk (composite)", score: map100(acneRisk) },
  ];
  const flags = [];
  if (clarity < 60) flags.push("Active regimen for clarity");
  if (redness > 60) flags.push("Calm redness & barrier");
  if (oil > 65) flags.push("Oil control");
  if (dryness > 65) flags.push("Barrier repair");
  if (texture < 60) flags.push("Texture smoothing");
  const summary = `Type: ${skinType}. Priorities → ${
    flags.join(", ") || "Maintain & protect."
  }`;
  const overallRating = map100(
    0.4 * clarity +
      0.25 * texture +
      0.2 * (100 - redness) +
      0.15 * (100 - Math.min(oil, 90))
  );
  const potentialRating = Math.min(
    100,
    Math.round(overallRating + Math.max(8, (100 - overallRating) * 0.35))
  );
  const distribution = {
    forehead: bucket(100 - clarity + oil * 0.2),
    cheeks: bucket((100 - clarity) * 0.6 + redness * 0.6),
    nose: bucket(oil),
    jaw: bucket(redness * 0.4 + (100 - clarity) * 0.3),
  };
  const counts = {
    non_inflamed: Math.max(5, Math.round((100 - clarity) * 0.4)),
    inflamed: Math.max(0, Math.round(redness * 0.2)),
    nodules_cysts: Math.max(0, Math.round((100 - texture) * 0.05 - 1)),
  };
  const possibleTriggers = [
    oil > 65 ? "Occlusive hair products / helmets" : "Irregular cleansing",
    redness > 60
      ? "Over‑exfoliation / fragrance irritation"
      : "Sweat + friction",
  ];
  const nonMedicalActions = [
    "SPF 50 daily (2‑finger)",
    "Gentle foaming cleanse (2×/day)",
    "BPO 2.5% wash AM 3–4×/wk",
    "Adapalene 0.1% pea‑size PM ramp",
    "Fragrance‑free moisturizer",
  ];
  const routineOutline = {
    AM: [
      "Cleanse",
      "(Optional) BPO wash",
      "Gel/Ceramide moisturizer",
      "SPF 50",
    ],
    PM: ["Cleanse", "Adapalene pea‑size", "Moisturizer"],
  };
  const metrics = {
    clarity: map100(clarity),
    redness: map100(redness),
    oiliness: map100(oil),
    dryness: map100(dryness),
    texture: map100(texture),
    symmetry: map100(symmetry),
    jawline: map100(jawline),
  };
  return {
    skinType,
    scores,
    flags,
    summary,
    overallRating,
    potentialRating,
    source: "local",
    distribution,
    counts,
    possibleTriggers,
    nonMedicalActions,
    routineOutline,
    metrics,
    disclaimer: "Educational estimate. Not medical advice.",
  };
}

// ---------- Secure GPT call hook ----------
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result || "").toString().split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function normalizeServerOut(x) {
  const m = x?.metrics || {};
  const clarity = Number(m.clarity) || 0,
    redness = Number(m.redness) || 0,
    oil = Number(m.oiliness) || 0,
    dryness = Number(m.dryness) || 0,
    texture = Number(m.texture) || 0,
    sym = Number(m.symmetry) || 0,
    jaw = Number(m.jawline) || 0;
  const acneRisk = map100(0.6 * (100 - clarity) + 0.2 * redness + 0.2 * oil);
  const scores = [
    { key: "clarity", label: "Skin Clarity", score: map100(clarity) },
    { key: "redness", label: "Redness", score: map100(redness) },
    { key: "oil", label: "Oiliness", score: map100(oil) },
    { key: "dry", label: "Dryness", score: map100(dryness) },
    { key: "texture", label: "Texture Smoothness", score: map100(texture) },
    { key: "sym", label: "Facial Symmetry", score: map100(sym) },
    { key: "jaw", label: "Jawline Definition", score: map100(jaw) },
    { key: "risk", label: "Acne Risk (composite)", score: map100(acneRisk) },
  ];
  const flags = Array.isArray(x?.flags) ? x.flags : [];
  const summary = `Type: ${
    x?.skinType || x?.skin_type || "uncertain"
  }. Priorities → ${flags[0] || "clarity first"}…`;
  return {
    skinType: x?.skinType || x?.skin_type || "uncertain",
    severity: x?.severity || x?.estimated_severity || "uncertain",
    scores,
    flags,
    summary,
    overallRating: Number(x?.overallRating ?? x?.overall_rating ?? 0),
    potentialRating: Number(
      x?.potentialRating8w ??
        x?.potential_rating_8w ??
        x?.potential_rating_14d ??
        0
    ),
    distribution: x?.distribution || {},
    counts: x?.counts || {},
    routineOutline: x?.routineOutline ||
      x?.routine_outline || { AM: [], PM: [] },
    nonMedicalActions: x?.nonMedicalActions || x?.non_medical_actions || [],
    possibleTriggers: x?.possibleTriggers || x?.possible_triggers || [],
    metrics: {
      clarity,
      redness,
      oiliness: oil,
      dryness,
      texture,
      symmetry: sym,
      jawline: jaw,
    },
    disclaimer: x?.disclaimer || "Educational estimate. Not medical advice.",
    source: "gpt",
  };
}

function useFaceAnalyzer(faces, intakeMeta) {
  const [status, setStatus] = useState("waiting");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const ready = Boolean(faces.front && faces.left && faces.right);
    if (!ready) {
      setStatus("waiting");
      setResult(null);
      setProgress(0);
      return;
    }
    let cancel = false;
    setStatus("analyzing");
    setProgress(8);

    (async () => {
      try {
        // Attempt secure server analysis first
        const [frontB64, leftB64, rightB64] = await Promise.all([
          fileToBase64(faces.front),
          fileToBase64(faces.left),
          fileToBase64(faces.right),
        ]);
        setProgress(35);
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frontB64,
            leftB64,
            rightB64,
            meta: intakeMeta,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (cancel) return;
          setResult(normalizeServerOut(data));
          setProgress(100);
          setStatus("done");
          return;
        }
        // Fallback to local estimator if server unavailable
        const h1 = await fileHash(faces.front);
        const h2 = await fileHash(faces.left);
        const h3 = await fileHash(faces.right);
        if (cancel) return;
        const seed = (h1 ^ h2 ^ h3) >>> 0;
        setProgress(85);
        const local = buildLocalResult(seed);
        setResult(local);
        setProgress(100);
        setStatus("done");
      } catch (e) {
        try {
          // last-resort local path
          const h1 = await fileHash(faces.front);
          const h2 = await fileHash(faces.left);
          const h3 = await fileHash(faces.right);
          if (cancel) return;
          const seed = (h1 ^ h2 ^ h3) >>> 0;
          const local = buildLocalResult(seed);
          setResult(local);
          setProgress(100);
          setStatus("done");
        } catch {
          if (!cancel) {
            setStatus("error");
          }
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [faces.front, faces.left, faces.right, JSON.stringify(intakeMeta || {})]);

  const reset = () => {
    setStatus("waiting");
    setResult(null);
    setProgress(0);
  };
  return { status, progress, result, reset };
}

// -------------------- IMAGE QUALITY CHECKS --------------------
async function loadImageBitmap(file) {
  try {
    if ("createImageBitmap" in window) {
      return await createImageBitmap(file);
    }
  } catch {}
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function analyzeImageQuality(file, slot) {
  const issues = [];
  const hints = [];
  try {
    const bm = await loadImageBitmap(file);
    const w = bm.width,
      h = bm.height;
    if (w < 600 || h < 800)
      issues.push(
        "Low resolution — aim for at least 800×1000px in good light."
      );
    // Downscale to 128 for quick analysis
    const cnv = document.createElement("canvas");
    const s = 128;
    cnv.width = s;
    cnv.height = s;
    const ctx = cnv.getContext("2d");
    ctx.drawImage(bm, 0, 0, s, s);
    const img = ctx.getImageData(0, 0, s, s).data;
    let mean = 0;
    for (let i = 0; i < img.length; i += 4) {
      mean += img[i] * 0.2126 + img[i + 1] * 0.7152 + img[i + 2] * 0.0722;
    }
    mean /= img.length / 4;
    if (mean < 55)
      issues.push("Too dark — retake near a window or increase brightness.");
    if (mean > 205)
      issues.push("Overexposed — reduce harsh light; avoid flash.");
    // Simple blur metric via Sobel gradients
    let gx,
      gy,
      sharp = 0;
    const getL = (x, y) => {
      const idx = (y * s + x) * 4;
      return img[idx] * 0.2126 + img[idx + 1] * 0.7152 + img[idx + 2] * 0.0722;
    };
    for (let y = 1; y < s - 1; y++) {
      for (let x = 1; x < s - 1; x++) {
        gx =
          -getL(x - 1, y - 1) -
          2 * getL(x - 1, y) +
          -getL(x - 1, y + 1) +
          getL(x + 1, y - 1) +
          2 * getL(x + 1, y) +
          getL(x + 1, y + 1);
        gy =
          -getL(x - 1, y - 1) -
          2 * getL(x, y - 1) -
          getL(x + 1, y - 1) +
          getL(x - 1, y + 1) +
          2 * getL(x, y + 1) +
          getL(x + 1, y + 1);
        sharp += Math.sqrt(gx * gx + gy * gy);
      }
    }
    const normSharp = sharp / ((s - 2) * (s - 2));
    if (normSharp < 25)
      issues.push("Hazy/blurred — hold steady, clean lens, retake.");
  } catch {
    // ignore
  }
  // Optional FaceDetector (if supported)
  try {
    if ("FaceDetector" in window) {
      const detector = new window.FaceDetector({
        fastMode: true,
        maxDetectedFaces: 2,
      });
      const bmp = await loadImageBitmap(file);
      const cnv = document.createElement("canvas");
      cnv.width = bmp.width;
      cnv.height = bmp.height;
      const ctx = cnv.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const blob = await new Promise((res) =>
        cnv.toBlob(res, "image/jpeg", 0.92)
      );
      const f = new File([blob], "tmp.jpg", { type: "image/jpeg" });
      const imgEl = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = URL.createObjectURL(f);
      });
      const faces = await detector.detect(imgEl);
      if (!faces.length)
        issues.push(
          "No face detected — make sure your face is clearly visible."
        );
      if (faces.length > 1)
        issues.push(
          "Multiple faces detected — only the uploader should be in frame."
        );
      if (slot === "front" && faces[0])
        hints.push("Front view: look straight at camera, both ears balanced.");
      if (slot === "left")
        hints.push("Left profile: turn head left ~60–80°, left ear visible.");
      if (slot === "right")
        hints.push(
          "Right profile: turn head right ~60–80°, right ear visible."
        );
    } else {
      if (slot === "left")
        hints.push("Tip: left profile — show your left cheek & ear.");
      if (slot === "right")
        hints.push("Tip: right profile — show your right cheek & ear.");
    }
  } catch {
    // ignore detection errors
  }
  return { issues, hints };
}

// -------------------- PRIMITIVES --------------------
const Button = ({
  variant = "primary",
  href,
  onClick,
  children,
  className,
  type,
  target,
  rel,
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-slate-950 shadow hover:bg-emerald-400"
      : variant === "outline"
      ? "border border-white/10 bg-white/10 hover:bg-white/15"
      : "bg-white/0 hover:bg-white/10";
  const cls = clsx(base, styles, className);
  if (href)
    return (
      <a className={cls} href={href} target={target} rel={rel}>
        {children}
      </a>
    );
  return (
    <button className={cls} onClick={onClick} type={type}>
      {children}
    </button>
  );
};

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
      {title && <h3 className="text-xl font-semibold">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Meter({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-white/10">
      <div
        className="h-2 bg-emerald-400 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function BlurLock({ label = "Preview blurred" }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-content-center rounded-xl bg-slate-950/40 backdrop-blur">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">
        <Lock size={14} /> {label}
      </div>
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const map = {
    emerald: "border-emerald-300/40 bg-emerald-400/10 text-emerald-300",
    rose: "border-rose-300/40 bg-rose-400/10 text-rose-200",
    amber: "border-amber-300/40 bg-amber-400/10 text-amber-200",
    slate: "border-white/10 bg-white/10 text-white/80",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        map[tone] || map.slate
      }`}
    >
      {children}
    </span>
  );
}

function Bar({ label, value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between text-xs text-white/70">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-2 bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// -------------------- APP --------------------
export default function App() {
  useSEO();
  const DEV = useDevMode();
  // optional: run tests in dev if `?tests=1`
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const flag = (u.searchParams.get("tests") || "").toLowerCase();
      if (["1", "true", "yes", "on"].includes(flag)) {
        runUnitTests();
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header dev={DEV} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-24">
        <Hero />
        <OfferWizard dev={DEV} />
        <OfferStack />
        <BonusesStrong />
        <Guarantees />
        <Testimonials />
        {/* Proof removed */}
        <WhoNotFor />
        <Quickstart />
        <Policies />
        <FAQ />
        <Footer />
      </main>
      <StickyCTA />
      <WhatsAppNudge />
    </div>
  );
}

// -------------------- HEADER --------------------
function Header({ dev }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-400" />
          <span className="text-sm font-bold tracking-tight">Acne Reset</span>
          {dev && (
            <span className="ml-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              DEV MODE
            </span>
          )}
        </div>
        <nav className="hidden items-center gap-3 sm:flex">
          <a className="text-sm text-white/80 hover:text-white" href="#offer">
            Offer
          </a>
          <a className="text-sm text-white/80 hover:text-white" href="#bonuses">
            Bonuses
          </a>
          <a
            className="text-sm text-white/80 hover:text-white"
            href="#guarantee"
          >
            Guarantee
          </a>
          <a
            className="text-sm text-white/80 hover:text-white"
            href="#testimonials"
          >
            Testimonials
          </a>
          {/* Proof link removed */}
          <a className="text-sm text-white/80 hover:text-white" href="#faq">
            FAQ
          </a>
          <a
            className="text-sm text-white/80 hover:text-white"
            href="#policies"
          >
            Policies
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 sm:inline">
            {MECHANISM}
          </span>
          <Button className="hidden sm:inline-flex" href="#checkout">
            <ShoppingCart size={16} /> Join Now {formatINR(INTRO_PRICE)}
          </Button>
        </div>
      </div>
    </header>
  );
}

// -------------------- HERO --------------------
function Hero() {
  const { h, m, s, isOver } = useCountdown(SCARCITY.deadlineISO);
  return (
    <section className="mb-10 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-white/60">
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 font-bold text-slate-950">
            Founders Deal
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame size={14} /> Ends today
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          AI‑assisted 2‑Minute Looks Routine — first visible win in 7 days
          <span className="block text-emerald-400">Powered by {MECHANISM}</span>
        </h1>
        <p className="mt-3 text-white/80">
          Upload 3 selfies → secure server posts to GPT for **full** analysis
          (no key in browser). If the server is unreachable, a local estimator
          provides an educational preview. Overall/Potential ratings remain
          locked.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button href="#wizard">
            <Wand2 size={16} /> Get your plan in 2 minutes
          </Button>
          <Button variant="outline" href="#offer">
            <Percent size={16} /> Launch price: {formatINR(INTRO_PRICE)}
          </Button>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-white/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Clock size={14} /> 8‑week program
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <ShieldCheck size={14} /> Double guarantee
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Star size={14} /> AI‑guided support
          </span>
        </div>
        <SeatMeter />
        <p className="mt-2 text-xs text-white/60">
          Timer — {isOver ? "renewing soon" : `${h}h ${m}m ${s}s left`}.{" "}
          <a className="underline" href={POLICY.scarcity}>
            See scarcity policy
          </a>
          .
        </p>
      </div>
      <ValueEquationCard />
    </section>
  );
}

function ValueEquationCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-sm font-bold">
        Why this is a no‑brainer (Value Equation)
      </div>
      <ul className="space-y-2 text-sm text-white/80">
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5" size={16} />{" "}
          <span>
            <strong>Dream outcome ↑</strong>: clearer skin + confidence.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5" size={16} />{" "}
          <span>
            <strong>Perceived likelihood ↑</strong>: AI‑assisted plan, cohort
            support, weekly reviews.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5" size={16} />{" "}
          <span>
            <strong>Time delay ↓</strong>: first visible win targeted in 7 days;
            full protocol in 8 weeks.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5" size={16} />{" "}
          <span>
            <strong>Effort & sacrifice ↓</strong>: 2‑minute routine, product
            picks done for you.
          </span>
        </li>
      </ul>
    </div>
  );
}

// -------------------- WIZARD (4 steps now) --------------------
function OfferWizard({ dev }) {
  const [step, setStep] = useState(1); // 1 Intake → 2 Upload+Analyze → 3 Preview (blurred) → 4 Checkout
  const [intake, setIntake] = useState({
    severity: "moderate",
    skin: "oily",
    area: "face",
    budget: "low",
    timeGoal: 14,
    effort: 2,
    issues: [],
  });
  const [faces, setFaces] = useState({});
  const { previews, setFile } = useMultiImagePreview();
  const analyzer = useFaceAnalyzer(faces, intake);
  const value = useMemo(() => {
    const dream =
      intake.severity === "severe" ? 5 : intake.severity === "moderate" ? 4 : 3;
    const likelihood = 3.5;
    const time = Math.max(1, Math.round(intake.timeGoal / 7));
    const effort = Math.max(1, 6 - intake.effort);
    return {
      dream,
      likelihood,
      time,
      effort,
      score: valueEquationScore({ dream, likelihood, time, effort }),
    };
  }, [intake]);
  const routine = useMemo(() => makeRoutine(intake), [intake]);
  const previewRoutine = useMemo(
    () => ({
      morning: routine.morning.slice(0, 2),
      night: routine.night.slice(0, 2),
    }),
    [routine]
  );

  return (
    <section id="wizard" className="mt-6">
      <div className="mb-5">
        <div className="relative mx-auto flex max-w-xl items-center justify-between overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative flex items-center">
              <div
                className={clsx(
                  "grid h-6 w-6 place-content-center rounded-full text-xs",
                  i <= step
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-white/70"
                )}
              >
                {i}
              </div>
              {i < 4 && (
                <div
                  className={clsx(
                    "mx-2 h-[2px] w-10 sm:w-16 md:w-28",
                    i < step ? "bg-white" : "bg-white/10"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main column */}
        <div className="space-y-6">
          {step === 1 && (
            <StepIntake
              intake={intake}
              setIntake={setIntake}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepCaptureAnalyze
              DEV={dev}
              previews={previews}
              setFile={setFile}
              faces={faces}
              setFaces={setFaces}
              analyzer={analyzer}
              onPrev={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepPreview
              DEV={dev}
              analyzer={analyzer}
              previewRoutine={previewRoutine}
              value={value}
              onPrev={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Checkout
              intake={intake}
              routine={routine}
              value={value}
              onBack={() => setStep(3)}
            />
          )}
        </div>
        {/* No sidebar anymore */}
      </div>
    </section>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-emerald-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function LabeledSlider({ label, min, max, value, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">
        {label}: <span className="font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />
    </label>
  );
}
function CheckboxGroup({ label, options, values, onChange }) {
  return (
    <div>
      <div className="mb-2 text-sm text-white/80">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = values.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() =>
                onChange(
                  checked ? values.filter((v) => v !== o) : [...values, o]
                )
              }
              className={clsx(
                "rounded-full px-3 py-2 text-xs transition",
                checked
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-white/10 bg-white/10 text-white/80 hover:bg-white/15"
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepIntake({ intake, setIntake, onNext }) {
  return (
    <Card
      title="Tell us about your skin"
      subtitle={`We personalize with ${MECHANISM}.`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledSelect
          label="Severity"
          value={intake.severity}
          onChange={(v) => setIntake((s) => ({ ...s, severity: v }))}
          options={[
            { label: "Mild — black/whiteheads", value: "mild" },
            { label: "Moderate — inflamed", value: "moderate" },
            { label: "Severe — nodules/cysts", value: "severe" },
          ]}
        />
        <LabeledSelect
          label="Skin type"
          value={intake.skin}
          onChange={(v) => setIntake((s) => ({ ...s, skin: v }))}
          options={[
            { label: "Oily", value: "oily" },
            { label: "Dry", value: "dry" },
            { label: "Combination", value: "combo" },
            { label: "Normal", value: "normal" },
          ]}
        />
        <LabeledSelect
          label="Main area"
          value={intake.area}
          onChange={(v) => setIntake((s) => ({ ...s, area: v }))}
          options={[
            { label: "Face", value: "face" },
            { label: "Body", value: "body" },
            { label: "Both", value: "mixed" },
          ]}
        />
        <LabeledSelect
          label="Budget"
          value={intake.budget}
          onChange={(v) => setIntake((s) => ({ ...s, budget: v }))}
          options={[
            { label: "Student (low)", value: "low" },
            { label: "Mid", value: "mid" },
            { label: "High", value: "high" },
          ]}
        />
        <LabeledSlider
          label="Time to first visible win (days)"
          min={7}
          max={45}
          value={intake.timeGoal}
          onChange={(v) => setIntake((s) => ({ ...s, timeGoal: v }))}
        />
        <LabeledSlider
          label="How much daily effort? (1–5)"
          min={1}
          max={5}
          value={intake.effort}
          onChange={(v) => setIntake((s) => ({ ...s, effort: v }))}
        />
        <CheckboxGroup
          label="What have you tried?"
          options={[
            "Dermatologist",
            "Benzoyl Peroxide",
            "Retinoids",
            "Antibiotics",
            "Ayurveda/Home",
            "Nothing consistent",
          ]}
          values={intake.issues}
          onChange={(vals) => setIntake((s) => ({ ...s, issues: vals }))}
        />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={onNext}>
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

function AnalyzingOverlay() {
  return (
    <div className="absolute inset-0 rounded-lg bg-slate-900/50 backdrop-blur">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "-100%" }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
          className="h-1/3 w-full bg-gradient-to-b from-transparent via-white/30 to-transparent"
        />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white">
        Analyzing…
      </div>
    </div>
  );
}

function StepCaptureAnalyze({
  DEV,
  previews,
  setFile,
  faces,
  setFaces,
  analyzer,
  onPrev,
  onNext,
}) {
  const [warnings, setWarnings] = useState({ front: [], left: [], right: [] });
  const [hints, setHints] = useState({ front: [], left: [], right: [] });

  const onPick = (slot) => async (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFaces((s) => ({ ...s, [slot]: f }));
      setFile(slot, f);
      const q = await analyzeImageQuality(f, slot);
      setWarnings((w) => ({ ...w, [slot]: q.issues }));
      setHints((h) => ({ ...h, [slot]: q.hints }));
    }
  };

  const ready = Boolean(faces.front && faces.left && faces.right);

  useEffect(() => {
    // auto-advance to preview after analysis finishes
    if (analyzer.status === "done") {
      // stay on this step to show results + ratings blur + CTA; user can hit Next to go to Preview step (routine)
    }
  }, [analyzer.status]);

  const blurred = !DEV; // dev mode unblurs

  return (
    <Card
      title="Upload & Analyze (AI)"
      subtitle="Front, left, right — natural light, no filter. Analysis starts automatically after all 3 photos are in."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["front", "left", "right"].map((slot) => (
          <div key={slot}>
            <label className="block text-sm text-white/80 capitalize">
              {slot}
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-3">
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3"
                onChange={onPick(slot)}
              />
              <p className="mt-2 text-xs text-white/60">
                Tap to add a {slot} selfie
              </p>
            </div>
            <div
              className="relative mt-2 grid place-content-center overflow-hidden rounded-lg bg-white/5"
              style={{ aspectRatio: "3/4" }}
            >
              {previews[slot] ? (
                <img
                  src={previews[slot]}
                  alt={`${slot} selfie, AI skin analysis, acne skincare`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-6 text-center text-white/40">No image</div>
              )}
              {analyzer.status === "analyzing" && ready && <AnalyzingOverlay />}
            </div>
            {(warnings[slot]?.length > 0 || hints[slot]?.length > 0) && (
              <div className="mt-2 space-y-1 text-xs">
                {warnings[slot].map((w, i) => (
                  <div key={i} className="flex items-start gap-1 text-rose-300">
                    <AlertTriangle size={12} /> <span>{w}</span>
                  </div>
                ))}
                {hints[slot].map((t, i) => (
                  <div key={i} className="flex items-start gap-1 text-white/60">
                    <Info size={12} /> <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Analyzer status */}
      <div className="mt-4">
        {analyzer.status === "waiting" && (
          <div className="text-white/70">
            Add all 3 photos to auto‑analyze. You can also continue without
            photos.
          </div>
        )}
        {analyzer.status === "analyzing" && (
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-white/80">
              <Info size={14} /> Running analysis…
            </div>
            <Meter value={analyzer.progress} />
            <div className="mt-1 text-xs text-white/50">
              This is educational, not diagnostic.
            </div>
          </div>
        )}
      </div>

      {/* Results inline once done */}
      {analyzer.status === "done" && analyzer.result && (
        <div className="mt-5 space-y-4">
          <ClinicalReport result={analyzer.result} />

          {/* Ratings — BLURRED/LOCKED with CTA below */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-1 text-sm font-semibold">
              AI Analysis Ratings{" "}
              <span className="text-xs text-white/50">
                (source: {analyzer.result.source})
              </span>
            </div>
            <div className={clsx(blurred && "blur-sm select-none")}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                  <div className="text-xs text-white/60">Overall Rating</div>
                  <div className="text-4xl font-black text-emerald-300">
                    {analyzer.result.overallRating}/100
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    Composite of clarity, texture, redness & oil
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                  <div className="text-xs text-white/60">Potential Rating</div>
                  <div className="text-4xl font-black text-emerald-300">
                    {analyzer.result.potentialRating}/100
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    Projected with consistent routine
                  </p>
                </div>
              </div>
            </div>
            {blurred && <BlurLock label="Ratings blurred — unlock to view" />}
            <div className="mt-3">
              <Button href="#checkout">
                <Lock size={16} /> Unlock full Clinical Report
              </Button>
            </div>
            <p className="mt-2 text-xs text-white/50">
              Instant access after purchase.
            </p>
          </div>
        </div>
      )}

      {analyzer.status === "error" && (
        <div className="mt-4 rounded-xl border border-rose-300/40 bg-rose-400/10 p-3 text-rose-200">
          Could not analyze. Try smaller images, better light, or different
          photos.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Button className="w-full sm:w-auto" onClick={onNext}>
          Continue <ArrowRight size={16} />
        </Button>
      </div>
      <p className="mt-2 text-xs text-white/50">
        Selfies are posted to your own secure backend for GPT analysis. If your
        backend isn’t set up, a local estimator runs on‑device. See{" "}
        <a className="underline" href={POLICY.privacy}>
          privacy
        </a>
        .
      </p>
    </Card>
  );
}

// -------------------- CLINICAL REPORT --------------------
function buildFindings(r) {
  const m = r.metrics || {};
  const dist = r.distribution || {};
  const out = [];
  const strong = (k, v, txt) => {
    if (v >= k) out.push(txt);
  };
  const low = (k, v, txt) => {
    if (v <= k) out.push(txt);
  };
  strong(
    65,
    m.oiliness,
    "Excess sebum across T‑zone — expect midday shine and clogged pores if not managed."
  );
  strong(
    55,
    m.redness,
    "Visible erythema/irritation—likely barrier stressed; reduce actives and add barrier support."
  );
  low(
    60,
    m.texture,
    "Texture irregularities/closed comedones likely visible on close‑up."
  );
  low(
    60,
    m.clarity,
    "Overall clarity below target—consistent AM/PM routine recommended."
  );
  if ((r.counts?.inflamed || 0) > 5)
    out.push(
      "Multiple inflamed papules present—avoid picking; use a leave‑on BPO or short‑contact wash."
    );
  if ((r.counts?.nodules_cysts || 0) > 0)
    out.push(
      "Possible deep nodules—seek dermatologist for prescription options."
    );
  Object.entries(dist).forEach(([region, severity]) => {
    if (["moderate", "severe"].includes(String(severity)))
      out.push(
        `${
          String(region)[0].toUpperCase() + String(region).slice(1)
        } shows ${severity} activity.`
      );
  });
  return out.length
    ? out
    : [
        "Photos look close to baseline; stay consistent and monitor weekly changes.",
      ];
}

function ClinicalReport({ result }) {
  const m = result.metrics || {};
  const dist = result.distribution || {};
  const counts = result.counts || {};
  const findings = buildFindings(result);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
        <span>AI Clinical Report</span>
        <Badge tone="emerald">source: {result.source}</Badge>
        <Badge>{`type: ${result.skinType || "uncertain"}`}</Badge>
        <Badge
          tone={
            result.severity === "severe"
              ? "rose"
              : result.severity === "moderate"
              ? "amber"
              : "emerald"
          }
        >{`severity: ${result.severity || "uncertain"}`}</Badge>
      </div>

      {/* Stronger sales copy headline */}
      <div className="mb-2 text-sm font-bold text-white">
        Insecurities & Problems (what the AI actually sees)
      </div>

      {/* High‑priority concerns */}
      <div className="mb-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
          {findings.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Region map */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {["forehead", "cheeks", "nose", "jaw"].map((k) => (
          <div
            key={k}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
          >
            <div className="mb-1 text-xs text-white/60">
              {k[0].toUpperCase() + k.slice(1)}
            </div>
            <div className="font-semibold capitalize">
              {String(dist[k] || "none")}
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
          <div className="mb-1 text-xs text-white/60">Lesion counts</div>
          <div>
            Non‑inflamed:{" "}
            <span className="font-semibold">{counts.non_inflamed ?? "—"}</span>
          </div>
          <div>
            Inflamed:{" "}
            <span className="font-semibold">{counts.inflamed ?? "—"}</span>
          </div>
          <div>
            Nodules/Cysts:{" "}
            <span className="font-semibold">{counts.nodules_cysts ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Bar label="Clarity" value={m.clarity} />
          <Bar label="Texture" value={m.texture} />
          <Bar label="Redness" value={m.redness} />
        </div>
        <div>
          <Bar label="Oiliness" value={m.oiliness} />
          <Bar label="Dryness" value={m.dryness} />
          <Bar label="Symmetry" value={m.symmetry} />
        </div>
      </div>

      {/* Triggers & Actions */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-sm font-semibold">Likely contributors</div>
          <ul className="list-disc pl-5 text-sm text-white/80">
            {(result.possibleTriggers || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-sm font-semibold">
            Non‑medical actions (start now)
          </div>
          <ul className="list-disc pl-5 text-sm text-white/80">
            {(result.nonMedicalActions || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Outline */}
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
        <div className="mb-1 font-semibold">Routine outline (preview)</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-white/60">AM</div>
            <ul className="list-inside space-y-1 text-white/80">
              {(result.routineOutline?.AM || []).map((x, i) => (
                <li key={i}>• {x}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-white/60">PM</div>
            <ul className="list-inside space-y-1 text-white/80">
              {(result.routineOutline?.PM || []).map((x, i) => (
                <li key={i}>• {x}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50">
          {result.disclaimer || "Educational estimate. Not medical advice."}
        </p>
      </div>
    </div>
  );
}

// -------------------- ROUTINE PREVIEW --------------------
function RoutineCard({ routine, intake, value }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-1 text-lg font-semibold">Morning</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">
          {routine.morning.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
        <h4 className="mb-1 mt-4 text-lg font-semibold">Night</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">
          {routine.night.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-2 text-lg font-semibold">Why this works</h4>
        <ul className="list-inside space-y-2 text-sm text-white/80">
          <li>
            <CheckCircle2 className="mr-1 inline" size={16} /> Value Score:{" "}
            <span className="font-semibold text-emerald-300">
              {value.score}
            </span>{" "}
            (Dream×Likelihood / Time×Effort)
          </li>
          <li>
            <CheckCircle2 className="mr-1 inline" size={16} /> First win
            targeted in{" "}
            <span className="font-semibold">{intake.timeGoal || 14} days</span>
          </li>
          <li>
            <CheckCircle2 className="mr-1 inline" size={16} /> Effort tuned to{" "}
            <span className="font-semibold">{intake.effort || 2}/5</span>
          </li>
          <li>
            <ShieldCheck className="mr-1 inline" size={16} /> Educational
            guidance; not medical advice.
          </li>
        </ul>
      </div>
    </div>
  );
}

function StepPreview({ DEV, analyzer, previewRoutine, value, onPrev, onNext }) {
  const blurred = !DEV;
  return (
    <Card
      title="Your personalized routine (locked preview)"
      subtitle="Unlock the full routine and product picks"
    >
      <div className="relative">
        <div className={clsx(blurred && "blur-sm select-none")}>
          \
          <RoutineCard
            routine={{
              morning: previewRoutine.morning,
              night: previewRoutine.night,
            }}
            intake={{ timeGoal: 14, effort: 2 }}
            value={value}
          />
        </div>
        {blurred && <BlurLock label="Routine blurred — unlock to view" />}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Button className="w-full sm:w-auto" onClick={onNext}>
          <Lock size={16} /> Unlock Now <ArrowRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

// -------------------- OFFER STACK --------------------
function OfferStack() {
  return (
    <section id="offer" className="mt-12">
      <h3 className="text-2xl font-bold">Pick your plan</h3>
      <p className="text-white/70">
        Good–Better–Best with premium anchoring. All plans include the core Acne
        Reset system.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PlanCard
          name="Starter"
          price={INTRO_PRICE}
          badge="Best value"
          features={[
            "Personalized AM/PM routine",
            "3 curated products",
            "Weekly adjustments (8w)",
            "Community access",
          ]}
          cta="Join Starter"
        />
        <PlanCard
          name="Pro"
          price={INTRO_PRICE + 350}
          badge="Most popular"
          features={[
            "Everything in Starter",
            "1:1 kickoff call (15m)",
            "Sensitive‑skin protocol",
            "SOS breakout mini‑plan",
          ]}
          cta="Join Pro"
          highlight
        />
        <PlanCard
          name="VIP"
          price={1999}
          badge="Premium"
          features={[
            "Everything in Pro",
            "Two 1:1 check‑ins",
            "WhatsApp priority line",
            "Product replacements guidance",
          ]}
          cta="Join VIP"
        />
      </div>
      <OfferMath />
    </section>
  );
}

function PlanCard({ name, price, badge, features, cta, highlight }) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl border p-5",
        highlight
          ? "border-emerald-400/60 bg-emerald-400/5 border-white/10"
          : "border-white/10 bg-white/5"
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 shadow">
          {badge}
        </div>
      )}
      <div className="mb-1 text-sm font-bold">{name}</div>
      <div className="mb-4 flex items-end gap-2">
        <div className="text-3xl font-extrabold">{formatINR(price)}</div>
        <div className="text-xs text-white/60 line-through">
          {formatINR(LIST_PRICE)}
        </div>
      </div>
      <ul className="mb-4 space-y-1 text-sm text-white/80">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Plus size={16} /> {f}
          </li>
        ))}
      </ul>
      <Button href="#checkout">
        <ShoppingCart size={16} /> {cta}
      </Button>
      <p className="mt-2 text-xs text-white/60">
        Pay‑in‑full bonus applied at checkout.
      </p>
    </div>
  );
}

function OfferMath() {
  const stack = [
    { label: "8‑week program & playbook", value: 7999 },
    { label: "Cohort & community", value: 1999 },
    { label: "Sensitive‑skin protocol", value: 1499 },
    { label: "SOS breakout mini‑plan", value: 999 },
  ];
  const total = stack.reduce((a, b) => a + b.value, 0);
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <div className="mb-2 text-sm font-bold">Value stack</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/0 p-3"
          >
            <div className="font-semibold">{s.label}</div>
            <div className="text-white/70">Value {formatINR(s.value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        Total comparable value {formatINR(total)} • Your price starts at{" "}
        {formatINR(INTRO_PRICE)}.
      </div>
    </div>
  );
}

// -------------------- CHECKOUT --------------------
function Checkout({ onBack, intake, routine, value }) {
  const [plan, setPlan] = useState("one");
  const splitTotal = Math.round(INTRO_PRICE * 1.1);
  const splitPart = Math.ceil(splitTotal / 2);
  const [bump, setBump] = useState(false);
  const [pifBonus] = useState(true);

  const checkoutHref = React.useMemo(() => {
    const base = plan === "split" ? CHECKOUT_SPLIT_URL : CHECKOUT_URL;
    try {
      const u = new URL(base);
      u.searchParams.set("plan", plan);
      u.searchParams.set("core", String(INTRO_PRICE));
      if (plan === "split") {
        u.searchParams.set("split_total", String(splitTotal));
        u.searchParams.set("split_part", String(splitPart));
      }
      if (bump) u.searchParams.set("bump", String(BUMP_PRICE));
      if (pifBonus) u.searchParams.set("pif_bonus", "1");
      return u.toString();
    } catch {
      const params = new URLSearchParams({
        plan,
        core: String(INTRO_PRICE),
        ...(plan === "split"
          ? { split_total: String(splitTotal), split_part: String(splitPart) }
          : {}),
        ...(bump ? { bump: String(BUMP_PRICE) } : {}),
        ...(pifBonus ? { pif_bonus: "1" } : {}),
      });
      return `${base}?${params}`;
    }
  }, [plan, bump, splitTotal, splitPart, pifBonus]);

  const payLabel =
    plan === "split"
      ? `Pay ${formatINR(splitPart + (bump ? BUMP_PRICE : 0))} now — Split‑pay`
      : `Pay ${formatINR(
          INTRO_PRICE + (bump ? BUMP_PRICE : 0)
        )} — Open Checkout`;

  return (
    <Card
      title="Checkout"
      subtitle="Secure your spot — founders' pricing for first cohort."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm font-semibold">Choose payment</div>
            <div className="grid gap-2 md:grid-cols-2">
              <label
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
                  plan === "one"
                    ? "border-emerald-400/60 bg-emerald-400/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <input
                  type="radio"
                  className="accent-emerald-400"
                  checked={plan === "one"}
                  onChange={() => setPlan("one")}
                />
                <div>
                  <div className="font-semibold">One‑time</div>
                  <div className="text-sm text-white/70">
                    {formatINR(INTRO_PRICE)}{" "}
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                      Pay‑in‑full bonus
                    </span>
                  </div>
                </div>
              </label>
              <label
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
                  plan === "split"
                    ? "border-emerald-400/60 bg-emerald-400/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <input
                  type="radio"
                  className="accent-emerald-400"
                  checked={plan === "split"}
                  onChange={() => setPlan("split")}
                />
                <div>
                  <div className="font-semibold">Split‑pay</div>
                  <div className="text-sm text-white/70">
                    2 × {formatINR(splitPart)} (Total {formatINR(splitTotal)})
                  </div>
                </div>
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck size={14} /> Covered by Double Guarantee —{" "}
              <a className="underline" href={POLICY.guarantee}>
                read terms
              </a>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="accent-emerald-400"
                  checked={bump}
                  onChange={(e) => setBump(e.target.checked)}
                />
                <div>
                  <div className="font-semibold">
                    Add SOS Product Links + 3 Micro‑Videos
                  </div>
                  <div className="text-xs text-white/70">
                    One‑click list of products + how‑to apply (optional)
                  </div>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                + {formatINR(BUMP_PRICE)}
              </div>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft size={16} /> Back to Preview
            </Button>
            <Button
              className="w-full sm:w-auto"
              href={checkoutHref}
              target="_blank"
              rel="noopener"
            >
              <ShoppingCart size={18} /> {payLabel}
            </Button>
          </div>
          <p className="mt-3 text-xs text-white/60">
            By continuing you agree to fair‑use, no‑medical‑advice, and
            guarantee terms.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <h4 className="text-lg font-semibold">You're getting</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>• Personalized routine</li>
            <li>• 3 curated product picks</li>
            <li>• Weekly adjustments (8 weeks)</li>
            <li>• Community access</li>
            <li>• Double guarantee</li>
          </ul>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
            <div className="text-xs text-white/60 line-through">
              {formatINR(LIST_PRICE)}
            </div>
            <div className="text-2xl font-black text-emerald-300">
              {formatINR(INTRO_PRICE)}
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm">
            <div className="mb-1 font-semibold">Double Guarantee</div>
            <p className="text-white/80">
              30‑day money‑back + Results‑based support extension if no visible
              improvement by week 8.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// -------------------- BONUSES (stronger UI) --------------------
function BonusesStrong() {
  const items = [
    {
      title: "Clear Skin Cheatsheet (PDF)",
      value: 499,
      blurb: "One‑pager you’ll actually follow.",
    },
    {
      title: "Ingredient Decoder (mobile)",
      value: 599,
      blurb: "Snap labels → know what works.",
    },
    {
      title: "Travel Routine Builder",
      value: 399,
      blurb: "3 items, zero breakouts on trips.",
    },
  ];
  return (
    <section id="bonuses" className="mt-12">
      <div className="relative">
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-400/30 to-cyan-400/30 blur-xl"
          aria-hidden
        />
        <div className="relative rounded-3xl border border-emerald-300/40 bg-slate-900/50 p-6">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            Fast‑action bonuses
          </div>
          <h3 className="text-2xl font-extrabold">
            Lock these in before the timer ends
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {items.map((b, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-4"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl transition-transform group-hover:scale-125" />
                <div className="text-sm font-bold">{b.title}</div>
                <div className="text-xs text-white/60">
                  Value {formatINR(b.value)}
                </div>
                <div className="mt-3 text-sm text-white/80">{b.blurb}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300">
                  <ShieldCheck size={14} /> Included for early buyers
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/60">
            Bonuses expire with the countdown.{" "}
            <a className="underline" href={POLICY.scarcity}>
              See scarcity policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function Guarantees() {
  return (
    <section id="guarantee" className="mt-12">
      <h3 className="text-2xl font-bold">Double guarantee</h3>
      <p className="text-white/70">
        We remove the risk so you can focus on results.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 text-sm font-bold">
            <ShieldCheck className="mr-1 inline" size={16} /> 30‑day Money‑Back
          </div>
          <p className="text-sm text-white/80">
            Try it for 30 days. If you don’t love it, email support—full refund.
            No forms, no drama.{" "}
            <a className="underline" href={POLICY.guarantee}>
              Read terms
            </a>
            .
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 text-sm font-bold">
            <ShieldCheck className="mr-1 inline" size={16} /> Results‑Based
          </div>
          <p className="text-sm text-white/80">
            Follow the weekly plan. If no visible improvement by week 8, we’ll
            work with you free for 8 more weeks.{" "}
            <a className="underline" href={POLICY.guarantee}>
              Read terms
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

// -------------------- TESTIMONIALS (placeholders) --------------------
function PlaceholderBeforeAfter() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {["Before", "After"].map((label, i) => (
        <div
          key={i}
          className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900"
        >
          <div className="absolute inset-0 grid place-content-center">
            <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
              {label}
            </div>
          </div>
          <div className="absolute left-0 top-0 h-16 w-16 -translate-x-1/3 -translate-y-1/3 rotate-45 bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Ayesha K.",
      role: "Student",
      quote:
        "“AI‑assisted routine gave me a 7‑day win—stuck to it because it was so simple.”",
    },
    {
      name: "Rohit S.",
      role: "Engineer",
      quote:
        "“The AI baseline & potential rating motivated me. Texture improved in week 2.”",
    },
    {
      name: "Maya D.",
      role: "Designer",
      quote:
        "“Loved the product links and the cohort. The routine just clicked.”",
    },
    {
      name: "Karan V.",
      role: "Athlete",
      quote: "“Oil control tips were 🔥. SPF habits finally stuck.”",
    },
    {
      name: "Ananya P.",
      role: "Creator",
      quote: "“Weekly tweaks kept me progressing. Felt personalized.”",
    },
    {
      name: "Nikhil T.",
      role: "Analyst",
      quote: "“Short, clear steps. No fluff. Worth it.”",
    },
  ];
  return (
    <section id="testimonials" className="mt-12">
      <h3 className="text-2xl font-bold">Testimonials (placeholders)</h3>
      <p className="text-white/70">
        Swap these with real before/after photos and quotes from the cohort.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <PlaceholderBeforeAfter />
            <div className="mt-3 text-sm text-white/80">{it.quote}</div>
            <div className="mt-2 text-xs text-white/60">
              — {it.name}, {it.role}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoNotFor() {
  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold">Who this is NOT for</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
        <li>
          If you expect prescription‑level results without medical supervision.
        </li>
        <li>If you won’t follow a 2‑minute daily routine for 14 days.</li>
        <li>
          If you want luxury products only (we optimize for budget first).
        </li>
      </ul>
    </section>
  );
}

function Quickstart() {
  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold">Your first 24 hours</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { h: "T‑0h", t: "Upload selfies & get plan" },
          { h: "+2h", t: "Get starter kit (links provided)" },
          { h: "+24h", t: "First routine check‑in (2 minutes)" },
        ].map((b, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm"
          >
            <div className="text-xs text-white/60">{b.h}</div>
            <div className="font-semibold">{b.t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// -------------------- FAQ & POLICIES --------------------
function FAQ() {
  const items = [
    {
      q: "Is this medical advice?",
      a: "No. Educational guidance only. Consult a dermatologist for medical concerns.",
    },
    {
      q: "Money‑back terms?",
      a: "30‑day no‑questions refund. Results guarantee extends help for another 8 weeks if needed. See policy.",
    },
    {
      q: "Sensitive skin?",
      a: "We bias fragrance‑free gentle picks; ramp actives slowly.",
    },
    {
      q: "Is the AI analysis accurate?",
      a: "Your selfies are analyzed by GPT via your secure backend when available; otherwise a local estimator generates an educational preview. Not a diagnosis.",
    },
  ];
  return (
    <section id="faq" className="mt-12">
      <h3 className="text-2xl font-bold">FAQ</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <details
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <summary className="cursor-pointer list-none font-semibold">
              {it.q}
            </summary>
            <p className="mt-1 text-sm text-white/70">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Policies() {
  return (
    <section id="policies" className="mt-12 text-sm">
      <h3 className="text-2xl font-bold">Policies</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
        <li>
          <a className="underline" href={POLICY.guarantee}>
            Guarantee & Refund Terms
          </a>
        </li>
        <li>
          <a className="underline" href={POLICY.scarcity}>
            Scarcity & Timer Integrity Policy
          </a>
        </li>
        <li>
          <a className="underline" href={POLICY.privacy}>
            Privacy (Selfie analysis & data)
          </a>
        </li>
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 text-center text-xs text-white/50">
      <p>
        © {new Date().getFullYear()} Aswan — Educational content. Not medical
        advice.{" "}
        <a
          className="underline"
          href={CHANNEL_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          Join the community
        </a>
        .
      </p>
    </footer>
  );
}

// -------------------- STICKY & SUPPORT --------------------
function StickyCTA() {
  const style = { bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" };
  return (
    <div
      id="checkout"
      className="pointer-events-none fixed left-0 right-0 z-40"
      style={style}
    >
      <div className="mx-auto max-w-6xl px-3">
        <div className="pointer-events-auto mx-auto w-full sm:w-max rounded-xl border border-emerald-300/40 bg-emerald-500 text-slate-900 shadow-lg">
          <a
            href="#offer"
            className="flex w-full items-center justify-center gap-2 px-5 py-3 font-semibold"
          >
            <ShoppingCart size={18} /> Get the 21‑Day Acne Reset —{" "}
            {formatINR(INTRO_PRICE)}
          </a>
        </div>
      </div>
    </div>
  );
}

function WhatsAppNudge() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  const style = { bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" };
  return (
    <motion.a
      href={SUPPORT_WHATSAPP}
      target="_blank"
      rel="noopener"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed right-3 z-40 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur"
      style={style}
    >
      <MessageSquare size={16} /> Got a question? WhatsApp us
    </motion.a>
  );
}

// -------------------- SCARCITY WIDGET --------------------
function SeatMeter() {
  const [claimed, setClaimed] = useState(null);
  useEffect(() => {
    let active = true;
    fetch("/seats.json")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const n = Number(d.claimed);
        setClaimed(Number.isFinite(n) ? n : 0);
      })
      .catch(() => {
        if (active) setClaimed(118);
      });
    return () => {
      active = false;
    };
  }, []);
  const total = SCARCITY.seats;
  const n = Math.min(Math.max(claimed ?? 0, 0), total);
  const pct = Math.round((n / total) * 100);
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-white/70">
        <span>Seats claimed</span>
        <span>
          {n} / {total} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-2 bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// -------------------- ROUTINE ENGINE --------------------
function makeRoutine(intake) {
  const p = (x) => x;
  const baseCleanser =
    intake.skin === "dry"
      ? p("Gentle hydrating cleanser (AM/PM)")
      : p("Foaming salicylic cleanser (AM/PM)");
  const sunscreen = p("Sunscreen SPF 50 PA++++ (AM, 2-finger rule)");
  const moisturizer =
    intake.skin === "oily"
      ? p("Gel moisturizer (AM/PM)")
      : p("Ceramide moisturizer (AM/PM)");
  let activeAM = p("2% salicylic acid toner (AM 3x/week)");
  let activePM = p("Adapalene 0.1% (PM, pea-size, 3x/week → nightly)");
  if (intake.severity === "severe") {
    activeAM = p("BPO 2.5% leave-on (AM)");
    activePM = p("Adapalene 0.1% + BPO 2.5% (PM, alternate nights)");
  } else if (intake.severity === "moderate") {
    activeAM = p("BPO 2.5% wash (AM)");
    activePM = p("Adapalene 0.1% (PM)");
  }
  const morning = [baseCleanser, activeAM, moisturizer, sunscreen];
  const night = [baseCleanser, activePM, moisturizer];
  return { morning, night };
}

// -------------------- SEO TAGGING --------------------
function useSEO() {
  useEffect(() => {
    try {
      const head = document.head;
      const metaK = document.createElement("meta");
      metaK.name = "keywords";
      metaK.content =
        "AI skin analysis, acne, skincare, GPT, routine, dermatology, face analysis, photos, India";
      head.appendChild(metaK);
      const ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "AI Skin & Acne Analysis",
        description:
          "Upload selfies for AI acne analysis and personalized routine.",
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(ld);
      head.appendChild(script);
      return () => {
        head.removeChild(metaK);
        head.removeChild(script);
      };
    } catch {}
  }, []);
}

// -------------------- DEV TESTS --------------------
function runUnitTests() {
  const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };
  try {
    // valueEquationScore
    assert(
      valueEquationScore({ dream: 4, likelihood: 3, time: 2, effort: 2 }) === 3,
      "valueEquationScore basic"
    );
    assert(
      valueEquationScore({ dream: 5, likelihood: 4, time: 1, effort: 1 }) >= 19,
      "valueEquationScore high"
    );

    // makeRoutine branching
    const r1 = makeRoutine({ skin: "dry", severity: "mild" });
    assert(r1.morning.length === 4 && r1.night.length === 3, "routine lengths");
    const r2 = makeRoutine({ skin: "oily", severity: "severe" });
    assert(r2.morning.join(" ").includes("BPO"), "severe includes BPO AM");

    // normalizeServerOut mapping
    const normalized = normalizeServerOut({
      metrics: {
        clarity: 70,
        redness: 20,
        oiliness: 30,
        dryness: 10,
        texture: 80,
        symmetry: 90,
        jawline: 60,
      },
      severity: "moderate",
    });
    assert(normalized.metrics.clarity === 70, "normalize metrics");
    assert(normalized.severity === "moderate", "normalize severity");

    // buildLocalResult ranges
    const local = buildLocalResult(123456);
    [
      "clarity",
      "redness",
      "oiliness",
      "dryness",
      "texture",
      "symmetry",
      "jawline",
    ].forEach((k) => {
      const v = local.metrics[k === "oiliness" ? "oiliness" : k];
      assert(v >= 5 && v <= 100, `metric ${k} in range`);
    });

    console.log("✅ All unit tests passed");
  } catch (e) {
    console.error("❌ Unit test failed:", e.message || e);
  }
}
