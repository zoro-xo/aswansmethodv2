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

// -------------------- CONFIG --------------------
const CHECKOUT_URL = "https://payments.cashfree.com/forms/acnereset"; // replace with real checkout
const CHECKOUT_SPLIT_URL = "https://payments.cashfree.com/forms/acneresetsplit"; // replace
const CHECKOUT_URL_PRO = "https://payments.cashfree.com/forms/acneresetpro"; // replace with real checkout
const CHECKOUT_URL_VIP = "https://payments.cashfree.com/forms/acneresetvip"; // replace with real checkout
const BUMP_PRICE = 299;
const POLICY = {
  guarantee: "/terms",
  scarcity: "/policy",
  privacy: "/privacy",
};
const DEFAULT_INTRO_PRICE = 749;
function getIntroPrice() {
  if (typeof window === "undefined") return DEFAULT_INTRO_PRICE;
  const url = new URL(window.location.href);
  const p = url.searchParams.get("price");
  if (p && /^\d+$/.test(p)) return Math.max(199, parseInt(p, 10));
  return DEFAULT_INTRO_PRICE;
}
const INTRO_PRICE = getIntroPrice();
const LIST_PRICE = 999;
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

// -------------------- WIZARD (4 steps now) --------------------
function OfferWizard({ onAnalysisChange, userApiKey }) {
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

  function ToughLove({ result }) {
    const byKey = Object.fromEntries(
      result.scores.map((s) => [s.key, s.score])
    );

    const lines = result.summaryPoints || [];
    if (!lines.length) {
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
          <h4 className="text-lg font-semibold">
            Your custom AI acne-skincare routine
          </h4>
          <p className="text-sm text-white/70">
            Acne - Skincare • Product links included
          </p>
          <div className="relative mt-3 h-45 overflow-hidden rounded-xl">
            <img
              src={"/images/routine.png"}
              alt="Looksmax Playbook Preview"
              className="w-full h-full object-cover"
            />
            <BlurLock label="Join to unlock" />
          </div>
          <p className="mt-2 text-xs text-white/50">
            Instantly accessable after unlock inside the community.
          </p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-lg font-semibold">Full Looksmaxxing Playbook</h4>
          <p className="text-sm text-white/70">41-page PDF</p>
          <div className="relative mt-3 h-45 overflow-hidden rounded-xl">
            <img
              src={"/images/pdfpreview.png"}
              alt="Looksmax Playbook Preview"
              className="w-full h-full object-cover"
            />
            <BlurLock label="Join to unlock" />
          </div>
          <p className="mt-2 text-xs text-white/50">Downloadable pdf.</p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-lg font-semibold">Full courses with Videos</h4>
          <p className="text-sm text-white/70">
            For Acne, Skincare & many more • Product links included
          </p>
          <div className="relative mt-3 h-45 overflow-hidden rounded-xl">
            <img
              src={"/images/courses.png"}
              alt="Looksmax Playbook Preview"
              className="w-full h-full object-cover"
            />
            <BlurLock label="Join to unlock" />
          </div>
          <p className="mt-2 text-xs text-white/50">
            Instantly accessable after unlock.
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
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
    </div>
  );
};

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
                  <div className="font-semibold">
                    Pay Half now & Half after the result
                  </div>
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
          <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
            <ShieldCheck size={14} /> By continuing you agree to our
            <a className="underline" href={POLICY.guarantee}>
              Terms & Conditions
            </a>
            <a className="underline" href={POLICY.scarcity}>
              & Policy
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <h4 className="text-lg font-semibold">You're getting</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>• Full Acne-Reset course</li>
            <li>• Personalized product links</li>
            <li>• Full Looksmaxxing Guide & PDF</li>
            <li>• Exclusive Skincare Video Courses</li>
            <li>• Exclusive Haircare Videos Courses</li>
            <li>• Bonus 1: Full Workout Plan</li>
            <li>• Bonus 2: Full Diet Plan</li>
            <li>• Bonus 3: Height increment guide</li>
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

// --- Main ScorePills Component ---
function ScorePills({ result }) {
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

  const currentRating = result.overallRating / 10;
  const potentialRating = result.potentialRating / 10;

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

function PlanCard({
  name,
  price,
  badge,
  features,
  cta,
  highlight,
  checkoutUrl,
}) {
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
        href={checkoutUrl}
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
            "Full Acne-Reset course",
            "Personalized product links",
            "Full Looksmaxxing Guide & PDF",
            "Exclusive Skincare Video Courses",
            "Exclusive Haircare Videos Courses",
            "Bonus 1: Full Workout Plan",
            "Bonus 2: Full Diet Plan",
            "Bonus 3: Height increment guide",
            "Weekly adjustments (8 weeks)",
            "Community access",
            "Double guarantee",
          ]}
          cta="Join Starter"
          checkoutUrl={CHECKOUT_URL} // <-- EDIT THIS LINE
        />
        <PlanCard
          name="Pro"
          price={INTRO_PRICE + 350}
          badge="Most popular"
          features={[
            "Everything in Starter",
            "1:1 personal call (15m)",
            "Video explaination included",
            "Custom looksmaxxing routine",
          ]}
          cta="Join Pro"
          highlight
          checkoutUrl={CHECKOUT_URL_PRO} // <-- EDIT THIS LINE
        />
        <PlanCard
          name="VIP"
          price={1999}
          badge="Premium"
          features={[
            "Everything in Pro",
            "Two 1:1 check-ins",
            "WhatsApp priority line",
            "Custom glow-up routine",
            "Product replacements guidance",
          ]}
          cta="Join VIP"
          checkoutUrl={CHECKOUT_URL_VIP} // <-- EDIT THIS LINE
        />
      </div>
    </section>
  );
}

// -------------------- APP --------------------
export default function RoutineEngine() {
  const [analysisState, setAnalysisState] = useState({
    status: "waiting",
    progress: 0,
  });
  const [userApiKey] = useState("");

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4">
      <main className="mx-auto max-w-6xl">
        <OfferWizard
          onAnalysisChange={setAnalysisState}
          userApiKey={userApiKey}
        />
        {/* <OfferStack /> */}
      </main>
      <AnimatePresence>
        {analysisState.status === "analyzing" && (
          <FullScreenAnalyzer progress={analysisState.progress} />
        )}
      </AnimatePresence>
    </div>
  );
}
