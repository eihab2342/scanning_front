import { AdminOrgDetailPage } from "@/components/admin/organizations/detail/admin-org-detail-page";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrgDetailPage organizationId={id} />;
}
