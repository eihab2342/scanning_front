import { PublicLandingFeature } from "@/lib/public/types";
import { landingIcon } from "./landing-icons";

export function LandingFeatures({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: PublicLandingFeature[];
}) {
  if (features.length === 0) return null;

  return (
    <section id="features" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = landingIcon(feature.icon);
            return (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-5">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
