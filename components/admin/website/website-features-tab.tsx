import { SettingsSectionForm } from "./settings-section-form";
import { AdminLandingFeaturesTab } from "./admin-landing-features-tab";

export function WebsiteFeaturesTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm
        title="Heading"
        fields={[
          { key: "featuresSectionTitle", label: "Title", maxLength: 120 },
          { key: "featuresSectionDescription", label: "Subheading", type: "textarea", maxLength: 300 },
        ]}
      />
      <div>
        <h4 className="mb-2 text-sm font-medium text-foreground">Feature cards</h4>
        <AdminLandingFeaturesTab section="features" itemLabel="feature" emptyLabel="No features yet" />
      </div>
    </div>
  );
}
