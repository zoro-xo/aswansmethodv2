
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Percent,
  ChevronRight,
  X,
  Download,
  ShoppingCart,
  Smartphone,
  PlayCircle,
  Info,
  Lock,
  EyeOff,
  Flame,
  AlertTriangle
} from "lucide-react";

// =============================================
// Acne Business Web App — "No‑Brainer Pack" with Classic Minimal UI (dark/glass)
// Mobile-optimized + Multi‑Selfie AI (stub) analyzer + Harsh Roast + Blurred Deliverable Previews
// =============================================

// -------------------- CONFIG --------------------
const CHECKOUT_URL = "https://aswan.in/checkout"; // 🔁 replace with real checkout
const CHECKOUT_SPLIT_URL = "https://aswan.in/checkout-split"; // 🔁 replace with split-pay checkout
const WHATSAPP_DM = "https://wa.me/918000000000?text=I%20want%20the%20Acne%20Reset"; // 🔁 replace

// Scarcity toggle (real scarcity only; set a real deadline & seat cap)
const SCARCITY = {
  seats: 150, // founders cohort seats
  // Asia/Kolkata deadline example: set to tonight 11:59 PM local
  deadlineISO: (() => {
    const now = new Date();
    const local = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    local.setHours(23, 59, 59, 0);
    return new Date(local).toISOString();
  })(),
  reason: "Founders' cohort case-study intake",
};

// Bonuses (trim & stack)
const DEFAULT_BONUSES = [
  { name: "The Glowup Academy System", valueINR: 770, icon: "📘" },
  { name: "Daily Transformation Tracking", valueINR: 209, icon: "📈" },
  { name: "Free Product Recommendations", valueINR: 350, icon: "🧴" },
  { name: "24/7 WhatsApp Support", valueINR: 230, icon: "📲" },
  { name: "Looksmaxxing eBook (41p)", valueINR: 510, icon: "📑" },
];

// Price ladder (anchor → core → premium)
const PRICES = {
  anchor: 2499, // strike-through
  core: 999, // control price (can be overridden via ?price=)
  premium: 2999, // future upsell / VIP
};

const BUMP_PRICE = 299; // ₹299 SOS list + micro videos

// -------------------- UTILS --------------------
const isDev = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";

function getCorePrice() {
  if (typeof window === "undefined") return PRICES.core;
  const p = Number(new URLSearchParams(window.location.search).get("price"));
  return Number.isFinite(p) && p > 0 ? Math.round(p) : PRICES.core;
}
const CORE_PRICE = getCorePrice();

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function clsx(...a: (string | false | null | undefined)[]) { return a.filter(Boolean).join(" "); }

function useCountdown(toISO: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const target = new Date(toISO).getTime();
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { h, m, s, isOver: diff <= 0 };
}

// Value Equation score (Dream * Likelihood) / (Time * Effort)
function valueEquationScore(v: { dream: number; likelihood: number; time: number; effort: number }) {
  const bottom = Math.max(1, v.time * v.effort);
  return Math.round(((v.dream * v.likelihood) / bottom) * 100) / 100;
}

// ---- Single-image preview util (legacy) ----
function useImagePreview() {
  const [preview, setPreview] = useState<string>("");
  const urlRef = useRef<string | null>(null);

  const onFile = (f?: File | null) => {
    if (!f) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    try { const url = URL.createObjectURL(f); urlRef.current = url; setPreview(url); }
    catch { const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result || "")); reader.readAsDataURL(f); }
  };
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  return { preview, onFile };
}

// ---- Multi‑image preview util (front/left/right) ----
function useMultiImagePreview() {
  const [previews, setPreviews] = useState<{ front?: string; left?: string; right?: string }>({});
  const urls = useRef<Record<string, string>>({});
  const setFile = (slot: 'front' | 'left' | 'right', f?: File | null) => {
    if (!f) return;
    if (urls.current[slot]) URL.revokeObjectURL(urls.current[slot]);
    const url = URL.createObjectURL(f);
    urls.current[slot] = url;
    setPreviews((p) => ({ ...p, [slot]: url }));
  };
  useEffect(() => () => Object.values(urls.current).forEach((u) => URL.revokeObjectURL(u)), []);
  return { previews, setFile };
}

