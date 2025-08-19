// Canvas/bootstrap: patch fetch for /seats.json so the app can run without a server
if (typeof window !== 'undefined') {
  const __SEATS__ = {"claimed":118};
  const __origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input === '/seats.json') {
      return Promise.resolve(new Response(JSON.stringify(__SEATS__), { headers: { 'Content-Type': 'application/json' } }));
    }
    return __origFetch(input, init);
  };
}

// ===============================
// Acne Reset — v4 Grand‑Slam Hybrid (Best of v1+v2+v3)
// Built to align with Hormozi $100M Offers principles
// ===============================

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
  Camera,
  Wand2,
  Gauge,
  Star,
  BadgePercent,
  HeartHandshake,
  Users2,
  MessageSquare,
  Info,
  Lock,
  EyeOff,
  Flame,
  AlertTriangle,
  Plus,
  CircleCheck
} from "lucide-react";

// -------------------- CONFIG --------------------
const CHECKOUT_URL = "https://aswan.in/checkout"; // 🔁 replace with real checkout
const CHECKOUT_SPLIT_URL = "https://aswan.in/checkout-split"; // 🔁 replace with real split-pay checkout
const CHANNEL_URL = "https://aswan.in/community"; // 🔁 replace with real channel
const SUPPORT_WHATSAPP = "https://wa.me/919999999999?text=I%20have%20a%20question%20about%20Acne%20Reset"; // 🔁 replace

const POLICY = {
  guarantee: "/policy/guarantee",
  scarcity: "/policy/scarcity",
  privacy: "/policy/privacy",
};

// Scarcity (real only; set a real deadline & seat cap; see notes below)
const SCARCITY = {
  seats: 150, // founders cohort seats
  // Asia/Kolkata deadline example: set to tonight 11:59 PM local
  deadlineISO: (() => {
    const now = new Date();
    const local = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    local.setHours(23,59,59,0);
    return new Date(local.getTime()).toISOString();
  })(),
  reason: "Founders' cohort case-study intake",
};

// Pricing & Money Model
const LIST_PRICE = 999; // anchor/list price
const DEFAULT_INTRO_PRICE = 749; // launch price
const BUMP_PRICE = 299; // order bump: SOS links + 3 micro-videos

function getIntroPrice() {
  const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://local');
  const p = url.searchParams.get('price');
  if (p && /^\d+$/.test(p)) return Math.max(199, parseInt(p, 10)); // floor
  return DEFAULT_INTRO_PRICE;
}
const INTRO_PRICE = getIntroPrice();

// Named mechanism (thread through copy)
const MECHANISM = "R.A.P.I.D. Routine Engine™"; // (Recognize → Analyze → Plan → Implement → Debrief)

// -------------------- UTILS --------------------
const isDev = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
function clsx(...a){return a.filter(Boolean).join(' ');} 
function formatINR(n){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); }
function useCountdown(deadlineISO){
  const [t,setT]=useState(()=>Math.max(0,new Date(deadlineISO).getTime()-Date.now()));
  useEffect(()=>{const id=setInterval(()=>setT(Math.max(0,new Date(deadlineISO).getTime()-Date.now())),1000);return()=>clearInterval(id);},[deadlineISO]);
  const s=Math.floor(t/1000); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return {h,m,s:sec,isOver:t<=0};
}

// Value Equation score (Dream * Likelihood) / (Time * Effort)
function valueEquationScore(v){ const bottom=Math.max(1,v.time*v.effort); return Math.round(((v.dream*v.likelihood)/bottom)*100)/100; }

// Multi‑image preview util (front/left/right)
function useMultiImagePreview(){
  const [previews,setPreviews]=useState({});
  const urls=useRef({});
  const setFile=(slot,f)=>{ if(!f) return; if(urls.current[slot]) URL.revokeObjectURL(urls.current[slot]); const url=URL.createObjectURL(f); urls.current[slot]=url; setPreviews(p=>({...p,[slot]:url})); };
  useEffect(()=>()=>Object.values(urls.current).forEach(u=>URL.revokeObjectURL(u)),[]);
  return {previews,setFile};
}

