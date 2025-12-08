"use client";

import { forwardRef } from "react";

const STEPS = [
  {
    step: "01",
    title: "Enter your topic",
    desc: "Briefly describe what you want to post about.",
  },
  {
    step: "02",
    title: "Customize tone",
    desc: "Choose from professional, casual, or storytelling styles.",
  },
  {
    step: "03",
    title: "Copy & Post",
    desc: "Review the generated content and post directly to LinkedIn.",
  },
];

export const HowItWorksSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              From idea to published post in 3 steps
            </h2>
            <div className="space-y-8">
              {STEPS.map((item, i) => (
                <div key={i} className="step-item flex gap-6">
                  <div className="text-4xl font-bold text-blue-100 dark:text-blue-900/50">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[500px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="h-full w-full bg-background rounded-xl overflow-hidden relative">
              {/* Abstract UI representation */}
              <div className="absolute top-0 left-0 w-full h-12 border-b bg-muted/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-8 pt-20 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted/30 rounded w-full mt-8"></div>
                <div className="flex justify-end mt-4">
                  <div className="h-10 w-24 bg-blue-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
