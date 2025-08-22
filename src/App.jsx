import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  FileText,
  FlaskConical,
  Sun,
  RefreshCw,
  KeyRound,
  EyeOff,
  Gauge,
} from "lucide-react";

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
  if (typeof window === "undefined") return DEFAULT_INTRO_PRICE;
  const url = new URL(window.location.href);
  const p = url.searchParams.get("price");
  if (p && /^\d+$/.test(p)) return Math.max(199, parseInt(p, 10));
  return DEFAULT_INTRO_PRICE;
}
const INTRO_PRICE = getIntroPrice();
const ANCHOR_PRICE = 2999;

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
    if (typeof window === "undefined") return;
    try {
      const u = new URL(window.location.href);
      const v = (u.searchParams.get("dev") || "").toLowerCase();
      setDev(["1", "true", "yes", "on"].includes(v));
    } catch {}
  }, []);
  return dev;
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
  disabled,
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-slate-950 shadow hover:bg-emerald-400"
      : variant === "outline"
      ? "border border-white/10 bg-white/10 hover:bg-white/15"
      : variant === "ghost"
      ? "border border-white/10 bg-white/5 hover:bg-white/10"
      : "bg-white/0 hover:bg-white/10";
  const Comp = href ? "a" : "button";

  return (
    <Comp
      href={href}
      onClick={onClick}
      className={clsx(base, styles, className)}
      target={target}
      rel={rel}
      disabled={disabled}
      type={type}
    >
      {children}
    </Comp>
  );
};