// Analyzer (deterministic, on-device, placeholder)
async function fileHash(file){ const buf=await file.arrayBuffer(); const view=new Uint8Array(buf); let h=2166136261; for(let i=0;i<view.length;i+=4096){ h^=view[i]; h=Math.imul(h,16777619);} return Math.abs(h>>>0); }
function map100(x){return Math.max(5,Math.min(100,Math.round(x)));}
function deriveSkinType(seed){ const pick=seed%4; return pick===0?'oily':pick===1?'dry':pick===2?'combo':'normal'; }
function percentFrom(seed,shift,min=10,max=98){ const v=((seed>>>shift)%100); return Math.max(min,Math.min(max,v)); }
function buildResult(seed){
  const skinType=deriveSkinType(seed);
  const clarity=100-percentFrom(seed,3,20,95);
  const redness=percentFrom(seed,7);
  const oil=percentFrom(seed,11);
  const dryness=percentFrom(seed,17);
  const texture=100-percentFrom(seed,19,25,90);
  const symmetry=percentFrom(seed,23,40,96);
  const jawline=percentFrom(seed,27,35,97);
  const acneRisk=map100(0.6*(100-clarity)+0.2*redness+0.2*oil);
  const scores=[
    { key:'clarity', label:'Skin Clarity', score:map100(clarity), explain:'Lower acne/marks = higher clarity.' },
    { key:'redness', label:'Redness', score:map100(redness), explain:'Irritation/inflammation appearance.' },
    { key:'oil', label:'Oiliness', score:map100(oil), explain:'Shine in T-zone; product selection impact.' },
    { key:'dry', label:'Dryness', score:map100(dryness), explain:'Tightness/flaking; barrier focus.' },
    { key:'texture', label:'Texture Smoothness', score:map100(texture), explain:'Evenness of surface.' },
    { key:'sym', label:'Facial Symmetry', score:map100(symmetry), explain:'Left vs right balance (approx).' },
    { key:'jaw', label:'Jawline Definition', score:map100(jawline), explain:'Contours visibility.' },
    { key:'risk', label:'Acne Risk (composite)', score:map100(acneRisk), explain:'Estimated breakout likelihood with current routine.' },
  ];
  const flags=[]; if(clarity<60) flags.push('Active regimen for clarity'); if(redness>60) flags.push('Calm redness & barrier'); if(oil>65) flags.push('Oil control'); if(dryness>65) flags.push('Barrier repair'); if(texture<60) flags.push('Texture smoothing');
  const summary=`Type: ${skinType}. Priorities → ${flags.join(', ')||'Maintain & protect.'}`;
  return { skinType, scores, flags, summary };
}
function useFaceAnalyzer(faces){
  const [status,setStatus]=useState('waiting');
  const [progress,setProgress]=useState(0);
  const [result,setResult]=useState(null);
  useEffect(()=>{
    const ready=Boolean(faces.front && faces.left && faces.right);
    if(!ready){ setStatus('waiting'); setResult(null); setProgress(0); return; }
    let cancel=false; setStatus('analyzing'); setProgress(6); const id=setInterval(()=>setProgress(p=>Math.min(94,p+7)),220);
    (async()=>{ try{ const h1=await fileHash(faces.front); const h2=await fileHash(faces.left); const h3=await fileHash(faces.right); const seed=(h1^h2^h3)>>>0; const res=buildResult(seed); if(!cancel){ setResult(res); setProgress(100); setStatus('done'); } } catch(e){ if(!cancel){ setStatus('error'); } } finally{ clearInterval(id);} })();
    return ()=>{ cancel=true; clearInterval(id); };
  },[faces.front,faces.left,faces.right]);
  const reset=()=>{ setStatus('waiting'); setResult(null); setProgress(0); };
  return { status, progress, result, reset };
}

// -------------------- PRIMITIVES --------------------
const Button=({ variant="primary", href, onClick, children, className, type, target, rel })=>{
  const base="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition";
  const styles=variant==="primary"?"bg-emerald-500 text-slate-950 shadow hover:bg-emerald-400":variant==="outline"?"border border-white/10 bg-white/10 hover:bg-white/15":"bg-white/0 hover:bg-white/10";
  const cls=clsx(base,styles,className);
  if(href) return <a className={cls} href={href} target={target} rel={rel}>{children}</a>;
  return <button className={cls} onClick={onClick} type={type}>{children}</button>;
};