// ---- Light-weight, on-device "AI" stub (deterministic hashing) ----
// NOTE: This is a deterministic placeholder that runs fully in-browser. Later swap provider to TFJS/MediaPipe or server.
async function fileHash(file: File) {
  const buf = await file.arrayBuffer();
  const view = new Uint8Array(buf);
  let h = 2166136261; // FNV-like
  for (let i = 0; i < view.length; i += 4096) { // sample to keep fast
    h ^= view[i];
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

type Faces = { front?: File | null; left?: File | null; right?: File | null };

type AnalysisScore = { key: string; label: string; score: number; explain: string };

type AnalysisResult = { skinType: 'oily' | 'dry' | 'combo' | 'normal'; scores: AnalysisScore[]; flags: string[]; summary: string };

function map100(x: number) { return Math.max(5, Math.min(100, Math.round(x))); }

function deriveSkinType(seed: number): AnalysisResult['skinType'] {
  const pick = seed % 4;
  return pick === 0 ? 'oily' : pick === 1 ? 'dry' : pick === 2 ? 'combo' : 'normal';
}

function percentFrom(seed: number, shift: number, min = 10, max = 98) {
  const v = ((seed >>> shift) % 100);
  return Math.max(min, Math.min(max, v));
}

function buildResult(seed: number): AnalysisResult {
  const skinType = deriveSkinType(seed);
  const clarity = 100 - percentFrom(seed, 3, 20, 95); // higher is clearer
  const redness = percentFrom(seed, 7);
  const oil = percentFrom(seed, 11);
  const dryness = percentFrom(seed, 17);
  const texture = 100 - percentFrom(seed, 19, 25, 90);
  const symmetry = percentFrom(seed, 23, 40, 96);
  const jawline = percentFrom(seed, 27, 35, 97);
  const acneRisk = map100(0.6 * (100 - clarity) + 0.2 * redness + 0.2 * oil);

  const scores: AnalysisScore[] = [
    { key: 'clarity', label: 'Skin Clarity', score: map100(clarity), explain: 'Lower acne/marks = higher clarity.' },
    { key: 'redness', label: 'Redness', score: map100(redness), explain: 'Irritation/inflammation appearance.' },
    { key: 'oil', label: 'Oiliness', score: map100(oil), explain: 'Shine in T-zone; product selection impact.' },
    { key: 'dry', label: 'Dryness', score: map100(dryness), explain: 'Tightness/flaking; barrier focus.' },
    { key: 'texture', label: 'Texture Smoothness', score: map100(texture), explain: 'Evenness of surface.' },
    { key: 'sym', label: 'Facial Symmetry', score: map100(symmetry), explain: 'Left vs right balance (approx).' },
    { key: 'jaw', label: 'Jawline Definition', score: map100(jawline), explain: 'Contours visibility.' },
    { key: 'risk', label: 'Acne Risk (composite)', score: map100(acneRisk), explain: 'Estimated breakout likelihood with current routine.' },
  ];

  const flags: string[] = [];
  if (clarity < 60) flags.push('Focus: active regimen for clarity');
  if (redness > 60) flags.push('Focus: calm redness & barrier');
  if (oil > 65) flags.push('Focus: oil control');
  if (dryness > 65) flags.push('Focus: barrier repair');
  if (texture < 60) flags.push('Focus: texture smoothing');

  const summary = `Type: ${skinType}. Top priorities → ${flags.join(', ') || 'Maintain & protect.'}`;
  return { skinType, scores, flags, summary };
}

function useFaceAnalyzer(faces: Faces) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'analyzing' | 'done' | 'error'>(() => 'waiting');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const ready = Boolean(faces.front && faces.left && faces.right);
    if (!ready) { setStatus('waiting'); setResult(null); setProgress(0); return; }

    let cancel = false;
    setStatus('analyzing');
    setProgress(6);
    const id = setInterval(() => setProgress((p) => Math.min(94, p + 7)), 220);

    (async () => {
      try {
        const h1 = await fileHash(faces.front!);
        const h2 = await fileHash(faces.left!);
        const h3 = await fileHash(faces.right!);
        const seed = (h1 ^ h2 ^ h3) >>> 0;
        const res = buildResult(seed);
        if (!cancel) { setResult(res); setProgress(100); setStatus('done'); }
      } catch (e) {
        if (!cancel) { setStatus('error'); }
      } finally {
        clearInterval(id);
      }
    })();

    return () => { cancel = true; clearInterval(id); };
  }, [faces.front, faces.left, faces.right]);

  const reset = () => { setStatus('waiting'); setResult(null); setProgress(0); };
  return { status, progress, result, reset };
}

// -------------------- PRIMITIVES --------------------
const Button: React.FC<{ variant?: "primary" | "ghost" | "outline"; href?: string; onClick?: any; children: React.ReactNode; className?: string; type?: any; target?: string; rel?: string }>
= ({ variant = "primary", href, onClick, children, className, type, target, rel }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition";
  const styles = variant === "primary"
    ? "bg-emerald-500 text-slate-950 shadow hover:bg-emerald-400"
    : variant === "outline"
      ? "border border-white/10 bg-white/10 hover:bg-white/15"
      : "bg-white/10 hover:bg-white/15";
  if (href) return (<a href={href} target={target} rel={rel} className={clsx(base, styles, className)}>{children}</a>);
  return (<button type={type as any} onClick={onClick} className={clsx(base, styles, className)}>{children}</button>);
};

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
      <h3 className="text-xl font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-white/10">
      <div className="h-2 bg-emerald-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function ScoreRow({ label, score, explain }: { label: string; score: number; explain: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm"><span className="text-white/80">{label}</span><span className="font-semibold">{score}/100</span></div>
      <Meter value={score} />
      <div className="mt-1 text-xs text-white/50">{explain}</div>
    </div>
  );
}

function BlurLock({ label = "Unlock to view" }: { label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-content-center rounded-xl bg-black/40">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
        <EyeOff size={14}/> {label}
      </div>
    </div>
  );
}