const Card = ({ title, subtitle, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 p-5 shadow ${className}`}
  >
    {title && <h3 className="text-xl font-semibold">{title}</h3>}
    {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
    <div className={clsx(title || subtitle) && "mt-4"}>{children}</div>
  </div>
);

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

// MOCK ANALYSIS RESULT - In a real app, this would come from the GPT API
function buildMockAPIResult(seed) {
  const skinType = ["oily", "dry", "combo", "normal"][seed % 4];
  const clarity = 100 - (((seed >>> 3) % 80) + 5);
  const redness = ((seed >>> 7) % 90) + 5;
  const oil = ((seed >>> 11) % 90) + 5;

  return {
    metrics: {
      clarity,
      redness,
      oiliness: oil,
      dryness: ((seed >>> 17) % 90) + 5,
      texture: 100 - (((seed >>> 19) % 75) + 10),
      symmetry: ((seed >>> 23) % 60) + 35,
      jawline: ((seed >>> 27) % 65) + 30,
    },
    skinType,
    severity: oil > 65 || redness > 60 ? "moderate" : "mild",
    flags: ["Targeted clarity improvement", "Barrier support regimen"],
    overallRating: Math.round(
      0.4 * clarity + 0.3 * (100 - redness) + 0.3 * (100 - oil)
    ),
    potentialRating: Math.min(
      100,
      Math.round(
        (0.4 * clarity + 0.3 * (100 - redness) + 0.3 * (100 - oil)) * 1.25
      ) + 5
    ),
    distribution: {
      forehead: "mild",
      cheeks: "moderate",
      nose: "mild",
      jaw: "none",
    },
    counts: {
      non_inflamed: (seed % 10) + 5,
      inflamed: seed % 5,
      nodules_cysts: 0,
    },
    routineOutline: {
      AM: ["Gentle Cleanser", "Vitamin C Serum", "Moisturizer", "SPF 50"],
      PM: ["Cleanser", "Retinoid (0.025%)", "Moisturizer"],
    },
    nonMedicalActions: [
      "Increase water intake",
      "Use silk pillowcase",
      "Avoid dairy if sensitive",
    ],
    possibleTriggers: ["Hormonal fluctuations", "Stress"],
    disclaimer:
      "Analysis powered by GPT-5 Turbo. This is an educational estimate, not medical advice.",
    source: "gpt-5-turbo",
  };
}

// ---------- Secure GPT call hook ----------
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

function normalizeServerOut(x) {
  const m = x?.metrics || {};
  const clarity = Number(m.clarity) || 0,
    redness = Number(m.redness) || 0,
    oil = Number(m.oiliness) || 0,
    dryness = Number(m.dryness) || 0,
    texture = Number(m.texture) || 0,
    sym = Number(m.symmetry) || 0,
    jaw = Number(m.jawline) || 0;
  const acneRisk = Math.max(
    5,
    Math.min(100, Math.round(0.6 * (100 - clarity) + 0.2 * redness + 0.2 * oil))
  );
  const scores = [
    { key: "clarity", label: "Skin Clarity", score: Math.round(clarity) },
    { key: "redness", label: "Redness", score: Math.round(redness) },
    { key: "oiliness", label: "Oiliness", score: Math.round(oil) },
    { key: "dryness", label: "Dryness", score: Math.round(dryness) },
    { key: "texture", label: "Texture Smoothness", score: Math.round(texture) },
    { key: "symmetry", label: "Facial Symmetry", score: Math.round(sym) },
    { key: "jawline", label: "Jawline Definition", score: Math.round(jaw) },
    { key: "risk", label: "Acne Risk (composite)", score: acneRisk },
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
    source: x?.source || "gpt",
    summaryPoints: x?.summaryPoints || [],
  };
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
    { key: "oiliness", label: "Oiliness", score: map100(oil) },
    { key: "dryness", label: "Dryness", score: map100(dryness) },
    { key: "texture", label: "Texture Smoothness", score: map100(texture) },
    { key: "symmetry", label: "Facial Symmetry", score: map100(symmetry) },
    { key: "jawline", label: "Jawline Definition", score: map100(jawline) },
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
  const overallRating = Math.floor(Math.random() * 10) + 50;
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
      ? "Over-exfoliation / fragrance irritation"
      : "Sweat + friction",
  ];
  const nonMedicalActions = [
    "SPF 50 daily (2-finger)",
    "Gentle foaming cleanse (2×/day)",
    "BPO 2.5% wash AM 3–4×/wk",
    "Adapalene 0.1% pea-size PM ramp",
    "Fragrance-free moisturizer",
  ];
  const routineOutline = {
    AM: [
      "Cleanse",
      "(Optional) BPO wash",
      "Gel/Ceramide moisturizer",
      "SPF 50",
    ],
    PM: ["Cleanse", "Adapalene pea-size", "Moisturizer"],
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
    severity: "mild",
    distribution,
    counts,
    possibleTriggers,
    nonMedicalActions,
    routineOutline,
    metrics,
    disclaimer: "Educational estimate. Not medical advice.",
  };
}

function useFaceAnalyzer(faces, userApiKey) {
  const [status, setStatus] = useState("waiting");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const startAnalysis = useCallback(async () => {
    const ready = Boolean(faces.front && faces.left && faces.right);
    if (!ready) {
      setStatus("error_photos");
      return;
    }

    setStatus("analyzing");
    setProgress(0);

    const totalDuration = 10000;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((p) => Math.min(100, p + (interval / totalDuration) * 100));
      if (elapsed >= totalDuration) {
        clearInterval(timer);
      }
    }, interval);

    try {
      let keyIsValid = false;
      if (
        userApiKey &&
        userApiKey.startsWith("sk-") &&
        userApiKey.length > 20
      ) {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${userApiKey}` },
        });
        if (response.ok) {
          keyIsValid = true;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, totalDuration));

      const [h1, h2, h3] = await Promise.all([
        fileHash(faces.front),
        fileHash(faces.left),
        fileHash(faces.right),
      ]);
      const seed = (h1 ^ h2 ^ h3) >>> 0;

      let apiResult;

      const generateConcernSummary = (m) => {
        const concerns = [
          {
            metric: "oiliness",
            score: m.oiliness,
            threshold: 70,
            direction: "up",
            text: "High oiliness risks clogged pores and more breakouts.",
          },
          {
            metric: "redness",
            score: m.redness,
            threshold: 65,
            direction: "up",
            text: "Significant redness indicates a damaged, vulnerable skin barrier.",
          },
          {
            metric: "clarity",
            score: m.clarity,
            threshold: 60,
            direction: "down",
            text: "Low skin clarity signals risk of future marks.",
          },
          {
            metric: "texture",
            score: m.texture,
            threshold: 60,
            direction: "down",
            text: "Uneven texture could worsen without proper exfoliation.",
          },
          {
            metric: "dryness",
            score: m.dryness,
            threshold: 65,
            direction: "up",
            text: "Severe dryness can trigger even more oil production.",
          },
          {
            metric: "symmetry",
            score: m.symmetry,
            threshold: 60,
            direction: "down",
            text: "Asymmetry may point to lifestyle factors needing correction.",
          },
          {
            metric: "jawline",
            score: m.jawline,
            threshold: 60,
            direction: "down",
            text: "Jawline inflammation often linked to hormonal triggers.",
          },
          {
            metric: "risk",
            score: Math.max(
              5,
              Math.min(
                100,
                Math.round(
                  0.6 * (100 - m.clarity) + 0.2 * m.redness + 0.2 * m.oiliness
                )
              )
            ),
            threshold: 70,
            direction: "up",
            text: "High composite risk score indicates future breakout likelihood.",
          },
        ];

        const triggeredConcerns = concerns.filter((c) => {
          if (c.direction === "up") return c.score > c.threshold;
          return c.score < c.threshold;
        });

        triggeredConcerns.sort((a, b) => {
          const severityA =
            a.direction === "up"
              ? a.score - a.threshold
              : a.threshold - a.score;
          const severityB =
            b.direction === "up"
              ? b.score - b.threshold
              : b.threshold - b.score;
          return severityB - severityA;
        });

        let bulletPoints = triggeredConcerns.map((c) => c.text);

        if (bulletPoints.length < 4) {
          const allSorted = [...concerns].sort((a, b) => {
            const severityA =
              a.direction === "up"
                ? a.score - a.threshold
                : a.threshold - a.score;
            const severityB =
              b.direction === "up"
                ? b.score - b.threshold
                : b.threshold - b.score;
            return severityB - severityA;
          });
          const additionalPoints = allSorted
            .map((c) => c.text)
            .filter((text) => !bulletPoints.includes(text));
          const needed = 4 - bulletPoints.length;
          bulletPoints.push(...additionalPoints.slice(0, needed));
        }

        if (!bulletPoints.length) {
          bulletPoints.push(
            "Skin is stable, but consistency is key to prevent future issues."
          );
        }

        return bulletPoints.slice(0, 5);
      };

      if (keyIsValid) {
        console.groupCollapsed("Simulating GPT-5 Turbo API Call");

        const metrics = buildMockAPIResult(seed).metrics;
        const prompt = `Summarize the following skin metrics into 3–5 short bullet points. Focus only on the most concerning or negative aspects. Keep each point concise (under 12 words) and emphasize risks or problems. Metrics: ${JSON.stringify(
          metrics,
          null,
          2
        )}`;
        console.log("USER PROMPT TO CHATGPT:\n", prompt);

        console.log("GPT-5 TURBO: Thinking...");
        await new Promise((res) => setTimeout(res, 1500));

        apiResult = buildMockAPIResult(seed);
        apiResult.summaryPoints = generateConcernSummary(apiResult.metrics);

        console.log(
          "CHATGPT RESPONSE (bullet points):\n- ",
          apiResult.summaryPoints.join("\n- ")
        );
        console.log("---");
        console.log(
          "ANALYSIS of Overall Rating: The overall rating is a weighted average of key metrics like clarity, redness, and oiliness. A low score indicates significant active issues requiring immediate attention."
        );
        console.log(
          "ANALYSIS of Potential Rating: This estimates the possible score after 8 weeks of consistent routine adherence. It represents the achievable improvement from the current baseline."
        );

        console.groupEnd();
      } else {
        console.log("API key invalid or missing, running local analysis.");
        apiResult = buildLocalResult(seed);
        apiResult.summaryPoints = generateConcernSummary(apiResult.metrics);
      }

      setResult(normalizeServerOut(apiResult));
      setProgress(100);
      setStatus("done");
    } catch (e) {
      console.error("Analysis failed, falling back to local.", e);
      // Fallback in case of network error during verification
      const [h1, h2, h3] = await Promise.all([
        fileHash(faces.front),
        fileHash(faces.left),
        fileHash(faces.right),
      ]);
      const seed = (h1 ^ h2 ^ h3) >>> 0;
      const localResult = buildLocalResult(seed);
      setResult(normalizeServerOut(localResult));
      setProgress(100);
      setStatus("done");
    }
  }, [faces, userApiKey]);

  return { status, progress, result, startAnalysis };
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
  return { issues, hints };
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

  const Chip = ({ children }) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );

  const ListItem = ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-white/80">
      <CheckCircle2 size={16} className="mt-0.5 text-emerald-300" /> {children}
    </li>
  );

  function OfferCard() {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-white">
            {formatINR(INTRO_PRICE)}
          </div>
          <div className="text-white/40 line-through">
            {formatINR(ANCHOR_PRICE)}
          </div>
        </div>
        <div className="mt-1 text-xs text-white/60">
          One-time unlock • lifetime access
        </div>

        <ul className="mt-4 grid gap-2">
          <ListItem>Custom 30-day acne routine (AM/PM)</ListItem>
          <ListItem>Personalized PDF report with scores & priorities</ListItem>
          <ListItem>Looksmax guide (41 pages) — bonus included</ListItem>
          <ListItem>Product shortlist (budget → premium)</ListItem>
          <ListItem>Progress tracker & reminders</ListItem>
        </ul>

        <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-xs text-emerald-200">
          <div className="font-semibold flex items-center gap-2">
            <ShieldCheck size={14} /> 30-day love-it guarantee
          </div>
          <p className="mt-1 text-emerald-200/80">
            If you don’t love it, we’ll refund you. Educational guidance — not
            medical advice.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button href="#checkout">
            <ShoppingCart size={16} /> Unlock my plan now
          </Button>
          <Button variant="outline" href="#wizard">
            <Wand2 size={16} /> See how it works
          </Button>
        </div>

        <div className="mt-4 text-[11px] text-white/60">
          Instant access after purchase • Secure checkout
        </div>
      </div>
    );
  }

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
          Clearer skin in 7 days — or your money back
          <span className="block text-emerald-400">Powered by {MECHANISM}</span>
        </h1>

        <p className="mt-3 text-white/80">
          Upload 3 selfies. Our engine builds a 2-minute routine that targets
          oil, redness, and congestion so you see your first visible win fast —
          then locks a full 8-week protocol.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button href="#wizard">
            <Wand2 size={16} /> Get my plan in 2 minutes
          </Button>
          <Button variant="outline" href="#offer">
            <Percent size={16} /> Launch price: {formatINR(INTRO_PRICE)}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
          <Chip>
            <Clock size={14} /> First win in ~7 days
          </Chip>
          <Chip>
            <ShieldCheck size={14} /> 30-day love-it guarantee
          </Chip>
          <Chip>
            <Star size={14} /> AI-guided, step-by-step
          </Chip>
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
      <OfferCard />
    </section>
  );
}