function Card({ title, subtitle, children }){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
      {title && <h3 className="text-xl font-semibold">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Meter({ value }){ return (<div className="h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-2 bg-emerald-400 transition-all" style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>); }

function BlurLock({ label="Preview blurred" }){
  return (
    <div className="pointer-events-none absolute inset-0 grid place-content-center rounded-xl bg-slate-950/40 backdrop-blur">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">
        <Lock size={14}/> {label}
      </div>
    </div>
  );
}

function BlurredCard({ title, subtitle, children, ctaHref, ctaLabel }){
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
      <div className="relative mt-3 overflow-hidden rounded-xl">
        <div className="blur-sm select-none">{children}</div>
        <BlurLock />
      </div>
      <div className="mt-3"><Button href={ctaHref}><Lock size={16}/> {ctaLabel}</Button></div>
      <p className="mt-2 text-xs text-white/50">Instant access after purchase.</p>
    </div>
  );
}

// -------------------- APP --------------------
export default function App(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-24">
        <Hero />
        <OfferWizard />
        <OfferStack />
        <Bonuses />
        <Guarantees />
        <ProofWall />
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
function Header(){
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-400" />
          <span className="text-sm font-bold tracking-tight">Acne Reset</span>
        </div>
        <nav className="hidden items-center gap-3 sm:flex">
          <a className="text-sm text-white/80 hover:text-white" href="#offer">Offer</a>
          <a className="text-sm text-white/80 hover:text-white" href="#bonuses">Bonuses</a>
          <a className="text-sm text-white/80 hover:text-white" href="#guarantee">Guarantee</a>
          <a className="text-sm text-white/80 hover:text-white" href="#proof">Proof</a>
          <a className="text-sm text-white/80 hover:text-white" href="#faq">FAQ</a>
          <a className="text-sm text-white/80 hover:text-white" href="#policies">Policies</a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 sm:inline">{MECHANISM}</span>
          <Button className="hidden sm:inline-flex" href="#checkout"><ShoppingCart size={16}/> Join Now {formatINR(INTRO_PRICE)}</Button>
        </div>
      </div>
    </header>
  );
}

// -------------------- HERO --------------------
function Hero(){
  const { h,m,s,isOver } = useCountdown(SCARCITY.deadlineISO);
  return (
    <section className="mb-10 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-white/60">
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 font-bold text-slate-950">Founders Deal</span>
          <span className="inline-flex items-center gap-1"><Flame size={14}/> Ends today</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Your 2‑Minute Looks Routine — first visible win in 7 days
          <span className="block text-emerald-400">Powered by {MECHANISM}</span>
        </h1>
        <p className="mt-3 text-white/80">Upload 3 selfies → get a personalized, budget‑friendly AM/PM routine with weekly adjustments. Cohort support included.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button href="#wizard"><Wand2 size={16}/> Get your plan in 2 minutes</Button>
          <Button variant="outline" href="#offer"><Percent size={16}/> Launch price: {formatINR(INTRO_PRICE)}</Button>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-white/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"><Clock size={14}/> 8‑week program</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"><ShieldCheck size={14}/> Double guarantee</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"><Star size={14}/> Community support</span>
        </div>
        <SeatMeter />
        <p className="mt-2 text-xs text-white/60">Timer — {isOver ? 'renewing soon' : `${h}h ${m}m ${s}s left`}. <a className="underline" href={POLICY.scarcity}>See scarcity policy</a>.</p>
      </div>
      <ValueEquationCard />
    </section>
  );
}

function ValueEquationCard(){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-sm font-bold">Why this is a no‑brainer (Value Equation)</div>
      <ul className="space-y-2 text-sm text-white/80">
        <li className="flex items-start gap-2"><CircleCheck className="mt-0.5" size={16}/> <span><strong>Dream outcome ↑</strong>: clearer skin + confidence.</span></li>
        <li className="flex items-start gap-2"><CircleCheck className="mt-0.5" size={16}/> <span><strong>Perceived likelihood ↑</strong>: step‑by‑step plan, cohort support, weekly reviews.</span></li>
        <li className="flex items-start gap-2"><CircleCheck className="mt-0.5" size={16}/> <span><strong>Time delay ↓</strong>: first visible win targeted in 7 days; full protocol in 8 weeks.</span></li>
        <li className="flex items-start gap-2"><CircleCheck className="mt-0.5" size={16}/> <span><strong>Effort & sacrifice ↓</strong>: 2‑minute routine, product picks done for you.</span></li>
      </ul>
    </div>
  );
}

