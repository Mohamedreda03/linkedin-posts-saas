"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Import sub-components
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  CTASection,
  Footer,
} from "./landing/index";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Hero Animation
      const tl = gsap.timeline();
      tl.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      }).from(
        ".hero-image",
        {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.5"
      );

      // Features Animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      // How It Works Animation
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
      });

      // Stats Animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });

      // CTA Animation
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      <Navbar />
      <HeroSection ref={heroRef} />
      <FeaturesSection ref={featuresRef} />
      <HowItWorksSection ref={howItWorksRef} />
      <StatsSection ref={statsRef} />
      <CTASection ref={ctaRef} />
      <Footer />
    </div>
  );
}