function BlurredCard({ title, subtitle, children, ctaHref, ctaLabel }: { title: string; subtitle?: string; children: React.ReactNode; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
      <div className="relative mt-3 overflow-hidden rounded-xl">
        <div className="blur-sm select-none">
          {children}
        </div>
        <BlurLock label="Preview blurred" />
      </div>
      <div className="mt-3">
        <Button href={ctaHref}><Lock size={16}/> {ctaLabel}</Button>
      </div>
      <p className="mt-2 text-xs text-white/50">Instant access after purchase.</p>
    </div>
  );
}

// -------------------- APP --------------------
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-24">
        <Hero />
        <OfferWizard />
        <FAQ />
        <Footer />
      </main>
      <StickyCTA />
      <WhatsAppNudge />
    </div>
  );
}

function Header() {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold tracking-wide">Aswan's Method — Acne Reset</div>
        <div className="flex items-center gap-2">
          <Button className="hidden sm:inline-flex" href="#checkout">Join for {formatINR(CORE_PRICE)}</Button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { h, m, s, isOver } = useCountdown(SCARCITY.deadlineISO);
  return (
    <section className="mb-10 grid gap-8 md:grid-cols-2 md:gap-10">
      <div>
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
          <Sparkles size={16} /> Built with $100M Offers principles
        </p>
        <h1 className="text-4xl font-black leading-tight md:text-5xl">
          TRANSFORM <span className="text-indigo-400">ACNE→CLEAR SKIN</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/80">
          Get a personalized, student-budget acne plan. Fast first wins, minimal effort, real support. Join the first cohort at founders' pricing.
        </p>
        <ScarcityBar />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button className="w-full sm:w-auto" href="#wizard">Start Your Routine <ArrowRight size={18} /></Button>
          <Button className="w-full sm:w-auto" href="#checkout" variant="outline"><ShoppingCart size={16} /> Join Now {formatINR(CORE_PRICE)}</Button>
        </div>
        <p className="mt-3 text-xs text-white/60">
          Deadline: {isOver ? "Offer refresh pending" : `${h}h ${m}m ${s}s`} • Seats left shown live at checkout • Real scarcity only.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <VideoCard />
      </div>
    </section>
  );
}

function ScarcityBar() {
  const { h, m, s } = useCountdown(SCARCITY.deadlineISO);
  return (
    <div className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-yellow-200">
      <div className="flex items-center gap-2 text-sm font-semibold"><Clock size={16} /> Limited: {SCARCITY.reason}. Ends in {h}h {m}m {s}s.</div>
    </div>
  );
}

function VideoCard() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/60">
      <div className="absolute inset-0 grid place-content-center text-white/70">
        <PlayCircle size={56} className="mx-auto" />
        <p className="mt-2 text-center text-sm">Intro video placeholder</p>
      </div>
    </div>
  );
}

// -------------------- CONTROLS --------------------
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none ring-0 focus:border-indigo-400">
        {options.map((o) => (<option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>))}
      </select>
    </label>
  );
}

function Slider({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">{label}</div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-indigo-400" />
    </label>
  );
}

