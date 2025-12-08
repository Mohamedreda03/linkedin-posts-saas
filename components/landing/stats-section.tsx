"use client";

import { forwardRef } from "react";

const STATS = [
  { number: "10k+", label: "Posts Generated" },
  { number: "500+", label: "Happy Users" },
  { number: "1M+", label: "Views Generated" },
  { number: "4.9/5", label: "User Rating" },
];

export const StatsSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = "StatsSection";
