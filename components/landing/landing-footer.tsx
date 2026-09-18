import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PublicPlatformConfig } from "@/lib/public/types";

export function LandingFooter({ config }: { config: PublicPlatformConfig }) {
  const year = new Date().getFullYear();

  const links: Array<{ label: string; href: string }> = [{ label: "About", href: "/about" }];
  if (config.supportUrl) links.push({ label: "Support", href: config.supportUrl });
  if (config.supportEmail) links.push({ label: "Contact", href: `mailto:${config.supportEmail}` });
  else if (config.contactUrl) links.push({ label: "Contact", href: config.contactUrl });
  // termsUrl/privacyUrl in PlatformSettings are an optional external
  // override (e.g. terms hosted elsewhere) — absent, these fall back to the
  // real in-app pages editable from /admin/settings/pages (CmsPage).
  links.push({ label: "Terms", href: config.termsUrl || "/terms" });
  links.push({ label: "Privacy", href: config.privacyUrl || "/privacy" });

  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">{config.platformName}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          {links.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </a>
            ),
          )}
        </nav>

        <p className="text-xs text-muted-foreground">{config.footerText || `© ${year} ${config.platformName}. All rights reserved.`}</p>
      </div>
    </footer>
  );
}