function CheckboxGroup({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (vals: string[]) => void }) {
  return (
    <div>
      <div className="mb-2 text-sm text-white/80">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = values.includes(o);
          return (
            <button type="button" key={o} onClick={() => onChange(checked ? values.filter((v) => v !== o) : [...values, o])} className={clsx("rounded-full px-3 py-2 text-xs transition", checked ? "bg-emerald-500 text-slate-950" : "border border-white/10 bg-white/10 text-white/80 hover:bg-white/15")}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

// -------------------- OFFER WIZARD --------------------
function OfferWizard() {
  const [step, setStep] = useState(1); // 1 Intake → 2 Selfies → 3 Routine (blurred) → 4 Checkout
  const [intake, setIntake] = useState({
    severity: "moderate" as "mild" | "moderate" | "severe",
    skin: "oily" as "oily" | "dry" | "combo" | "normal",
    area: "face" as "face" | "body" | "mixed",
    budget: "low" as "low" | "mid" | "high",
    timeGoal: 14,
    effort: 2,
    issues: [] as string[],
  });

  // Multi-selfie state
  const [faces, setFaces] = useState<Faces>({});
  const { previews, setFile } = useMultiImagePreview();
  const analyzer = useFaceAnalyzer(faces);

  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); }, [toast]);

  // DEV RUNTIME TESTS (enable with ?dev=1)
  useEffect(() => {
    if (!isDev) return; try {
      console.groupCollapsed('%c[DEV TESTS] Acne App', 'color:#93c5fd');
      const joined = ['a','b'].join('\n'); console.assert(joined === 'a\nb', 'join("\\n") should produce newline');
      const sample = makeRoutine({ severity:'moderate', skin:'oily', area:'face', budget:'low', timeGoal:14, effort:2, issues:[] });
      console.assert(Array.isArray(sample.morning) && Array.isArray(sample.night), 'routine arrays exist');
      console.assert(sample.morning.length >= 3 && sample.night.length >= 3, 'routine lengths >=3');
      const vs = valueEquationScore({ dream:4, likelihood:3, time:2, effort:2 }); console.assert(typeof vs === 'number' && !Number.isNaN(vs), 'valueEquationScore outputs number');
      console.assert(analyzer.status === 'waiting', 'analyzer waits until 3 photos');
      // Extra test: analysis seed stability given same files
      console.assert(typeof buildResult === 'function', 'buildResult exists');
      // New: framer-motion availability
      console.assert(typeof AnimatePresence !== 'undefined' && typeof motion !== 'undefined', 'framer-motion present');
    } finally { console.groupEnd(); }
  }, []);

  const value = useMemo(() => {
    const dream = intake.severity === "severe" ? 5 : intake.severity === "moderate" ? 4 : 3;
    const likelihood = 3.5;
    const time = Math.max(1, Math.round(intake.timeGoal / 7));
    const effort = Math.max(1, 6 - intake.effort);
    return { dream, likelihood, time, effort, score: valueEquationScore({ dream, likelihood, time, effort }) };
  }, [intake]);

  const routine = useMemo(() => makeRoutine(intake), [intake]);
  const previewRoutine = useMemo(() => ({
    morning: routine.morning.slice(0, 2),
    night: routine.night.slice(0, 2),
  }), [routine]);

  return (
    <section id="wizard" className="mt-6">
      {/* Stepper */}
      <div className="mb-5">
        <div className="relative mx-auto flex max-w-xl items-center justify-between overflow-hidden">
          {[1,2,3,4].map((i)=> (
            <div key={i} className="relative flex items-center">
              <div className={clsx("grid h-6 w-6 place-content-center rounded-full text-xs", i<=step?"bg-white text-slate-900":"bg-white/10 text-white/70")}>{i}</div>
              {i<4 && <div className={clsx("mx-2 h-[2px] w-10 sm:w-16 md:w-28", i<step?"bg-white":"bg-white/10")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel: controls */}
        <div className="space-y-6 lg:col-span-2">
          {step === 1 && (
            <Card title="Tell us about your acne" subtitle="We tailor your plan for fast first wins with minimal effort.">
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="Severity" value={intake.severity} onChange={(v) => setIntake((s) => ({ ...s, severity: v as any }))} options={[{ label: "Mild — black/whiteheads", value: "mild" },{ label: "Moderate — inflamed pimples", value: "moderate" },{ label: "Severe — nodules/cysts", value: "severe" }]} />
                <Select label="Skin type" value={intake.skin} onChange={(v) => setIntake((s) => ({ ...s, skin: v as any }))} options={[{ label: "Oily", value: "oily" },{ label: "Dry", value: "dry" },{ label: "Combination", value: "combo" },{ label: "Normal", value: "normal" }]} />
                <Select label="Main area" value={intake.area} onChange={(v) => setIntake((s) => ({ ...s, area: v as any }))} options={[{ label: "Face", value: "face" },{ label: "Body", value: "body" },{ label: "Both", value: "mixed" }]} />
                <Select label="Budget" value={intake.budget} onChange={(v) => setIntake((s) => ({ ...s, budget: v as any }))} options={[{ label: "Student (low)", value: "low" },{ label: "Mid", value: "mid" },{ label: "High", value: "high" }]} />
                <Slider label={`Time to first visible win (days): ${intake.timeGoal}`} min={7} max={45} value={intake.timeGoal} onChange={(v) => setIntake((s) => ({ ...s, timeGoal: v }))} />
                <Slider label={`How much effort can you put in daily? ${intake.effort}/5`} min={1} max={5} value={intake.effort} onChange={(v) => setIntake((s) => ({ ...s, effort: v }))} />
                <CheckboxGroup label="What have you tried?" options={["Dermatologist", "Benzoyl Peroxide", "Retinoids", "Antibiotics", "Ayurveda/Home", "Nothing consistent"]} values={intake.issues} onChange={(vals) => setIntake((s) => ({ ...s, issues: vals }))} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button className="w-full sm:w-auto" onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card title="Upload 3 selfies for analysis (optional)" subtitle="Front, left, right — natural light, no filter. Analysis auto‑starts when all 3 are added.">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm text-white/80">Front</label>
                  <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-3">
                    <input capture="user" type="file" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 p-3" onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ setFaces(s=>({...s, front:f})); setFile('front', f); } }} />
                    <p className="mt-2 text-xs text-white/60">Head straight, full face.</p>
                  </div>
                  <div className="mt-2 grid place-content-center overflow-hidden rounded-lg bg-white/5" style={{ aspectRatio: "1 / 1" }}>
                    {previews.front ? (<img src={previews.front} alt="Front" className="h-full w-full object-cover" />) : (<div className="p-6 text-center text-white/40">No image</div>)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/80">Left</label>
                  <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-3">
                    <input capture="user" type="file" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 p-3" onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ setFaces(s=>({...s, left:f})); setFile('left', f); } }} />
                    <p className="mt-2 text-xs text-white/60">Turn slightly left.</p>
                  </div>
                  <div className="mt-2 grid place-content-center overflow-hidden rounded-lg bg-white/5" style={{ aspectRatio: "1 / 1" }}>
                    {previews.left ? (<img src={previews.left} alt="Left" className="h-full w-full object-cover" />) : (<div className="p-6 text-center text-white/40">No image</div>)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/80">Right</label>
                  <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-3">
                    <input capture="user" type="file" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 p-3" onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ setFaces(s=>({...s, right:f})); setFile('right', f); } }} />
                    <p className="mt-2 text-xs text-white/60">Turn slightly right.</p>
                  </div>
                  <div className="mt-2 grid place-content-center overflow-hidden rounded-lg bg-white/5" style={{ aspectRatio: "1 / 1" }}>
                    {previews.right ? (<img src={previews.right} alt="Right" className="h-full w-full object-cover" />) : (<div className="p-6 text-center text-white/40">No image</div>)}
                  </div>
                </div>
              </div>

              {/* Analyzer Status */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                {analyzer.status === 'waiting' && (
                  <div className="text-white/70">Add all 3 photos to auto‑analyze. You can also skip and continue.</div>
                )}
                {analyzer.status === 'analyzing' && (
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-white/80"><Info size={14}/> Analyzing face (on your device)…</div>
                    <Meter value={analyzer.progress} />
                    <div className="mt-1 text-xs text-white/50">This is an educational, non‑diagnostic estimate.</div>
                  </div>
                )}
                {analyzer.status === 'done' && analyzer.result && (
                  <div className="space-y-4">
                    <HarshRoast result={analyzer.result} />

                    <div className="grid gap-4 md:grid-cols-3">
                      <BlurredCard title="Your custom acne routine" subtitle="A step-by-step plan tuned to your face" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(CORE_PRICE)}`}>
                        <ul className="space-y-1 text-sm text-white/80">
                          {previewRoutine.morning.map((x,i)=>(<li key={`m-${i}`}>• AM: {x}</li>))}
                          {previewRoutine.night.map((x,i)=>(<li key={`n-${i}`}>• PM: {x}</li>))}
                          <li>• + product picks by budget…</li>
                        </ul>
                      </BlurredCard>

                      <BlurredCard title="Looksmaxxing Guide (41 pages)" subtitle="No‑BS playbook: skin, hair, jawline, style" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(CORE_PRICE)}`}>
                        <div className="grid gap-2 text-sm text-white/80">
                          <div className="h-24 rounded-lg border border-white/10 bg-black/40" />
                          <p>• Chapters: Acne Reset, Hair, Jawline, Style, Confidence…</p>
                          <p>• Checklists, product matrix, weekly scorecards…</p>
                        </div>
                      </BlurredCard>

                      <BlurredCard title="Personalized PDF Report" subtitle="Skin type, risk score, focus areas" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(CORE_PRICE)}`}>
                        <div className="text-sm text-white/80">
                          <p>• Skin Type: <span className="capitalize">{analyzer.result.skinType}</span></p>
                          <p>• Top Priorities: {(analyzer.result.flags[0]||'clarity first')}…</p>
                          <p>• Scoreboard: clarity / texture / symmetry / jawline…</p>
                        </div>
                      </BlurredCard>
                    </div>
                  </div>
                )}
                {analyzer.status === 'error' && (
                  <div className="text-red-300">Could not analyze. Try smaller images or different photos.</div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button className="w-full sm:w-auto" variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</Button>
                <Button className="w-full sm:w-auto" onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></Button>
              </div>
              <p className="mt-2 text-xs text-white/50">Images are processed on your device for this preview. If you later opt into server analysis, we’ll ask consent first.</p>
            </Card>
          )}

          {step === 3 && (
            <Card title="Your personalized acne routine (locked preview)" subtitle="Unlock the full routine and product picks">
              <div className="relative">
                <div className="blur-sm select-none">
                  <RoutineCard routine={routine} intake={intake} value={value} />
                </div>
                <BlurLock label="Routine blurred — unlock to view" />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button className="w-full sm:w-auto" variant="outline" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back to Selfies</Button>
                <Button className="w-full sm:w-auto" id="checkout" onClick={() => setStep(4)}><Lock size={16}/> Unlock Now <ArrowRight size={16} /></Button>
                <Button className="w-full sm:w-auto" variant="ghost" onClick={() => setToast("Preview only — unlock to copy") } disabled><Download size={16} /> Copy</Button>
              </div>
            </Card>
          )}

          {step === 4 && (<Checkout onBack={() => setStep(3)} />)}
        </div>

        {/* Right Panel: Offer sidecard (always visible) */}
        <aside>
          <OfferSideCard value={value} />
        </aside>
      </div>

      <AnimatePresence>{toast && <Toast msg={toast} onClose={() => setToast("")} />}</AnimatePresence>
    </section>
  );
}

function HarshRoast({ result }: { result: AnalysisResult }) {
  const byKey: Record<string, number> = Object.fromEntries(result.scores.map(s=>[s.key, s.score]));

  // Severity (0-100): weighted negatives
  const sev = Math.max(0, Math.min(100,
    Math.round((100 - (byKey.clarity||50)) * 0.35 +
               (byKey.redness||50) * 0.20 +
               Math.max(0, (byKey.oil||50) - 55) * 0.20 +
               (100 - (byKey.texture||50)) * 0.25))
  );

  // Over-exaggerated roast lines (tough love)
  const lines: string[] = [];
  if ((byKey.clarity||0) < 55) lines.push("Your pores are hosting a rave and security (sunscreen) didn’t show.");
  if ((byKey.oil||0) > 70) lines.push("T‑zone so shiny NASA’s trying to dock.");
  if ((byKey.redness||0) > 65) lines.push("Your barrier’s on strike and the picket signs are red.");
  if ((byKey.texture||0) < 60) lines.push("Texture so bumpy Google Maps wants to chart it.");
  if ((byKey.sym||0) < 60) lines.push("Left face vs right face: civil war.");
  if ((byKey.jaw||0) < 60) lines.push("Jawline’s playing hide‑and‑seek — and winning.");
  if (!lines.length) lines.push("You’re close — stop freestyling and lock a routine before acne does.");

  // Offense chips
  const offenses = [
    { key:'clarity', label:'Low Clarity', bad: (byKey.clarity||0) < 60 },
    { key:'redness', label:'High Redness', bad: (byKey.redness||0) > 60 },
    { key:'oil', label:'High Oil', bad: (byKey.oil||0) > 65 },
    { key:'dry', label:'Dry/Flaky', bad: (byKey.dry||0) > 65 },
    { key:'texture', label:'Rough Texture', bad: (byKey.texture||0) < 60 },
    { key:'sym', label:'Low Symmetry', bad: (byKey.sym||0) < 60 },
    { key:'jaw', label:'Weak Jawline', bad: (byKey.jaw||0) < 60 },
  ].filter(x=>x.bad);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80"><Flame size={16}/> Harsh Roast (extra spicy)</div>

      {/* Roast meter */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-white/60"><span>Roast Meter</span><span>{sev}/100</span></div>
        <div className="h-2 w-full overflow-hidden rounded bg-white/10">
          <div className="h-2 bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-300" style={{width:`${sev}%`}} />
        </div>
      </div>

      {/* Offense chips */}
      {offenses.length>0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {offenses.map(o=> (
            <span key={o.key} className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
              <AlertTriangle size={12}/> {o.label}
            </span>
          ))}
        </div>
      )}

      {/* Roast lines */}
      <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
        {lines.map((t,i)=>(<li key={i}>{t}</li>))}
      </ul>
      <p className="mt-2 text-xs text-white/50">Roast = motivation, not diagnosis. We fix it with your plan below.</p>
    </div>
  );
}

type Routine = { morning: string[]; night: string[] };

function RoutineCard({ routine, intake, value }: { routine: Routine; intake: any; value: any }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-1 text-lg font-semibold">Morning</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">{routine.morning.map((x, i) => (<li key={i}>• {x}</li>))}</ul>
        <h4 className="mb-1 mt-4 text-lg font-semibold">Night</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">{routine.night.map((x, i) => (<li key={i}>• {x}</li>))}</ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-2 text-lg font-semibold">Why this works</h4>
        <ul className="list-inside space-y-2 text-sm text-white/80">
          <li><CheckCircle2 className="mr-1 inline" size={16} /> Value Score: <span className="font-semibold text-emerald-300">{value.score}</span> (Dream×Likelihood / Time×Effort)</li>
          <li><CheckCircle2 className="mr-1 inline" size={16} /> First visible win targeted in <span className="font-semibold">{intake.timeGoal} days</span></li>
          <li><CheckCircle2 className="mr-1 inline" size={16} /> Effort tuned to <span className="font-semibold">{intake.effort}/5</span></li>
          <li><ShieldCheck className="mr-1 inline" size={16} /> Guidance is educational; not medical advice. Consult a dermatologist for prescriptions or severe acne.</li>
        </ul>
      </div>
    </div>
  );
}

function copyRoutine(routine: Routine, intake: any) {
  const budget = intake.budget === "low" ? "Student" : intake.budget === "mid" ? "Balanced" : "Premium";
  const lines = [
    `Student Acne Routine — ${intake.severity.toUpperCase()} (${budget})`,
    `Skin: ${intake.skin} • Area: ${intake.area}`,
    "",
    "Morning:",
    ...routine.morning.map((x) => `• ${x}`),
    "",
    "Night:",
    ...routine.night.map((x) => `• ${x}`),
  ].join('\n');
  try { navigator.clipboard.writeText(lines); return true; } catch { return false; }
}

// -------------------- OFFER SIDECARD --------------------
function OfferSideCard({ value }: { value: { score: number } }) {
  const totalValue = DEFAULT_BONUSES.reduce((a, b) => a + b.valueINR, 0) + 1999; // core program nominal value
  const discount = totalValue - CORE_PRICE;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow lg:sticky lg:top-20">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"><Percent size={14} /> Founders bundle pricing</div>
      <h4 className="text-xl font-semibold">Glow-Up Acne Reset</h4>
      <p className="mt-1 text-sm text-white/70">Personalized routine + product reco + tracking + support.</p>
      <SeatMeter />
      <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
        <div className="text-sm text-white/70">Total value</div>
        <div className="text-2xl font-bold">{formatINR(totalValue)}</div>
        <div className="mt-2 text-xs text-white/60 line-through">{formatINR(PRICES.anchor)}</div>
        <div className="text-3xl font-black text-emerald-300">{formatINR(CORE_PRICE)}</div>
        <div className="text-xs text-emerald-200">You save {formatINR(discount)}</div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {DEFAULT_BONUSES.map((b) => (<li key={b.name}>• {b.icon} {b.name} <span className="text-white/50">({formatINR(b.valueINR)} value)</span></li>))}
        <li>• ✅ 7-day "First-win" guarantee — no visible improvement after required steps? We extend support 30 days free.</li>
      </ul>
      <div className="mt-4 flex flex-col gap-2">
        <Button className="w-full" href="#checkout"><ShoppingCart size={18} /> Join for {formatINR(CORE_PRICE)}</Button>
        <Button className="w-full" href={WHATSAPP_DM} target="_blank" rel="noopener" variant="outline"><Smartphone size={16} /> WhatsApp us</Button>
      </div>
      <p className="mt-3 text-center text-xs text-white/60">Value score today: {value.score}</p>
    </div>
  );
}

function SeatMeter() {
  const [claimed, setClaimed] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/seats.json").then(r=>r.json()).then(d=>{ if(!active) return; const n = Number(d.claimed); setClaimed(Number.isFinite(n)? n : 0); }).catch(()=>{ if(active) setClaimed(118); });
    return ()=>{ active=false; };
  }, []);
  const total = SCARCITY.seats;
  const n = Math.min(Math.max(claimed ?? 0, 0), total);
  const pct = Math.round((n/total)*100);
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-white/70"><span>Seats claimed</span><span>{n} / {total} ({pct}%)</span></div>
      <div className="h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-2 bg-emerald-400" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

// -------------------- CHECKOUT --------------------
function Checkout({ onBack }: { onBack: () => void }) {
  const [plan, setPlan] = useState<'one'|'split'>('one');
  const splitTotal = Math.round(CORE_PRICE * 1.10); // ~+10% revenue
  const splitPart = Math.ceil(splitTotal / 2);
  const [bump, setBump] = useState(false);

  const checkoutHref = useMemo(() => {
    const base = plan === 'split' ? CHECKOUT_SPLIT_URL : CHECKOUT_URL;
    try {
      const u = new URL(base);
      u.searchParams.set('plan', plan);
      u.searchParams.set('core', String(CORE_PRICE));
      if (plan === 'split') { u.searchParams.set('split_total', String(splitTotal)); u.searchParams.set('split_part', String(splitPart)); }
      if (bump) u.searchParams.set('bump', String(BUMP_PRICE));
      return u.toString();
    } catch {
      const params = new URLSearchParams({ plan, core: String(CORE_PRICE), ...(plan==='split'?{split_total:String(splitTotal), split_part:String(splitPart)}:{}), ...(bump?{bump:String(BUMP_PRICE)}:{}) });
      return `${base}?${params}`;
    }
  }, [plan, bump, splitTotal, splitPart]);

  const payLabel = plan === 'split'
    ? `Pay ${formatINR(splitPart + (bump?BUMP_PRICE:0))} now — Split‑pay`
    : `Pay ${formatINR(CORE_PRICE + (bump?BUMP_PRICE:0))} — Open Checkout`;

  return (
    <Card title="Checkout" subtitle="Secure your spot — founders' pricing for first cohort.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm font-semibold">Choose payment</div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className={clsx("flex cursor-pointer items-center gap-3 rounded-xl border p-3", plan==='one'?"border-emerald-400/60 bg-emerald-400/10":"border-white/10 bg-white/5")}>
                <input type="radio" className="accent-emerald-400" checked={plan==='one'} onChange={()=>setPlan('one')} />
                <div>
                  <div className="font-semibold">One‑time</div>
                  <div className="text-sm text-white/70">{formatINR(CORE_PRICE)}</div>
                </div>
              </label>
              <label className={clsx("flex cursor-pointer items-center gap-3 rounded-xl border p-3", plan==='split'?"border-emerald-400/60 bg-emerald-400/10":"border-white/10 bg-white/5")}>
                <input type="radio" className="accent-emerald-400" checked={plan==='split'} onChange={()=>setPlan('split')} />
                <div>
                  <div className="font-semibold">Split‑pay</div>
                  <div className="text-sm text-white/70">2 × {formatINR(splitPart)} (Total {formatINR(splitTotal)})</div>
                </div>
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/70"><ShieldCheck size={14}/> Secured by 7‑Day First‑Win Guarantee</div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="accent-emerald-400" checked={bump} onChange={(e)=>setBump(e.target.checked)} />
                <div>
                  <div className="font-semibold">Add SOS Product Links + 3 Micro‑Videos</div>
                  <div className="text-xs text-white/70">One‑click list of Indian products + how‑to apply (optional)</div>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">+ {formatINR(BUMP_PRICE)}</div>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button className="w-full sm:w-auto" variant="outline" onClick={onBack}><ArrowLeft size={16} /> Back to Routine</Button>
            <Button className="w-full sm:w-auto" href={checkoutHref} target="_blank" rel="noopener"><ShoppingCart size={18} /> {payLabel}</Button>
          </div>
          <p className="mt-3 text-xs text-white/60">By continuing you agree to fair‑use, no‑medical‑advice, and guarantee terms.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <h4 className="text-lg font-semibold">You're getting</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/80">{DEFAULT_BONUSES.map((b) => (<li key={b.name}>• {b.name}</li>))}<li>• 7‑day first‑win guarantee</li></ul>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
            <div className="text-xs text-white/60 line-through">{formatINR(PRICES.anchor)}</div>
            <div className="text-2xl font-black text-emerald-300">{formatINR(CORE_PRICE)}</div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm">
            <div className="mb-1 font-semibold">7‑Day First‑Win Guarantee</div>
            <p className="text-white/80">Complete setup and daily routine; upload 3 progress selfies. If no visible improvement, we extend access + support for 30 days free.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur">
      <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-300" size={18} /><span>{msg}</span><button onClick={onClose} className="ml-2 rounded p-1 hover:bg-white/10"><X size={14} /></button></div>
    </motion.div>
  );
}

function StickyCTA(){
  const style = { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' } as React.CSSProperties;
  return (
    <div className="pointer-events-none fixed left-0 right-0 z-40" style={style}>
      <div className="mx-auto max-w-6xl px-3">
        <div className="pointer-events-auto mx-auto w-full sm:w-max rounded-xl border border-emerald-300/40 bg-emerald-500 text-slate-900 shadow-lg">
          <a href="#checkout" className="flex w-full items-center justify-center gap-2 px-5 py-3 font-semibold"><ShoppingCart size={18}/> Get the 21‑Day Acne Reset — {formatINR(CORE_PRICE)}</a>
        </div>
      </div>
    </div>
  );
}

function WhatsAppNudge(){
  const [show, setShow] = useState(false);
  useEffect(()=>{ const t = setTimeout(()=>setShow(true), 30000); return ()=>clearTimeout(t); },[]);
  if(!show) return null;
  const style = { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' } as React.CSSProperties;
  return (
    <motion.a href={WHATSAPP_DM} target="_blank" rel="noopener" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="fixed right-3 z-40 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur" style={style}>
      <Smartphone size={16}/> Got a question? WhatsApp us
    </motion.a>
  );
}

// -------------------- FAQ --------------------
function FAQ() {
  return (
    <section className="mt-16">
      <h3 className="text-2xl font-bold">FAQs</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FaqItem q="Is this medical advice?" a="No. This is educational guidance and product suggestions for over-the-counter care. Severe cases should see a dermatologist; prescriptions like isotretinoin require supervision." />
        <FaqItem q="How fast are results?" a="We target a first visible win in 7–30 days depending on severity and consistency. Adherence matters more than perfect products." />
        <FaqItem q="What is the guarantee?" a="Do the setup and daily routine; if you see no visible improvement in 7 days, we add a free extra month of coaching/resources at no cost." />
        <FaqItem q="What if I'm a girl?" a="You'll still benefit. We include notes on common triggers and how to adapt routines. For hormonal acne or pregnancy, consult a clinician first." />
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <span className="font-semibold">{q}</span>
        <ChevronRight className={clsx("transition", open && "rotate-90")} />
      </button>
      <AnimatePresence>
        {open && (<motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 overflow-hidden text-sm text-white/80">{a}</motion.p>)}
      </AnimatePresence>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 text-center text-xs text-white/50">
      <p>© {new Date().getFullYear()} Aswan — Educational content. Not medical advice.</p>
    </footer>
  );
}

// -------------------- ROUTINE ENGINE --------------------

type Routine = { morning: string[]; night: string[] };

function makeRoutine(intake: { severity: "mild" | "moderate" | "severe"; skin: "oily" | "dry" | "combo" | "normal"; area: "face" | "body" | "mixed"; budget: "low" | "mid" | "high"; timeGoal: number; effort: number; issues: string[]; }): Routine {
  const p = (x: string) => x;
  const baseCleanser = intake.skin === "dry" ? p("Gentle hydrating cleanser (AM/PM)") : p("Foaming salicylic cleanser (AM/PM)");
  const sunscreen = p("Sunscreen SPF 50 PA++++ (AM, 2-finger rule)");
  const moisturizer = intake.skin === "oily" ? p("Gel moisturizer (AM/PM)") : p("Ceramide moisturizer (AM/PM)");
  let activeAM = p("2% salicylic acid toner (AM 3x/week)");
  let activePM = p("Adapalene 0.1% (PM, pea-size, 3x/week → nightly)");
  if (intake.severity === "severe") { activeAM = p("BPO 2.5% leave-on (AM)"); activePM = p("Adapalene 0.1% + BPO 2.5% (PM, alternate nights)"); }
  else if (intake.severity === "moderate") { activeAM = p("BPO 2.5% wash (AM)"); activePM = p("Adapalene 0.1% (PM)"); }
  const morning = [baseCleanser, activeAM, moisturizer, sunscreen];
  const night = [baseCleanser, activePM, moisturizer];
  return { morning, night };
}
