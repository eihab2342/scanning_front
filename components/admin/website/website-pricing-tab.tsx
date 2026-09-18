import { SettingsSectionForm } from "./settings-section-form";

export function WebsitePricingTab() {
  return (
    <SettingsSectionForm
      title="Heading"
      description="The plan cards themselves come from Plans, not here."
      fields={[
        { key: "pricingTitle", label: "Title", maxLength: 120 },
        { key: "pricingDescription", label: "Subheading", type: "textarea", maxLength: 300 },
      ]}
    />
  );
}
