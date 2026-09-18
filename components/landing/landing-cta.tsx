import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCta({ title, description }: { title: string; description: string }) {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>
        <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
          Get Started
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
