import { PublicLandingFeature } from "@/lib/public/types";
import { landingIcon } from "./landing-icons";

export function LandingSecurity({ title, description, points }: { title: string; description: string; points: PublicLandingFeature[] }) {
  if (points.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {points.map((point) => {
            const Icon = landingIcon(point.icon);
            return (
              <div key={point.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4.5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
