"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

const builderFields = [
  { label: "Text Input", icon: "type" },
  { label: "Email", icon: "mail" },
  { label: "Select", icon: "dropdown" },
  { label: "Checkbox", icon: "checkbox" },
  { label: "Radio Button", icon: "radio" },
  { label: "Textarea", icon: "alignLeft" },
  { label: "File Upload", icon: "upload" },
];

function FloatingBuilderCard({ reducedMotion, parallaxX, parallaxY }) {
  const rotate = -8;
  const tx = parallaxX * 8;
  const ty = parallaxY * 6;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-[320px] rounded-2xl border border-primary-border/60 bg-white shadow-2xl shadow-primary/[0.08]"
      style={{
        transform: `rotate(${rotate}deg) translate(${tx}px, ${ty}px)`,
        transition: reducedMotion ? "none" : "transform 0.15s ease-out",
        willChange: "transform",
      }}
    >
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/70">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <span className="ml-1 text-[12px] font-semibold text-foreground/80">Add Field</span>
      </div>
      <div className="p-4 space-y-1.5">
        {builderFields.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-white px-3 py-2 transition-colors hover:border-primary/30 hover:bg-primary-soft/30"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary-soft/80">
              <Icon name={f.icon} size="xs" className="text-primary" strokeWidth={2} />
            </div>
            <span className="flex-1 text-[12px] font-medium text-foreground/85">{f.label}</span>
            <Icon name="gripVertical" size="xs" className="text-muted-foreground/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingPreviewCard({ reducedMotion, parallaxX, parallaxY }) {
  const rotate = 8;
  const tx = parallaxX * -8;
  const ty = parallaxY * -6;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-[300px] rounded-2xl border border-primary-border/60 bg-white shadow-2xl shadow-primary/[0.08]"
      style={{
        transform: `rotate(${rotate}deg) translate(${tx}px, ${ty}px)`,
        transition: reducedMotion ? "none" : "transform 0.15s ease-out",
        willChange: "transform",
      }}
    >
      <div className="px-5 py-4 border-b border-border/70">
        <h3 className="text-[14px] font-semibold text-foreground">Contact Us</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">We&apos;d love to hear from you.</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your Name</span>
          <div className="mt-1 h-[30px] rounded-lg border border-border/60 bg-white px-3 flex items-center">
            <span className="text-[11px] text-muted-foreground/50">John Doe</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your Email</span>
          <div className="mt-1 h-[30px] rounded-lg border border-border/60 bg-white px-3 flex items-center">
            <span className="text-[11px] text-muted-foreground/50">you@example.com</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message</span>
          <div className="mt-1 h-[52px] rounded-lg border border-border/60 bg-white px-3 pt-2">
            <span className="text-[11px] text-muted-foreground/50">Type your message...</span>
          </div>
        </div>
        <div className="rounded-lg bg-primary px-4 py-2 text-center text-[12px] font-semibold text-white shadow-md shadow-primary/20">
          Send Message
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const maskRef = useRef(null);
  const graphRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const decoLeftTopRef = useRef(null);
  const decoLeftBottomRef = useRef(null);
  const decoRightTopRef = useRef(null);
  const decoRightBottomRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const parallaxRef = useRef({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const updateFrame = useCallback(() => {
    const { x, y } = mouseRef.current;
    const px = (x - 0.5) * 2;
    const py = (y - 0.5) * 2;

    if (maskRef.current) {
      maskRef.current.style.setProperty("--mx", `${x * 100}%`);
      maskRef.current.style.setProperty("--my", `${y * 100}%`);
    }

    if (graphRef.current) {
      graphRef.current.style.setProperty("--mx", `${x * 100}%`);
      graphRef.current.style.setProperty("--my", `${y * 100}%`);
    }

    if (!reducedMotion) {
      if (blob1Ref.current) blob1Ref.current.style.transform = `translate(${px * 14}px, ${py * 14}px)`;
      if (blob2Ref.current) blob2Ref.current.style.transform = `translate(${px * -10}px, ${py * -10}px)`;
      if (blob3Ref.current) blob3Ref.current.style.transform = `translate(${px * 8}px, ${py * 18}px)`;

      const p = parallaxRef.current;
      const targetLX = px * 6;
      const targetLY = py * 5;
      const targetRX = px * -6;
      const targetRY = py * -5;
      p.leftX += (targetLX - p.leftX) * 0.08;
      p.leftY += (targetLY - p.leftY) * 0.08;
      p.rightX += (targetRX - p.rightX) * 0.08;
      p.rightY += (targetRY - p.rightY) * 0.08;

      if (leftCardRef.current) {
        leftCardRef.current.style.transform = `translate(${p.leftX}px, ${p.leftY}px)`;
      }
      if (rightCardRef.current) {
        rightCardRef.current.style.transform = `translate(${p.rightX}px, ${p.rightY}px)`;
      }

      const decoFactor = 0.04;
      if (decoLeftTopRef.current) decoLeftTopRef.current.style.transform = `translate(${px * 10}px, ${py * 8}px)`;
      if (decoLeftBottomRef.current) decoLeftBottomRef.current.style.transform = `translate(${px * 12}px, ${py * 6}px)`;
      if (decoRightTopRef.current) decoRightTopRef.current.style.transform = `translate(${px * -8}px, ${py * -10}px)`;
      if (decoRightBottomRef.current) decoRightBottomRef.current.style.transform = `translate(${px * -10}px, ${py * -8}px)`;
    }

    rafRef.current = null;
  }, [reducedMotion]);

  const handleMouseMove = useCallback(
    (e) => {
      if (reducedMotion || isMobile) return;
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateFrame);
      }
    },
    [reducedMotion, isMobile, updateFrame]
  );

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const showCursorEffect = !reducedMotion && !isMobile;

  return (
    <div
      ref={heroRef}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-hidden"
    >
      {/* ─── Background Atmosphere ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Lavender glow top-left */}
        <div
          ref={blob1Ref}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-1 18s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        {/* Blue glow bottom-right */}
        <div
          ref={blob2Ref}
          className="absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-2 22s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        {/* Pink/purple glow bottom-center */}
        <div
          ref={blob3Ref}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse, #c084fc 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-3 20s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Subtle dot grid — always visible but very faint */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(109,92,240,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Thin curved decorative lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M-100 400 Q360 200 720 400 T1540 400" stroke="#6d5cf0" strokeWidth="1.5" fill="none" />
          <path d="M-100 500 Q360 350 720 500 T1540 500" stroke="#8b5cf6" strokeWidth="1" fill="none" />
          <path d="M-100 300 Q500 150 900 300 T1540 300" stroke="#6366f1" strokeWidth="0.8" fill="none" />
        </svg>
      </div>

      {/* ─── Cursor-Reactive Reveal (graph/analytics) ─── */}
      {showCursorEffect && (
        <>
          <div
            ref={maskRef}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `
                radial-gradient(
                  ellipse 380px 380px at var(--mx, 50%) var(--my, 50%),
                  rgba(109, 92, 240, 0.06) 0%,
                  rgba(99, 102, 241, 0.02) 40%,
                  transparent 70%
                )
              `,
              WebkitMaskImage: `radial-gradient(ellipse 360px 360px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
              maskImage: `radial-gradient(ellipse 360px 360px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
              transition: "background 0.3s ease",
            }}
          />

          {/* Hidden analytics graph — revealed around cursor */}
          <div
            ref={graphRef}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              WebkitMaskImage: `radial-gradient(ellipse 300px 300px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
              maskImage: `radial-gradient(ellipse 300px 300px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
            }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="xMidYMid slice">
              {/* Chart line */}
              <path
                d="M200 550 Q320 480 440 500 T680 420 T920 380 T1160 310 T1340 280"
                stroke="url(#graphGrad)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
              />
              {/* Area fill under line */}
              <path
                d="M200 550 Q320 480 440 500 T680 420 T920 380 T1160 310 T1340 280 L1340 650 L200 650 Z"
                fill="url(#graphAreaGrad)"
                opacity="0.15"
              />
              {/* Data points */}
              <circle cx="440" cy="500" r="4" fill="#6d5cf0" opacity="0.5" />
              <circle cx="680" cy="420" r="4" fill="#6d5cf0" opacity="0.5" />
              <circle cx="920" cy="380" r="4" fill="#6d5cf0" opacity="0.5" />
              <circle cx="1160" cy="310" r="4" fill="#6d5cf0" opacity="0.5" />
              <circle cx="1340" cy="280" r="4" fill="#6d5cf0" opacity="0.5" />
              {/* Grid lines */}
              <line x1="200" y1="300" x2="1340" y2="300" stroke="#6d5cf0" strokeWidth="0.5" opacity="0.15" />
              <line x1="200" y1="400" x2="1340" y2="400" stroke="#6d5cf0" strokeWidth="0.5" opacity="0.15" />
              <line x1="200" y1="500" x2="1340" y2="500" stroke="#6d5cf0" strokeWidth="0.5" opacity="0.15" />
              <defs>
                <linearGradient id="graphGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#6d5cf0" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="graphAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6d5cf0" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6d5cf0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating analytics cards — subtly revealed */}
            <div className="absolute top-[18%] right-[22%] rounded-xl border border-primary-border/40 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg shadow-primary/[0.06]">
              <div className="text-[10px] font-medium text-muted-foreground">Total Responses</div>
              <div className="text-[22px] font-bold text-foreground mt-0.5">1,247</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 12.3%</div>
            </div>
            <div className="absolute bottom-[22%] left-[10%] rounded-xl border border-primary-border/40 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg shadow-primary/[0.06]">
              <div className="text-[10px] font-medium text-muted-foreground">Completion Rate</div>
              <div className="text-[22px] font-bold text-foreground mt-0.5">89.2%</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 3.1%</div>
            </div>
          </div>

          {/* Dot pattern revealed by cursor */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.22]"
            aria-hidden="true"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(109,92,240,0.16) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              WebkitMaskImage: `radial-gradient(ellipse 300px 300px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
              maskImage: `radial-gradient(ellipse 300px 300px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`,
            }}
          />
        </>
      )}

      {/* ─── LEFT CARD — Builder ─── */}
      <div
        ref={leftCardRef}
        className="absolute left-[4%] xl:left-[6%] top-1/2 -translate-y-[55%] z-10 hidden lg:block"
        style={{ willChange: "transform" }}
      >
        <FloatingBuilderCard
          reducedMotion={reducedMotion}
          parallaxX={0}
          parallaxY={0}
        />
      </div>

      {/* ─── RIGHT CARD — Preview ─── */}
      <div
        ref={rightCardRef}
        className="absolute right-[4%] xl:right-[6%] top-1/2 -translate-y-[45%] z-10 hidden xl:block"
        style={{ willChange: "transform" }}
      >
        <FloatingPreviewCard
          reducedMotion={reducedMotion}
          parallaxX={0}
          parallaxY={0}
        />
      </div>

      {/* ─── Decorative Annotations ─── */}
      {showCursorEffect && (
        <>
          {/* LEFT TOP: "Drag. Drop. Done." + curved arrow */}
          <div
            ref={decoLeftTopRef}
            className="absolute left-[2%] xl:left-[5%] top-[14%] z-20 hidden 2xl:block"
            style={{ willChange: "transform" }}
          >
            <div className="flex items-center gap-2">
              <svg width="60" height="28" viewBox="0 0 60 28" fill="none" className="opacity-40">
                <path d="M58 4 C40 4, 20 24, 2 20" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M8 16 L2 20 L6 24" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="rounded-full border border-primary-border/50 bg-white/80 backdrop-blur-sm px-3 py-1 shadow-sm">
                <span className="text-[11px] font-semibold text-primary/80">Drag. Drop. Done.</span>
              </div>
            </div>
          </div>

          {/* LEFT BOTTOM: "Build faster" + lightning */}
          <div
            ref={decoLeftBottomRef}
            className="absolute left-[3%] xl:left-[6%] bottom-[18%] z-20 hidden 2xl:block"
            style={{ willChange: "transform" }}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-primary-border/50 bg-white/80 backdrop-blur-sm px-3 py-1 shadow-sm flex items-center gap-1.5">
                <Icon name="star" size="xs" className="text-amber-500" />
                <span className="text-[11px] font-semibold text-primary/80">Build faster</span>
              </div>
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="opacity-40">
                <path d="M2 20 C14 6, 26 6, 38 4" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M34 0 L38 4 L34 8" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* RIGHT TOP: "Form ready!" badge */}
          <div
            ref={decoRightTopRef}
            className="absolute right-[3%] xl:right-[6%] top-[14%] z-20 hidden 2xl:block"
            style={{ willChange: "transform" }}
          >
            <div className="rounded-full border border-emerald-300/60 bg-emerald-50/90 backdrop-blur-sm px-3 py-1 shadow-sm flex items-center gap-1.5">
              <Icon name="checkCircle" size="xs" className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">Form ready!</span>
            </div>
          </div>

          {/* RIGHT BOTTOM: "Share anywhere" + share icon */}
          <div
            ref={decoRightBottomRef}
            className="absolute right-[3%] xl:right-[6%] bottom-[18%] z-20 hidden 2xl:block"
            style={{ willChange: "transform" }}
          >
            <div className="flex items-center gap-2">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="opacity-40">
                <path d="M38 4 C26 6, 14 6, 2 20" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M6 16 L2 20 L6 24" stroke="#6d5cf0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="rounded-full border border-primary-border/50 bg-white/80 backdrop-blur-sm px-3 py-1 shadow-sm flex items-center gap-1.5">
                <Icon name="send" size="xs" className="text-primary/70" />
                <span className="text-[11px] font-semibold text-primary/80">Share anywhere</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Center Content ─── */}
      <div className="relative z-20 max-w-2xl text-center space-y-5 px-5">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/80 border border-primary-border/60 px-3.5 py-1 text-[12px] font-medium text-primary"
          style={{
            animation: reducedMotion ? "none" : "hero-badge-pulse 4s ease-in-out infinite",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Building something amazing
        </div>

        {/* Headline */}
        <h1 className="font-bold tracking-tight text-foreground leading-[1.05]">
          <span className="block text-[40px] sm:text-[52px] lg:text-[64px] xl:text-[72px]">
            Create forms that
          </span>
          <span
            className="block text-[40px] sm:text-[52px] lg:text-[64px] xl:text-[72px]"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #6d5cf0 35%, #8b5cf6 65%, #a78bfa 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: reducedMotion ? "none" : "hero-gradient-shift 6s ease-in-out infinite",
            }}
          >
            just work
          </span>
        </h1>

        {/* Description */}
        <p className="text-[15px] sm:text-[16px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Design, build, and share dynamic forms in minutes. No coding required.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
          <Link
            href="/forms/new"
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="plus" size="sm" className="transition-transform duration-200 group-hover:rotate-90" />
            Create a Form
          </Link>
          <Link
            href="/forms"
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-7 py-3 text-[14px] font-semibold text-foreground transition-all duration-200 hover:bg-slate-50 hover:border-primary/25 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="folderOpen" size="sm" className="transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
            View All Forms
          </Link>
        </div>

        {/* Footer line */}
        <div className="pt-7 border-t border-border/60 w-full max-w-sm mx-auto">
          <div className="inline-flex items-center justify-center gap-5 text-[12px] text-muted-foreground/50 mx-auto flex-wrap">
            <span>Free to start</span>
            <span className="w-px h-3 bg-border shrink-0" aria-hidden="true" />
            <span>No credit card</span>
            <span className="w-px h-3 bg-border shrink-0" aria-hidden="true" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
