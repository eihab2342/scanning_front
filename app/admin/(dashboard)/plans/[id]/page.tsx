import { AdminPlanDetailPage } from "@/components/admin/plans/detail/admin-plan-detail-page";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPlanDetailPage planId={id} />;
}
