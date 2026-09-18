import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero({
  badgeText,
  heroTitle,
  heroDescription,
}: {
  badgeText: string;
  heroTitle: string;
  heroDescription: string;
}) {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
          {badgeText}
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{heroTitle}</h1>

        <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">{heroDescription}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
            Get Started
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<a href="#how-it-works" />}>
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
}
