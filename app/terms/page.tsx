import type { Metadata } from "next";
import { CmsPageView } from "@/components/landing/cms-page-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <CmsPageView slug="terms" />;
}
