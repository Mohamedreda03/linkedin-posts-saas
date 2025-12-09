"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What platforms does PostCraft AI support?",
    answer: "PostCraft AI supports all major social media platforms including LinkedIn, Twitter (X), Facebook, and Instagram. We're constantly adding more platforms based on user feedback.",
  },
  {
    question: "How does the AI generate content?",
    answer: "Our AI uses advanced language models trained on millions of successful social media posts. It understands context, tone, and platform-specific best practices to create engaging content tailored to your needs.",
  },
  {
    question: "Can I customize the AI's writing style?",
    answer: "Absolutely! You can define your brand voice, preferred tone (professional, casual, humorous), and even provide examples for the AI to learn from. The more you use it, the better it gets at matching your style.",
  },
  {
    question: "Is my content private and secure?",
    answer: "Yes, we take privacy seriously. Your content is encrypted and never shared with third parties. You retain full ownership of everything you create.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no questions asked. Your access will continue until the end of your billing period.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! Our Free plan gives you 10 posts per month forever. You can upgrade to Pro anytime to unlock unlimited posts and advanced features.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-xl bg-card overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "px-6 overflow-hidden transition-all duration-300",
                  openIndex === index ? "pb-4 max-h-96" : "max-h-0"
                )}
              >
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
