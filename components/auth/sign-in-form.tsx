"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USER } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"sign-in" | "demo" | "google" | null>(
    null
  );

  const completeSignIn = React.useCallback(
    async (sessionId: string | null | undefined) => {
      if (!sessionId) {
        throw new Error("Sign-in could not be completed. Try again.");
      }
      await setActive?.({ session: sessionId });
      router.push("/");
      router.refresh();
    },
    [router, setActive]
  );

  const signInWithPassword = React.useCallback(
    async (identifier: string, userPassword: string) => {
      if (!isLoaded || !signIn) return;

      setError(null);
      await signIn.create({ identifier });

      const attempt = await signIn.attemptFirstFactor({
        strategy: "password",
        password: userPassword,
      });

      if (attempt.status === "complete") {
        await completeSignIn(attempt.createdSessionId);
        return;
      }

      throw new Error(
        "Additional verification is required. Use “View live demo” or contact an admin."
      );
    },
    [completeSignIn, isLoaded, signIn]
  );

  const signInWithDemoToken = React.useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setError(null);
    const response = await fetch("/api/auth/demo", { method: "POST" });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof body.error === "string"
          ? body.error
          : "Demo login is not configured. Run npm run setup:demo."
      );
    }

    const attempt = await signIn.create({
      strategy: "ticket",
      ticket: body.token as string,
    });

    if (attempt.status === "complete") {
      await completeSignIn(attempt.createdSessionId);
      return;
    }

    throw new Error("Demo sign-in could not be completed.");
  }, [completeSignIn, isLoaded, signIn]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending("sign-in");
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setPending(null);
    }
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setPending("demo");
    try {
      await signInWithDemoToken();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Demo login failed. Run npm run setup:demo."
      );
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded || !signIn) return;
    setPending("google");
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setPending(null);
    }
  };

  const busy = pending !== null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_12px_40px_rgba(17,42,51,0.08)]">
      <div className="border-b border-border/60 bg-gradient-to-br from-[#f0fbff] to-white px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-display text-xs font-semibold tracking-[0.2em] text-primary">
            KRYON
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Password or one-click demo access
        </p>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
        <button
          type="button"
          onClick={() => void handleDemoLogin()}
          disabled={busy || !isLoaded}
          className={cn(
            "group w-full rounded-xl border-2 border-dashed border-primary/35 bg-primary/5 p-4 text-left transition-smooth",
            "hover:border-primary/60 hover:bg-primary/10 disabled:opacity-60"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              {pending === "demo" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">View live demo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                One click — full CRM with sample data
              </p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {DEMO_USER.email}
                <span className="mx-1.5 text-border">·</span>
                {DEMO_USER.password}
              </p>
            </div>
          </div>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or sign in</span>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full text-base" disabled={busy || !isLoaded}>
            {pending === "sign-in" ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full bg-white"
          onClick={() => void handleGoogle()}
          disabled={busy || !isLoaded}
        >
          {pending === "google" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
