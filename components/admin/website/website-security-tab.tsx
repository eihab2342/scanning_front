import { SettingsSectionForm } from "./settings-section-form";
import { AdminLandingFeaturesTab } from "./admin-landing-features-tab";

export function WebsiteSecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm
        title="Heading"
        fields={[
          { key: "securityTitle", label: "Title", maxLength: 120 },
          { key: "securityDescription", label: "Subheading", type: "textarea", maxLength: 300 },
        ]}
      />
      <div>
        <h4 className="mb-2 text-sm font-medium text-foreground">Points</h4>
        <AdminLandingFeaturesTab section="security" itemLabel="point" emptyLabel="No security points yet" />
      </div>
    </div>
  );
}
