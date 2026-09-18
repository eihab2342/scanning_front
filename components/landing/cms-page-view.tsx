import { notFound } from "next/navigation";
import { getPublicConfig, getPublicPage } from "@/lib/public/api";
import { LandingHeader } from "./landing-header";
import { LandingFooter } from "./landing-footer";

// Renders one of the fixed CmsPage slugs (terms/privacy/about) inside the
// same header/footer chrome as the landing page. contentHtml is already
// sanitized server-side (see renderMarkdownSafe) before it ever reaches here.
export async function CmsPageView({ slug }: { slug: string }) {
  const [config, page] = await Promise.all([getPublicConfig(), getPublicPage(slug)]);
  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader platformName={config.platformName} />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{page.title}</h1>
          <div
            className="mt-6 flex flex-col gap-4 text-sm text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
          />
        </article>
      </main>
      <LandingFooter config={config} />
    </div>
  );
}
