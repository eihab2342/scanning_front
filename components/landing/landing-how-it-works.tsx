import { PublicLandingFeature } from "@/lib/public/types";
import { landingIcon } from "./landing-icons";

export function LandingHowItWorks({ title, description, steps }: { title: string; description: string; steps: PublicLandingFeature[] }) {
  if (steps.length === 0) return null;

  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = landingIcon(step.icon);
            return (
              <div key={step.title} className="relative rounded-xl border border-border bg-card p-6">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4.5 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