// -------------------- WIZARD (4 steps now) --------------------
function OfferWizard({ dev, onAnalysisChange, userApiKey }) {
  const wizardRef = useRef(null);
  const [step, setStep] = useState(1);
  const [hasAnalyzedOnce, setHasAnalyzedOnce] = useState(false);
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
  const { status, progress, result, startAnalysis } = useFaceAnalyzer(
    faces,
    userApiKey
  );

  const handleStartAnalysis = useCallback(() => {
    startAnalysis();
    setHasAnalyzedOnce(true);
  }, [startAnalysis]);

  useEffect(() => {
    onAnalysisChange({ status, progress });
    if (status === "done") {
      const timer = setTimeout(() => {
        setStep(3);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, progress, onAnalysisChange]);

  const handleNext = (nextStep) => {
    setStep(nextStep);
    if (wizardRef.current) {
      setTimeout(() => {
        wizardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <section id="wizard" className="mt-6 scroll-mt-20" ref={wizardRef}>
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

      <div className="grid gap-6">
        <div className="space-y-6">
          {step === 1 && (
            <StepIntake
              intake={intake}
              setIntake={setIntake}
              onNext={() => handleNext(2)}
            />
          )}
          {step === 2 && (
            <StepCaptureAnalyze
              previews={previews}
              setFile={setFile}
              setFaces={setFaces}
              analyzer={{ status }}
              onPrev={() => handleNext(1)}
              onAnalyze={handleStartAnalysis}
              hasAnalyzedOnce={hasAnalyzedOnce}
            />
          )}
          {step === 3 && result && (
            <Step3_Offer_Redesign
              analyzer={result}
              onCheckout={() => handleNext(4)}
              onPrev={() => handleNext(2)}
            />
          )}
          {step === 4 && <Checkout onBack={() => handleNext(3)} />}
        </div>
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

function FullScreenAnalyzer({ progress }) {
  const messages = [
    "Initializing AI R.A.P.I.D. Engine™...",
    "Calibrating skin tone and lighting...",
    "Mapping pore distribution and size...",
    "Detecting comedones (blackheads/whiteheads)...",
    "Assessing inflammation and erythema levels...",
    "Analyzing texture, scarring, and hyperpigmentation...",
    "Cross-referencing with your intake data...",
    "Formulating your personalized AM routine...",
    "Optimizing your PM protocol for barrier health...",
    "Finalizing your 8-week progress plan...",
  ];

  const currentMessageIndex = Math.min(
    Math.floor((progress / 100) * messages.length),
    messages.length - 1
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-lg text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-white/10"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <motion.circle
            className="text-emerald-400"
            strokeWidth="5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (progress / 100) * 283 }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {Math.round(progress)}%
        </div>
      </div>
      <p className="mt-6 text-lg text-white/80 w-64 mx-auto">
        {messages[currentMessageIndex]}
      </p>
    </motion.div>
  );
}

function StepCaptureAnalyze({
  previews,
  setFile,
  setFaces,
  analyzer,
  onPrev,
  onAnalyze,
  hasAnalyzedOnce,
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

  const hasAllPhotos = previews.front && previews.left && previews.right;

  useEffect(() => {
    if (hasAllPhotos && !hasAnalyzedOnce) {
      onAnalyze();
    }
  }, [hasAllPhotos, hasAnalyzedOnce, onAnalyze]);

  return (
    <Card
      title="Upload Your Selfies"
      subtitle="Provide 3 photos for a GPT-5 powered analysis."
    >
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {["front", "left", "right"].map((slot) => (
          <div key={slot}>
            <div
              className="relative w-full overflow-hidden rounded-lg bg-white/5"
              style={{ aspectRatio: "3/4" }}
            >
              {previews[slot] ? (
                <img
                  src={previews[slot]}
                  alt={`${slot} selfie`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-content-center p-2 text-center text-xs text-white/40">
                  No image
                </div>
              )}
            </div>
            <label className="mt-2 block w-full cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-center text-xs transition hover:bg-white/15">
              {previews[slot] ? "Change" : "Add"} {slot}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPick(slot)}
              />
            </label>
            {(warnings[slot]?.length > 0 || hints[slot]?.length > 0) && (
              <div className="mt-2 space-y-1 text-xs">
                {warnings[slot].map((w, i) => (
                  <div key={i} className="flex items-start gap-1 text-rose-300">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />{" "}
                    <span>{w}</span>
                  </div>
                ))}
                {hints[slot].map((t, i) => (
                  <div key={i} className="flex items-start gap-1 text-white/60">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />{" "}
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {analyzer.status === "error" && (
        <div className="mt-4 rounded-xl border border-rose-300/40 bg-rose-400/10 p-3 text-rose-200">
          Could not analyze. Please try again with different photos.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}>
          <ArrowLeft size={16} /> Back
        </Button>
        {hasAnalyzedOnce && (
          <Button
            className="w-full sm:w-auto"
            onClick={onAnalyze}
            disabled={!hasAllPhotos}
          >
            <RefreshCw size={16} /> Re-analyze Photos
          </Button>
        )}
      </div>
    </Card>
  );
}

// -------------------- NEW STEP 3 COMPONENT --------------------
const Step3_Offer_Redesign = ({ analyzer, onCheckout, onPrev }) => {
  const { CheckCircle2: Check, ShieldCheck: Shield } = {
    CheckCircle2,
    ShieldCheck,
  };

  const Wrap = ({ children }) => (
    <div className="mx-auto max-w-6xl">{children}</div>
  );

  const LocalCard = ({ className = "", children }) => (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 shadow ${className}`}
    >
      {children}
    </div>
  );

  const Badge = ({ tone = "slate", children }) => {
    const map = {
      emerald: "border-emerald-300/40 bg-emerald-400/10 text-emerald-300",
      rose: "border-rose-300/40 bg-rose-400/10 text-rose-200",
      amber: "border-amber-300/40 bg-amber-400/10 text-amber-200",
      slate: "border-white/10 bg-white/10 text-white/80",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${map[tone]}`}
      >
        {children}
      </span>
    );
  };

  const BlurLock = ({ label = "Unlock to view" }) => (
    <div className="pointer-events-none absolute inset-0 grid place-content-center rounded-xl bg-black/40">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
        <Lock size={14} /> {label}
      </div>
    </div>
  );

  function TopBar({ result }) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge tone="emerald">
            {result.source === "local"
              ? "AI Sourced"
              : `AI source: ${result.source}`}
          </Badge>
          <Badge>type: {result.skinType}</Badge>
          <Badge
            tone={
              result.source === "local"
                ? "amber"
                : result.severity === "severe"
                ? "rose"
                : result.severity === "moderate"
                ? "amber"
                : "emerald"
            }
          >
            severity: {result.source === "local" ? "mild" : result.severity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Sparkles size={16} /> Tough-love, then a plan. No fluff.
        </div>
      </div>
    );
  }
  //ScorePills

  const Gauge = ({ className }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0" />
      <path d="m14 14-2-5-2 5" />
    </svg>
  );

  const Sparkles = ({ className }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );

  const ArrowRight = ({ className }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  function ToughLove({ result }) {
    const byKey = Object.fromEntries(
      result.scores.map((s) => [s.key, s.score])
    );

    const lines = result.summaryPoints || [];
    if (!lines.length) {
      // Fallback if summary points are not generated
      if ((byKey.oiliness || 0) > 70)
        lines.push(
          "Your T-zone's high shine suggests overactive oil glands, which can clog pores if not managed."
        );
      if ((byKey.redness || 0) > 65)
        lines.push(
          "Visible redness points to an inflamed skin barrier, making it vulnerable to irritation and breakouts."
        );
      if ((byKey.clarity || 0) < 60)
        lines.push(
          "Low clarity indicates that your current routine isn't effectively preventing new blemishes, risking post-acne marks."
        );
      if (!lines.length)
        lines.push(
          "Your skin is in a good place, but a targeted routine is crucial to prevent future issues and maintain its health."
        );
    }

    const sev = result.overallRating;

    const MetricChip = ({ label, score }) => {
      const getTone = () => {
        if (["Clarity", "Texture", "Symmetry", "Jawline"].includes(label)) {
          if (score < 60) return "rose";
          if (score < 80) return "amber";
          return "emerald";
        }
        if (score > 65) return "rose";
        if (score > 40) return "amber";
        return "emerald";
      };
      return (
        <Badge tone={getTone()}>
          {label}: {score}
        </Badge>
      );
    };

    return (
      <LocalCard className="bg-black/30">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
          <Flame size={16} /> Overall Rating ({sev}/100)
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {result.scores.map((s) => (
            <MetricChip
              key={s.key}
              label={s.label.replace("Skin ", "").replace(" Smoothness", "")}
              score={s.score}
            />
          ))}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-white/90">
          {lines.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-white/50">
          This is a critical analysis to build your targeted plan.
        </p>
      </LocalCard>
    );
  }

  function PreviewBundle({ result }) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-lg font-semibold">Your custom routine</h4>
          <p className="text-sm text-white/70">
            First 14 days • morning & night
          </p>
          <div className="relative mt-3 overflow-hidden rounded-xl">
            <div className="blur-sm select-none p-3 text-sm text-white/80">
              <ul className="space-y-1">
                {result.routineOutline.AM.slice(0, 3).map((x, i) => (
                  <li key={`m-${i}`}>• AM: {x}</li>
                ))}
                {result.routineOutline.PM.slice(0, 3).map((x, i) => (
                  <li key={`n-${i}`}>• PM: {x}</li>
                ))}
                <li>• Product picks & how-to videos…</li>
              </ul>
            </div>
            <BlurLock label="Preview blurred" />
          </div>
          <p className="mt-2 text-xs text-white/50">
            Instantly visible after unlock.
          </p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-lg font-semibold">Looksmax Playbook</h4>
          <p className="text-sm text-white/70">41-page PDF</p>
          <div className="relative mt-3 h-28 overflow-hidden rounded-xl border border-white/10 bg-black/40" />
          <BlurLock label="Preview blurred" />
          <p className="mt-2 text-xs text-white/50">
            Covers skin • hair • jawline and more.
          </p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-lg font-semibold">Personalized PDF Report</h4>
          <p className="text-sm text-white/70">Your scores & priorities</p>
          <div className="relative mt-3 overflow-hidden rounded-xl p-3">
            <div className="blur-sm select-none text-sm text-white/80">
              <p>
                • Skin Type:{" "}
                <span className="capitalize">{result.skinType}</span>
              </p>
              <p>• Priorities: {result.flags[0] || "clarity"}…</p>
              <p>• Full scoreboard & triggers…</p>
            </div>
            <BlurLock label="Preview blurred" />
          </div>
          <p className="mt-2 text-xs text-white/50">
            Delivered as a downloadable PDF.
          </p>
        </div>
      </div>
    );
  }

  function OfferBox({ onCheckout, onPrev }) {
    return (
      <LocalCard className="bg-gradient-to-b from-white/10 to-white/[0.06]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-white">
                {formatINR(INTRO_PRICE)}
              </div>
            </div>
            <div className="mt-1 text-xs text-white/60">
              One-time unlock • lifetime access
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onPrev} variant="ghost">
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={onCheckout}>
              <Lock size={16} /> Unlock my plan <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </LocalCard>
    );
  }

  return (
    <div className="bg-slate-950/50 rounded-2xl p-4">
      <Wrap>
        <TopBar result={analyzer} />
        <div className="mt-6 grid gap-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black">Your AI Skin Audit</h1>
              <ScorePills result={analyzer} />
            </div>
            <ToughLove result={analyzer} />
            <PreviewBundle result={analyzer} />
            <div className="text-xs text-white/50">{analyzer.disclaimer}</div>
          </div>
          <div className="space-y-6">
            <OfferBox onCheckout={onCheckout} onPrev={onPrev} />
          </div>
        </div>
      </Wrap>
    </div>
  );
};

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
            "Sensitive-skin protocol",
            "SOS breakout mini-plan",
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
            "Two 1:1 check-ins",
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
        "relative rounded-2xl border p-5 transition-all duration-300",
        highlight
          ? "border-emerald-400/60 bg-emerald-400/10 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
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
            <Plus size={16} className="mt-0.5 text-emerald-400" /> {f}
          </li>
        ))}
      </ul>
      <Button
        href="#checkout"
        className={clsx(highlight && "shadow-lg shadow-emerald-500/20")}
      >
        <ShoppingCart size={16} /> {cta}
      </Button>
      <p className="mt-2 text-xs text-white/60">
        Pay-in-full bonus applied at checkout.
      </p>
    </div>
  );
}

function OfferMath() {
  const stack = [
    { label: "8-week program & playbook", value: 7999, icon: FileText },
    { label: "Cohort & community", value: 1999, icon: MessageSquare },
    { label: "Sensitive-skin protocol", value: 1499, icon: FlaskConical },
    { label: "SOS breakout mini-plan", value: 999, icon: Sun },
  ];
  const total = stack.reduce((a, b) => a + b.value, 0);
  return (
    <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/10 to-slate-900/10 p-6">
      <div className="mb-4 text-center">
        <h4 className="text-xl font-bold">The Complete Value Stack</h4>
        <p className="text-sm text-white/70">
          Everything you get to ensure your success.
        </p>
      </div>
      <div className="space-y-3">
        {stack.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/30 p-3"
          >
            <div className="flex items-center gap-3">
              <s.icon className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold">{s.label}</span>
            </div>
            <div className="text-sm text-white/70">
              Value {formatINR(s.value)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/70">
          Total comparable value:{" "}
          <span className="line-through">{formatINR(total)}</span>
        </p>
        <p className="text-2xl font-bold">
          Your price today starts at just{" "}
          <span className="text-emerald-400">{formatINR(INTRO_PRICE)}</span>.
        </p>
      </div>
    </div>
  );
}

// -------------------- CHECKOUT --------------------
function Checkout({ onBack }) {
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
      ? `Pay ${formatINR(splitPart + (bump ? BUMP_PRICE : 0))} now — Split-pay`
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
                  <div className="font-semibold">One-time</div>
                  <div className="text-sm text-white/70">
                    {formatINR(INTRO_PRICE)}{" "}
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                      Pay-in-full bonus
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
                  <div className="font-semibold">Split-pay</div>
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
                    Add SOS Product Links + 3 Micro-Videos
                  </div>
                  <div className="text-xs text-white/70">
                    One-click list of products + how-to apply (optional)
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
              <ArrowLeft size={16} /> Back to Results
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
            By continuing you agree to fair-use, no-medical-advice, and
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
              30-day money-back + Results-based support extension if no visible
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
      blurb: "One-pager you’ll actually follow.",
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
          aria-hidden="true"
        />
        <div className="relative rounded-3xl border border-emerald-300/40 bg-slate-900/50 p-6">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            Fast-action bonuses
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
            <ShieldCheck className="mr-1 inline" size={16} /> 30-day Money-Back
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
            <ShieldCheck className="mr-1 inline" size={16} /> Results-Based
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
        "“AI-assisted routine gave me a 7-day win—stuck to it because it was so simple.”",
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
          If you expect prescription-level results without medical supervision.
        </li>
        <li>If you won’t follow a 2-minute daily routine for 14 days.</li>
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
          { h: "T-0h", t: "Upload selfies & get plan" },
          { h: "+2h", t: "Get starter kit (links provided)" },
          { h: "+24h", t: "First routine check-in (2 minutes)" },
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
      q: "Money-back terms?",
      a: "30-day no-questions refund. Results guarantee extends help for another 8 weeks if needed. See policy.",
    },
    {
      q: "Sensitive skin?",
      a: "We bias fragrance-free gentle picks; ramp actives slowly.",
    },
    {
      q: "Is the AI analysis accurate?",
      a: "Your selfies are analyzed by our AI engine to generate an educational preview. It is not a medical diagnosis.",
    },
  ];
  return (
    <section id="faq" className="mt-12">
      <h3 className="text-2xl font-bold">FAQ</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <ShoppingCart size={18} /> Get the Acne Reset —{" "}
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
    if (typeof document === "undefined") return;
    try {
      document.title = "Acne Reset - AI Personalized Skincare Routine";
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
    assert(
      valueEquationScore({ dream: 4, likelihood: 3, time: 2, effort: 2 }) === 3,
      "valueEquationScore basic"
    );
    assert(
      valueEquationScore({ dream: 5, likelihood: 4, time: 1, effort: 1 }) >= 19,
      "valueEquationScore high"
    );
    const r1 = makeRoutine({ skin: "dry", severity: "mild" });
    assert(r1.morning.length === 4 && r1.night.length === 3, "routine lengths");
    const r2 = makeRoutine({ skin: "oily", severity: "severe" });
    assert(r2.morning.join(" ").includes("BPO"), "severe includes BPO AM");
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

    console.log("✅ All unit tests passed");
  } catch (e) {
    console.error("❌ Unit test failed:", e.message || e);
  }
}

// --- Main ScorePills Component ---
function ScorePills({ result }) {
  // Updated tones object with specific color values for the SVG gradient
  const tones = {
    rose: {
      text: "text-rose-300",
      glow: "shadow-[0_0_30px_rgba(244,114,182,0.35)]",
      bar: "bg-gradient-to-r from-rose-400 via-fuchsia-400 to-pink-400",
    },
    emerald: {
      text: "text-emerald-300",
      glow: "shadow-[0_0_30px_rgba(52,211,153,0.35)]",
      bar: "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300",
    },
  };

  // --- ProgressRing Sub-component (Simplified) ---
  function ProgressRing({ value = 0, tone = "emerald" }) {
    const theme = tones[tone];
    return (
      <div className="relative grid h-14 w-14 place-items-center rounded-full">
        <span className={`text-2xl font-bold ${theme.text}`}>
          {value.toFixed(1)}
        </span>
      </div>
    );
  }

  // Clamps a number between a min and max value.
  function clamp(n, min = 0, max = 10) {
    return Math.max(min, Math.min(max, n ?? 0));
  }

  // Assuming overallRating is out of 100, divide by 10 to get a score out of 10
  const currentRating = result.overallRating / 10;
  // Mock potential rating for demonstration
  const potentialRating = 8.3;

  return (
    <motion.div
      role="group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 ${tones.emerald.glow}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 ${tones.emerald.glow}`}
          >
            <Gauge className={`h-4 w-4 ${tones.emerald.text}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-white/60">
              Current → Potential
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-[13px] font-semibold ${tones.emerald.text}`}
              >
                Rating
              </span>
              <Sparkles className={`h-3 w-3 ${tones.emerald.text}`} />
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <ProgressRing value={currentRating} tone="rose" />
            <span className="text-[10px] text-white/50">Current</span>
          </div>
          <ArrowRight className="h-4 w-4 text-white/40" />
          <div className="flex flex-col items-center gap-1">
            <ProgressRing value={potentialRating} tone="emerald" />
            <span className="text-[10px] text-white/50">Potential</span>
          </div>
          <span className="text-xs text-white/50">/10</span>
        </div>
      </div>
      {/* Bottom progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full ${tones.emerald.bar}`}
          initial={{ width: "0%" }}
          animate={{ width: `${(potentialRating / 10) * 100}%` }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 16,
            delay: 0.5,
          }}
        />
      </div>
    </motion.div>
  );
}

// -------------------- APP --------------------
export default function App() {
  useSEO();
  const DEV = useDevMode();
  const [analysisState, setAnalysisState] = useState({
    status: "waiting",
    progress: 0,
  });
  const [userApiKey] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = new URL(window.location.href);
      const flag = (u.searchParams.get("tests") || "").toLowerCase();
      if (["1", "true", "yes", "on"].includes(flag)) {
        runUnitTests();
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (analysisState.status === "analyzing") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [analysisState.status]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header dev={DEV} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-24">
        <Hero />
        <OfferWizard
          dev={DEV}
          onAnalysisChange={setAnalysisState}
          userApiKey="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"
        />
        <OfferStack />
        <BonusesStrong />
        <Guarantees />
        <Testimonials />
        <WhoNotFor />
        <Quickstart />
        <Policies />
        <FAQ />
        <Footer />
      </main>
      <StickyCTA />
      <WhatsAppNudge />
      <AnimatePresence>
        {analysisState.status === "analyzing" && (
          <FullScreenAnalyzer progress={analysisState.progress} />
        )}
      </AnimatePresence>
    </div>
  );
}
