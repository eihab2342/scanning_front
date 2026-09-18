import { ScanDetailPage } from "@/components/scans/scan-detail-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScanDetailPage id={id} />;
}
