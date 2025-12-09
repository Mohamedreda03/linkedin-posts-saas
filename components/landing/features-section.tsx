"use client";

import { 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  BarChart3, 
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";

const platforms = [
  { icon: Linkedin, name: "LinkedIn", color: "text-blue-600" },
  { icon: Twitter, name: "Twitter", color: "text-sky-500" },
  { icon: Facebook, name: "Facebook", color: "text-blue-500" },
  { icon: Instagram, name: "Instagram", color: "text-pink-500" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description: "Generate engaging posts with our advanced AI that understands your brand voice and audience.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Create professional content in seconds, not hours. Save time and boost productivity.",
  },
  {
    icon: Target,
    title: "Platform Optimized",
    description: "Content automatically tailored for each platform's best practices and character limits.",
  },
  {
    icon: Clock,
    title: "Schedule & Publish",
    description: "Plan your content calendar and publish directly to your connected accounts.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track engagement, growth, and performance across all your social platforms.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Create content in multiple languages to reach a global audience.",
  },
];

export function PlatformsSection() {
  return (
    <section className="py-16 px-4 border-y bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Create content for all major platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <platform.icon className={`w-6 h-6 ${platform.color}`} />
              <span className="font-medium">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you create, manage, and grow your social media presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
