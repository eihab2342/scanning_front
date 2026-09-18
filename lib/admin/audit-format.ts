/** "admin.organization_suspended" -> "Organization suspended" — a readable label with no invented meaning, just formatting the real action string. */
export function formatAdminAction(action: string): string {
  const withoutPrefix = action.replace(/^(admin|plan|feature|subscription)\./, "");
  const spaced = withoutPrefix.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
