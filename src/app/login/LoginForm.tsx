"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid username or password.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card variant="glass" padding="lg" className="shadow-elevated">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="email"
          required
          autoFocus
          placeholder="yourname@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[34px] text-ink-3 hover:text-ink-1"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {error && (
          <p className="text-[13px] text-danger-400 bg-danger-500/10 border border-danger-500/25 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In <ArrowRight className="size-4" />
        </Button>
      </form>
    </Card>
  );
}
