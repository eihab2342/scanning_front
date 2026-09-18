import { SettingsSectionForm } from "./settings-section-form";
import { AdminLandingFeaturesTab } from "./admin-landing-features-tab";

export function WebsiteHowItWorksTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm
        title="Heading"
        fields={[
          { key: "howItWorksTitle", label: "Title", maxLength: 120 },
          { key: "howItWorksDescription", label: "Subheading", type: "textarea", maxLength: 300 },
        ]}
      />
      <div>
        <h4 className="mb-2 text-sm font-medium text-foreground">Steps</h4>
        <AdminLandingFeaturesTab section="how_it_works" itemLabel="step" emptyLabel="No steps yet" />
      </div>
    </div>
  );
}