// -------------------- OFFER WIZARD (v1 depth + v2 sidecard) --------------------
function OfferWizard(){
  const [step,setStep]=useState(1); // 1 Intake → 2 Selfies → 3 Analyze → 4 Preview (blurred) → 5 Checkout
  const [intake,setIntake]=useState({ severity:"moderate", skin:"oily", area:"face", budget:"low", timeGoal:14, effort:2, issues:[] });
  const [faces,setFaces]=useState({});
  const { previews,setFile } = useMultiImagePreview();
  const analyzer = useFaceAnalyzer(faces);
  const value = useMemo(()=>{ const dream=intake.severity==='severe'?5:intake.severity==='moderate'?4:3; const likelihood=3.5; const time=Math.max(1,Math.round(intake.timeGoal/7)); const effort=Math.max(1,6-intake.effort); return { dream, likelihood, time, effort, score:valueEquationScore({dream,likelihood,time,effort}) }; },[intake]);
  const routine = useMemo(()=>makeRoutine(intake),[intake]);
  const previewRoutine = useMemo(()=>({ morning:routine.morning.slice(0,2), night:routine.night.slice(0,2) }),[routine]);

  return (
    <section id="wizard" className="mt-6">
      <div className="mb-5">
        <div className="relative mx-auto flex max-w-xl items-center justify-between overflow-hidden">
          {[1,2,3,4,5].map((i)=> (
            <div key={i} className="relative flex items-center">
              <div className={clsx("grid h-6 w-6 place-content-center rounded-full text-xs", i<=step?"bg-white text-slate-900":"bg-white/10 text-white/70")}>{i}</div>
              {i<5 && <div className={clsx("mx-2 h-[2px] w-10 sm:w-16 md:w-28", i<step?"bg-white":"bg-white/10")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left panel */}
        <div className="space-y-6 lg:col-span-2">
          {step===1 && <StepIntake intake={intake} setIntake={setIntake} onNext={()=>setStep(2)} />}
          {step===2 && <StepSelfies previews={previews} setFile={setFile} setFaces={setFaces} onPrev={()=>setStep(1)} onNext={()=>setStep(3)} />}
          {step===3 && <StepAnalyze analyzer={analyzer} onPrev={()=>setStep(2)} onNext={()=>setStep(4)} />}
          {step===4 && <StepPreview analyzer={analyzer} previewRoutine={previewRoutine} value={value} onPrev={()=>setStep(3)} onNext={()=>setStep(5)} />}
          {step===5 && <Checkout intake={intake} routine={routine} value={value} onBack={()=>setStep(4)} />}
        </div>
        {/* Right panel: v2-style sidecard */}
        <aside>
          <SideCard step={step} previews={previews} analyzer={analyzer} value={value} />
        </aside>
      </div>
    </section>
  );
}

function LabeledSelect({ label, value, onChange, options }){
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">{label}</div>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-emerald-400">
        {options.map(o=> <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>)}
      </select>
    </label>
  );
}
function LabeledSlider({ label, min, max, value, onChange }){
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/80">{label}: <span className="font-semibold">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e)=>onChange(Number(e.target.value))} className="w-full accent-emerald-400" />
    </label>
  );
}
function CheckboxGroup({ label, options, values, onChange }){
  return (
    <div>
      <div className="mb-2 text-sm text-white/80">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(o=>{ const checked=values.includes(o); return (
          <button type="button" key={o} onClick={()=>onChange(checked?values.filter(v=>v!==o):[...values,o])} className={clsx("rounded-full px-3 py-2 text-xs transition", checked?"bg-emerald-500 text-slate-950":"border border-white/10 bg-white/10 text-white/80 hover:bg-white/15")}>{o}</button>
        ); })}
      </div>
    </div>
  );
}

function StepIntake({ intake, setIntake, onNext }){
  return (
    <Card title="Tell us about your skin" subtitle={`We personalize with ${MECHANISM}.`}>
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledSelect label="Severity" value={intake.severity} onChange={v=>setIntake(s=>({...s,severity:v}))} options={[{label:"Mild — black/whiteheads",value:"mild"},{label:"Moderate — inflamed",value:"moderate"},{label:"Severe — nodules/cysts",value:"severe"}]} />
        <LabeledSelect label="Skin type" value={intake.skin} onChange={v=>setIntake(s=>({...s,skin:v}))} options={[{label:"Oily",value:"oily"},{label:"Dry",value:"dry"},{label:"Combination",value:"combo"},{label:"Normal",value:"normal"}]} />
        <LabeledSelect label="Main area" value={intake.area} onChange={v=>setIntake(s=>({...s,area:v}))} options={[{label:"Face",value:"face"},{label:"Body",value:"body"},{label:"Both",value:"mixed"}]} />
        <LabeledSelect label="Budget" value={intake.budget} onChange={v=>setIntake(s=>({...s,budget:v}))} options={[{label:"Student (low)",value:"low"},{label:"Mid",value:"mid"},{label:"High",value:"high"}]} />
        <LabeledSlider label="Time to first visible win (days)" min={7} max={45} value={intake.timeGoal} onChange={v=>setIntake(s=>({...s,timeGoal:v}))} />
        <LabeledSlider label="How much daily effort? (1–5)" min={1} max={5} value={intake.effort} onChange={v=>setIntake(s=>({...s,effort:v}))} />
        <CheckboxGroup label="What have you tried?" options={["Dermatologist","Benzoyl Peroxide","Retinoids","Antibiotics","Ayurveda/Home","Nothing consistent"]} values={intake.issues} onChange={vals=>setIntake(s=>({...s,issues:vals}))} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={onNext}>Continue <ArrowRight size={16}/></Button>
      </div>
    </Card>
  );
}

function StepSelfies({ previews, setFile, setFaces, onPrev, onNext }){
  const onPick=(slot)=> (e)=>{ const f=e.target.files?.[0]; if(f){ setFaces(s=>({...s,[slot]:f})); setFile(slot,f);} };
  return (
    <Card title="Upload 3 selfies (optional but best)" subtitle="Front, left, right — natural light, no filter. Analysis auto‑starts when all 3 are added.">
      <div className="grid gap-4 md:grid-cols-3">
        {(['front','left','right']).map(slot=> (
          <div key={slot}>
            <label className="block text-sm text-white/80 capitalize">{slot}</label>
            <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-3">
              <input type="file" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 p-3" onChange={onPick(slot)} />
              <p className="mt-2 text-xs text-white/60">Tap to add a {slot} selfie</p>
            </div>
            <div className="mt-2 grid place-content-center overflow-hidden rounded-lg bg-white/5" style={{aspectRatio:'1/1'}}>
              {previews[slot] ? (<img src={previews[slot]} alt={slot} className="h-full w-full object-cover"/>) : (<div className="p-6 text-center text-white/40">No image</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}><ArrowLeft size={16}/> Back</Button>
        <Button className="w-full sm:w-auto" onClick={onNext}>Continue <ArrowRight size={16}/></Button>
      </div>
      <p className="mt-2 text-xs text-white/50">Images are processed on your device for this preview. If you later opt into server analysis, we’ll ask consent first. See <a className="underline" href={POLICY.privacy}>privacy</a>.</p>
    </Card>
  );
}

function StepAnalyze({ analyzer, onPrev, onNext }){
  return (
    <Card title="Analyzing your selfies" subtitle="On‑device estimate for education only; we’ll tune your plan accordingly.">
      {analyzer.status === 'waiting' && (<div className="text-white/70">Add all 3 photos to auto‑analyze. You can also skip and continue.</div>)}
      {analyzer.status === 'analyzing' && (
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-white/80"><Info size={14}/> Analyzing face (on your device)…</div>
          <Meter value={analyzer.progress} />
          <div className="mt-1 text-xs text-white/50">This is educational, not diagnostic.</div>
        </div>
      )}
      {analyzer.status === 'done' && analyzer.result && (
        <div className="space-y-4">
          <HarshRoast result={analyzer.result} />
          <div className="grid gap-4 md:grid-cols-3">
            <BlurredCard title="Your custom acne routine" subtitle="AM/PM + products by budget" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(INTRO_PRICE)}`}>
              <ul className="space-y-1 text-sm text-white/80">
                {/* preview only */}
                <li>• AM: {"Foaming salicylic cleanser"}</li>
                <li>• PM: {"Adapalene 0.1% (pea‑size)"}</li>
                <li>• + moisturizer, sunscreen…</li>
              </ul>
            </BlurredCard>
            <BlurredCard title="Looksmax Guide (41p)" subtitle="Skin, hair, jawline, style" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(INTRO_PRICE)}`}>
              <div className="h-24 rounded-lg border border-white/10 bg-black/40" />
            </BlurredCard>
            <BlurredCard title="Personalized PDF Report" subtitle="Skin type, risk score, priorities" ctaHref="#checkout" ctaLabel={`Unlock for ${formatINR(INTRO_PRICE)}`}>
              <div className="text-sm text-white/80">
                <p>• Skin Type: <span className="capitalize">{analyzer.result.skinType}</span></p>
                <p>• Priorities: {(analyzer.result.flags[0]||'clarity first')}…</p>
              </div>
            </BlurredCard>
          </div>
        </div>
      )}
      {analyzer.status === 'error' && (<div className="text-rose-300">Could not analyze. Try smaller images or different photos.</div>)}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}><ArrowLeft size={16}/> Back</Button>
        <Button className="w-full sm:w-auto" onClick={onNext}>Continue <ArrowRight size={16}/></Button>
      </div>
    </Card>
  );
}

function StepPreview({ analyzer, previewRoutine, value, onPrev, onNext }){
  return (
    <Card title="Your personalized routine (locked preview)" subtitle="Unlock the full routine and product picks">
      <div className="relative">
        <div className="blur-sm select-none">
          <RoutineCard routine={{ morning:previewRoutine.morning, night:previewRoutine.night }} intake={{timeGoal:14, effort:2}} value={value} />
        </div>
        <BlurLock label="Routine blurred — unlock to view" />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onPrev}><ArrowLeft size={16}/> Back</Button>
        <Button className="w-full sm:w-auto" onClick={onNext}><Lock size={16}/> Unlock Now <ArrowRight size={16}/></Button>
      </div>
    </Card>
  );
}

// -------------------- SIDECARD (v2 style) --------------------
function SideCard({ step, previews, analyzer, value }){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="font-semibold">Your progress</div>
        <div className="text-white/60">Step {step} / 5</div>
      </div>
      <div className="space-y-4 text-sm text-white/80">
        <div className="rounded-xl border border-white/10 p-3">
          <div className="mb-2 text-xs font-semibold text-white/60">Selfies</div>
          <div className="grid grid-cols-3 gap-2">
            {(['front','left','right']).map(s=> (
              <div key={s} className="aspect-[3/4] rounded-md border border-white/10 bg-white/5">
                {previews[s] && <img src={previews[s]} alt={s} className="h-full w-full rounded-md object-cover" />}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <div className="mb-2 text-xs font-semibold text-white/60">Top drivers</div>
          {analyzer?.result ? (
            <ul className="space-y-1">
              {analyzer.result.scores.slice(0,3).map(s=> (<li key={s.key} className="flex items-center justify-between"><span>{s.label}</span><span>{s.score}%</span></li>))}
            </ul>
          ) : (<p className="text-white/60">Pending</p>)}
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <div className="mb-1 text-xs font-semibold text-white/60">Value score</div>
          <div className="text-lg font-bold text-emerald-300">{value?.score}</div>
        </div>
      </div>
    </div>
  );
}

// -------------------- ROUTINE & ROAST --------------------
function RoutineCard({ routine, intake, value }){
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-1 text-lg font-semibold">Morning</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">{routine.morning.map((x,i)=>(<li key={i}>• {x}</li>))}</ul>
        <h4 className="mb-1 mt-4 text-lg font-semibold">Night</h4>
        <ul className="list-inside space-y-1 text-sm text-white/80">{routine.night.map((x,i)=>(<li key={i}>• {x}</li>))}</ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-2 text-lg font-semibold">Why this works</h4>
        <ul className="list-inside space-y-2 text-sm text-white/80">
          <li><CheckCircle2 className="mr-1 inline" size={16} /> Value Score: <span className="font-semibold text-emerald-300">{value.score}</span> (Dream×Likelihood / Time×Effort)</li>
          <li><CheckCircle2 className="mr-1 inline" size={16} /> First win targeted in <span className="font-semibold">{intake.timeGoal||14} days</span></li>
          <li><CheckCircle2 className="mr-1 inline" size={16} /> Effort tuned to <span className="font-semibold">{intake.effort||2}/5</span></li>
          <li><ShieldCheck className="mr-1 inline" size={16} /> Educational guidance; not medical advice.</li>
        </ul>
      </div>
    </div>
  );
}

function HarshRoast({ result }){
  const byKey=Object.fromEntries(result.scores.map(s=>[s.key,s.score]));
  const sev=Math.max(0,Math.min(100, Math.round((100-(byKey.clarity||50))*0.35 + (byKey.redness||50)*0.20 + Math.max(0,(byKey.oil||50)-55)*0.20 + (100-(byKey.texture||50))*0.25)) );
  const lines=[];
  if((byKey.clarity||0)<55) lines.push("Your pores are hosting a rave and security (sunscreen) didn’t show.");
  if((byKey.oil||0)>70) lines.push("T‑zone so shiny NASA’s trying to dock.");
  if((byKey.redness||0)>65) lines.push("Your barrier’s on strike and the picket signs are red.");
  if((byKey.texture||0)<60) lines.push("Texture so bumpy Google Maps wants to chart it.");
  if((byKey.sym||0)<60) lines.push("Left face vs right face: civil war.");
  if((byKey.jaw||0)<60) lines.push("Jawline’s playing hide‑and‑seek — and winning.");
  if(!lines.length) lines.push("You’re close — stop freestyling and lock a routine before acne does.");
  const offenses=[
    { key:'clarity', label:'Low Clarity', bad:(byKey.clarity||0)<60 },
    { key:'redness', label:'High Redness', bad:(byKey.redness||0)>60 },
    { key:'oil', label:'High Oil', bad:(byKey.oil||0)>65 },
    { key:'dry', label:'Dry/Flaky', bad:(byKey.dry||0)>65 },
    { key:'texture', label:'Rough Texture', bad:(byKey.texture||0)<60 },
    { key:'sym', label:'Low Symmetry', bad:(byKey.sym||0)<60 },
    { key:'jaw', label:'Weak Jawline', bad:(byKey.jaw||0)<60 },
  ].filter(x=>x.bad);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80"><Flame size={16}/> Harsh Roast (extra spicy)</div>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-white/60"><span>Roast Meter</span><span>{sev}/100</span></div>
        <div className="h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-2 bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-300" style={{width:`${sev}%`}}/></div>
      </div>
      {offenses.length>0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {offenses.map(o=> (<span key={o.key} className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-xs text-rose-200"><AlertTriangle size={12}/> {o.label}</span>))}
        </div>
      )}
      <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">{lines.map((t,i)=>(<li key={i}>{t}</li>))}</ul>
      <p className="mt-2 text-xs text-white/50">Roast = motivation, not diagnosis. We fix it with your plan below.</p>
    </div>
  );
}

// -------------------- OFFER STACK (v3) --------------------
function OfferStack(){
  return (
    <section id="offer" className="mt-12">
      <h3 className="text-2xl font-bold">Pick your plan</h3>
      <p className="text-white/70">Good–Better–Best with premium anchoring. All plans include the core Acne Reset system.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PlanCard name="Starter" price={INTRO_PRICE} badge="Best value" features={["Personalized AM/PM routine","3 curated products","Weekly adjustments (8w)","Community access" ]} cta="Join Starter" />
        <PlanCard name="Pro" price={INTRO_PRICE + 350} badge="Most popular" features={["Everything in Starter","1:1 kickoff call (15m)","Sensitive‑skin protocol","SOS breakout mini‑plan"]} cta="Join Pro" highlight />
        <PlanCard name="VIP" price={1999} badge="Premium" features={["Everything in Pro","Two 1:1 check‑ins","WhatsApp priority line","Product replacements guidance"]} cta="Join VIP" />
      </div>
      <OfferMath />
    </section>
  );
}

function PlanCard({ name, price, badge, features, cta, highlight }){
  return (
    <div className={clsx("relative rounded-2xl border p-5", highlight?"border-emerald-400/60 bg-emerald-400/5 border-white/10":"border-white/10 bg-white/5") }>
      {badge && <div className="absolute -top-3 left-5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 shadow">{badge}</div>}
      <div className="mb-1 text-sm font-bold">{name}</div>
      <div className="mb-4 flex items-end gap-2">
        <div className="text-3xl font-extrabold">{formatINR(price)}</div>
        <div className="text-xs text-white/60 line-through">{formatINR(LIST_PRICE)}</div>
      </div>
      <ul className="mb-4 space-y-1 text-sm text-white/80">{features.map((f,i)=> <li key={i} className="flex items-start gap-2"><Plus size={16}/> {f}</li>)}</ul>
      <Button href="#checkout"><ShoppingCart size={16}/> {cta}</Button>
      <p className="mt-2 text-xs text-white/60">Pay‑in‑full bonus applied at checkout.</p>
    </div>
  );
}

function OfferMath(){
  const stack=[
    { label:'8‑week program & playbook', value:7999 },
    { label:'Cohort & community', value:1999 },
    { label:'Sensitive‑skin protocol', value:1499 },
    { label:'SOS breakout mini‑plan', value:999 },
  ];
  const total=stack.reduce((a,b)=>a+b.value,0);
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <div className="mb-2 text-sm font-bold">Value stack</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((s,i)=> (
          <div key={i} className="rounded-xl border border-white/10 bg-white/0 p-3">
            <div className="font-semibold">{s.label}</div>
            <div className="text-white/70">Value {formatINR(s.value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">Total comparable value {formatINR(total)} • Your price starts at {formatINR(INTRO_PRICE)}.</div>
    </div>
  );
}

// -------------------- CHECKOUT (v1 mechanics) --------------------
function Checkout({ onBack, intake, routine, value }){
  const [plan,setPlan]=useState('one');
  const splitTotal=Math.round(INTRO_PRICE*1.10); // ~+10%
  const splitPart=Math.ceil(splitTotal/2);
  const [bump,setBump]=useState(false);
  const [pifBonus,setPifBonus]=useState(true); // pay-in-full bonus toggle visual

  const checkoutHref = useMemo(()=>{
    const base = plan==='split'?CHECKOUT_SPLIT_URL:CHECKOUT_URL;
    try{ const u=new URL(base); u.searchParams.set('plan',plan); u.searchParams.set('core',String(INTRO_PRICE)); if(plan==='split'){ u.searchParams.set('split_total',String(splitTotal)); u.searchParams.set('split_part',String(splitPart)); } if(bump) u.searchParams.set('bump',String(BUMP_PRICE)); if(pifBonus) u.searchParams.set('pif_bonus','1'); return u.toString(); }catch{ const params=new URLSearchParams({ plan, core:String(INTRO_PRICE), ...(plan==='split'?{split_total:String(splitTotal), split_part:String(splitPart)}:{}), ...(bump?{bump:String(BUMP_PRICE)}:{}), ...(pifBonus?{pif_bonus:'1'}:{}) }); return `${base}?${params}`; }
  },[plan,bump,splitTotal,splitPart,pifBonus]);

  const payLabel = plan==='split' ? `Pay ${formatINR(splitPart + (bump?BUMP_PRICE:0))} now — Split‑pay` : `Pay ${formatINR(INTRO_PRICE + (bump?BUMP_PRICE:0))} — Open Checkout`; 

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
                  <div className="text-sm text-white/70">{formatINR(INTRO_PRICE)} {pifBonus && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Pay‑in‑full bonus</span>}</div>
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
            <div className="mt-3 flex items-center gap-2 text-xs text-white/70"><ShieldCheck size={14}/> Covered by Double Guarantee — <a className="underline" href={POLICY.guarantee}>read terms</a></div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="accent-emerald-400" checked={bump} onChange={(e)=>setBump(e.target.checked)} />
                <div>
                  <div className="font-semibold">Add SOS Product Links + 3 Micro‑Videos</div>
                  <div className="text-xs text-white/70">One‑click list of products + how‑to apply (optional)</div>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">+ {formatINR(BUMP_PRICE)}</div>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button className="w-full sm:w-auto" variant="outline" onClick={onBack}><ArrowLeft size={16}/> Back to Preview</Button>
            <Button className="w-full sm:w-auto" href={checkoutHref} target="_blank" rel="noopener"><ShoppingCart size={18} /> {payLabel}</Button>
          </div>
          <p className="mt-3 text-xs text-white/60">By continuing you agree to fair‑use, no‑medical‑advice, and guarantee terms.</p>
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
            <div className="text-xs text-white/60 line-through">{formatINR(LIST_PRICE)}</div>
            <div className="text-2xl font-black text-emerald-300">{formatINR(INTRO_PRICE)}</div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm">
            <div className="mb-1 font-semibold">Double Guarantee</div>
            <p className="text-white/80">30‑day money‑back + Results‑based support extension if no visible improvement by week 8.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// -------------------- BONUSES & GUARANTEES --------------------
function Bonuses(){
  return (
    <section id="bonuses" className="mt-12">
      <h3 className="text-2xl font-bold">Fast‑action bonuses</h3>
      <p className="text-white/70">Join before the timer ends to lock in these extras.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {title:'Clear Skin Cheatsheet (PDF)', value: 499},
          {title:'Ingredient Decoder (mobile)', value: 599},
          {title:'Travel Routine Builder', value: 399},
        ].map((b,i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">{b.title}</div>
            <div className="text-xs text-white/60">Value {formatINR(b.value)}</div>
            <div className="mt-3 text-sm text-white/80">Instant access after purchase.</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/60">Bonuses expire with the countdown. <a className="underline" href={POLICY.scarcity}>See scarcity policy</a>.</p>
    </section>
  );
}

function Guarantees(){
  return (
    <section id="guarantee" className="mt-12">
      <h3 className="text-2xl font-bold">Double guarantee</h3>
      <p className="text-white/70">We remove the risk so you can focus on results.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 text-sm font-bold"><ShieldCheck className="mr-1 inline" size={16}/> 30‑day Money‑Back</div>
          <p className="text-sm text-white/80">Try it for 30 days. If you don’t love it, email support—full refund. No forms, no drama. <a className="underline" href={POLICY.guarantee}>Read terms</a>.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 text-sm font-bold"><ShieldCheck className="mr-1 inline" size={16}/> Results‑Based</div>
          <p className="text-sm text-white/80">Follow the weekly plan. If no visible improvement by week 8, we’ll work with you free for 8 more weeks. <a className="underline" href={POLICY.guarantee}>Read terms</a>.</p>
        </div>
      </div>
    </section>
  );
}

// -------------------- PROOF & AVATAR --------------------
function ProofWall(){
  const items=new Array(8).fill(0).map((_,i)=>({ name:`User ${i+1}`, note:"(Replace with real proof)", metric:"7‑day improvement", text:"Short testimonial or metric tile goes here." }));
  return (
    <section id="proof" className="mt-12">
      <h3 className="text-2xl font-bold">Proof</h3>
      <p className="text-white/70">Replace these placeholders with real cohort stats, expert notes, and before/afters.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it,i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="font-semibold">{it.metric}</div>
            <p className="mt-1 text-white/80">{it.text}</p>
            <div className="mt-2 text-xs text-white/60">— {it.name} {it.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoNotFor(){
  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold">Who this is NOT for</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
        <li>If you expect prescription‑level results without medical supervision.</li>
        <li>If you won’t follow a 2‑minute daily routine for 14 days.</li>
        <li>If you want luxury products only (we optimize for budget first).</li>
      </ul>
    </section>
  );
}

function Quickstart(){
  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold">Your first 24 hours</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {h:'T‑0h',t:'Upload selfies & get plan'},
          {h:'+2h',t:'Get starter kit (links provided)'},
          {h:'+24h',t:'First routine check‑in (2 minutes)'}
        ].map((b,i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="text-xs text-white/60">{b.h}</div>
            <div className="font-semibold">{b.t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// -------------------- FAQ & POLICIES --------------------
function FAQ(){
  const items=[
    { q:'Is this medical advice?', a:'No. Educational guidance only. Consult a dermatologist for medical concerns.' },
    { q:'Money‑back terms?', a:'30‑day no‑questions refund. Results guarantee extends help for another 8 weeks if needed. See policy.' },
    { q:'Sensitive skin?', a:'We bias fragrance‑free gentle picks; ramp actives slowly.' },
  ];
  return (
    <section id="faq" className="mt-12">
      <h3 className="text-2xl font-bold">FAQ</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((it,i)=> (
          <details key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <summary className="cursor-pointer list-none font-semibold">{it.q}</summary>
            <p className="mt-1 text-sm text-white/70">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Policies(){
  return (
    <section id="policies" className="mt-12 text-sm">
      <h3 className="text-2xl font-bold">Policies</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
        <li><a className="underline" href={POLICY.guarantee}>Guarantee & Refund Terms</a></li>
        <li><a className="underline" href={POLICY.scarcity}>Scarcity & Timer Integrity Policy</a></li>
        <li><a className="underline" href={POLICY.privacy}>Privacy (Selfie analysis & data)</a></li>
      </ul>
    </section>
  );
}

function Footer(){
  return (
    <footer className="mt-16 text-center text-xs text-white/50">
      <p>© {new Date().getFullYear()} Aswan — Educational content. Not medical advice. <a className="underline" href={CHANNEL_URL} target="_blank" rel="noreferrer noopener">Join the community</a>.</p>
    </footer>
  );
}

// -------------------- STICKY & SUPPORT --------------------
function StickyCTA(){
  const style={ bottom:'calc(env(safe-area-inset-bottom, 0px) + 12px)' };
  return (
    <div id="checkout" className="pointer-events-none fixed left-0 right-0 z-40" style={style}>
      <div className="mx-auto max-w-6xl px-3">
        <div className="pointer-events-auto mx-auto w-full sm:w-max rounded-xl border border-emerald-300/40 bg-emerald-500 text-slate-900 shadow-lg">
          <a href="#offer" className="flex w-full items-center justify-center gap-2 px-5 py-3 font-semibold"><ShoppingCart size={18}/> Get the 21‑Day Acne Reset — {formatINR(INTRO_PRICE)}</a>
        </div>
      </div>
    </div>
  );
}

function WhatsAppNudge(){
  const [show,setShow]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setShow(true),30000); return ()=>clearTimeout(t); },[]);
  if(!show) return null;
  const style={ bottom:'calc(env(safe-area-inset-bottom, 0px) + 88px)' };
  return (
    <motion.a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="fixed right-3 z-40 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur" style={style}>
      <MessageSquare size={16}/> Got a question? WhatsApp us
    </motion.a>
  );
}

// -------------------- SCARCITY WIDGET --------------------
function SeatMeter(){
  const [claimed,setClaimed]=useState(null);
  useEffect(()=>{ let active=true; fetch('/seats.json').then(r=>r.json()).then(d=>{ if(!active) return; const n=Number(d.claimed); setClaimed(Number.isFinite(n)?n:0); }).catch(()=>{ if(active) setClaimed(118); }); return ()=>{active=false;}; },[]);
  const total=SCARCITY.seats; const n=Math.min(Math.max(claimed??0,0),total); const pct=Math.round((n/total)*100);
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-white/70"><span>Seats claimed</span><span>{n} / {total} ({pct}%)</span></div>
      <div className="h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-2 bg-emerald-400" style={{width:`${pct}%`}}/></div>
    </div>
  );
}

// -------------------- ROUTINE ENGINE --------------------
function makeRoutine(intake){
  const p=(x)=>x;
  const baseCleanser=intake.skin==='dry'?p('Gentle hydrating cleanser (AM/PM)'):p('Foaming salicylic cleanser (AM/PM)');
  const sunscreen=p('Sunscreen SPF 50 PA++++ (AM, 2-finger rule)');
  const moisturizer=intake.skin==='oily'?p('Gel moisturizer (AM/PM)'):p('Ceramide moisturizer (AM/PM)');
  let activeAM=p('2% salicylic acid toner (AM 3x/week)');
  let activePM=p('Adapalene 0.1% (PM, pea-size, 3x/week → nightly)');
  if(intake.severity==='severe'){ activeAM=p('BPO 2.5% leave-on (AM)'); activePM=p('Adapalene 0.1% + BPO 2.5% (PM, alternate nights)'); }
  else if(intake.severity==='moderate'){ activeAM=p('BPO 2.5% wash (AM)'); activePM=p('Adapalene 0.1% (PM)'); }
  const morning=[baseCleanser,activeAM,moisturizer,sunscreen];
  const night=[baseCleanser,activePM,moisturizer];
  return { morning, night };
}
