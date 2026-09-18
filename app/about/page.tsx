import type { Metadata } from "next";
import { CmsPageView } from "@/components/landing/cms-page-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <CmsPageView slug="about" />;
}
