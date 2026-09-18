import type { Metadata } from "next";
import { CmsPageView } from "@/components/landing/cms-page-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <CmsPageView slug="privacy" />;
}
