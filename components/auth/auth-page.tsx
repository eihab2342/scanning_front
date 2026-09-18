"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, ApiError } from "@/lib/auth/auth-context";
import { APP_NAME } from "@/lib/branding";

type Mode = "login" | "signup";

/**
 * Backs both /login and /signup — one real form, two distinct URLs (see the
 * public-routing phase brief). Switching mode navigates between the two
 * routes rather than just flipping local state, so the address bar always
 * matches what's on screen.
 */
export function AuthPage({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const { user, isInitializing, login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mode = initialMode;

  useEffect(() => {
    if (!isInitializing && user) router.replace("/dashboard");
  }, [isInitializing, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(organizationName, email, password);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">{mode === "login" ? "Sign in" : "Create your organization"}</CardTitle>
          <CardDescription>{APP_NAME} — security scanning dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="organizationName">Organization name</Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="organization"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create organization"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setError(null);
              router.push(mode === "login" ? "/signup" : "/login");
            }}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? "New here? Create an organization" : "Already have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
