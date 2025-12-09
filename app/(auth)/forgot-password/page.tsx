"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
              Check your email for a link to reset your password. If it
              doesn&apos;t appear within a few minutes, check your spam folder.
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full h-11" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center text-sm">
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
