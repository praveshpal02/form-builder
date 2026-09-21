"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";

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

export default function HeroSection() {
  const heroRef = useRef(null);
  const maskRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const updateMask = useCallback(() => {
    const { x, y } = mouseRef.current;

    if (maskRef.current) {
      maskRef.current.style.setProperty("--mx", `${x * 100}%`);
      maskRef.current.style.setProperty("--my", `${y * 100}%`);
    }

    if (!reducedMotion) {
      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${px * 12}px, ${py * 12}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${px * -8}px, ${py * -8}px)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${px * 6}px, ${py * 16}px)`;
      }
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
        rafRef.current = requestAnimationFrame(updateMask);
      }
    },
    [reducedMotion, isMobile, updateMask]
  );

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const showCursorEffect = !reducedMotion && !isMobile;

  return (
    <div
      ref={heroRef}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-hidden"
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          ref={blob1Ref}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #0a0a0a 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-1 18s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          ref={blob2Ref}
          className="absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #262626 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-2 22s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          ref={blob3Ref}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, #404040 0%, transparent 70%)",
            animation: reducedMotion ? "none" : "hero-blob-drift-3 20s ease-in-out infinite",
            willChange: "transform",
          }}
        />
      </div>

      {/* Cursor-reactive reveal layer */}
      {showCursorEffect && (
        <div
          ref={maskRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(
                ellipse 320px 320px at var(--mx, 50%) var(--my, 50%),
                rgba(10, 10, 10, 0.03) 0%,
                rgba(40, 40, 40, 0.015) 40%,
                transparent 70%
              )
            `,
            WebkitMaskImage: `radial-gradient(
              ellipse 300px 300px at var(--mx, 50%) var(--my, 50%),
              black 0%,
              transparent 100%
            )`,
            maskImage: `radial-gradient(
              ellipse 300px 300px at var(--mx, 50%) var(--my, 50%),
              black 0%,
              transparent 100%
            )`,
            transition: "background 0.3s ease",
          }}
        />
      )}

      {/* Subtle dot pattern revealed by cursor */}
      {showCursorEffect && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(10,10,10,0.1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            WebkitMaskImage: `radial-gradient(
              ellipse 280px 280px at var(--mx, 50%) var(--my, 50%),
              black 0%,
              transparent 100%
            )`,
            maskImage: `radial-gradient(
              ellipse 280px 280px at var(--mx, 50%) var(--my, 50%),
              black 0%,
              transparent 100%
            )`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-6 px-5">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] px-3 py-1 text-[12px] font-medium text-foreground/70"
          style={{
            animation: reducedMotion ? "none" : "hero-badge-pulse 4s ease-in-out infinite",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-foreground/40"
            style={{
              animation: reducedMotion ? "none" : "hero-badge-pulse 2s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          Building something amazing
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Create forms that
          <br />
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #0a0a0a, #404040, #0a0a0a)",
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
        <p className="text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Design, build, and share dynamic forms in minutes. No coding required.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <Link
            href="/forms/new"
            className="group relative inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-6 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create a Form
          </Link>
          <Link
            href="/forms"
            className="group relative inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-white px-6 py-2.5 text-[13px] font-medium text-foreground transition-all duration-200 hover:bg-muted hover:border-foreground/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 016 16.5h10.5A2.25 2.25 0 0118 18.75V21m-15-15h15m0 0h.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H6a2.25 2.25 0 00-2.25 2.25"
              />
            </svg>
            View All Forms
          </Link>
        </div>

        {/* Footer line */}
        <div className="flex items-center justify-center gap-5 text-[12px] text-muted-foreground/50 pt-8 border-t border-border w-full max-w-sm">
          <span>Free to start</span>
          <span className="w-px h-3 bg-border" aria-hidden="true" />
          <span>No credit card</span>
          <span className="w-px h-3 bg-border" aria-hidden="true" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
