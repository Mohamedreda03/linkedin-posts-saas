"use client";

import { forwardRef } from "react";
import { Zap, Layout, Share2 } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Instant Generation",
    description:
      "Generate high-quality posts from just a few keywords or a topic idea in seconds.",
  },
  {
    icon: <Layout className="w-6 h-6 text-blue-500" />,
    title: "Perfect Formatting",
    description:
      "Get posts formatted specifically for LinkedIn's algorithm with proper spacing and hooks.",
  },
  {
    icon: <Share2 className="w-6 h-6 text-green-500" />,
    title: "Engagement Optimized",
    description:
      "AI models trained on viral posts to maximize likes, comments, and shares.",
  },
];

export const FeaturesSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to go viral
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to help you create content that resonates
            with your network.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="feature-card p-8 rounded-2xl bg-background border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-background border shadow-sm flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";
