import { SettingsSectionForm } from "./settings-section-form";

export function WebsiteHeroTab() {
  return (
    <SettingsSectionForm
      title="Hero"
      description="The top banner of the landing page."
      fields={[
        { key: "heroBadgeText", label: "Badge", maxLength: 60, description: "The small pill above the hero heading." },
        { key: "heroTitle", label: "Title", maxLength: 160 },
        { key: "heroDescription", label: "Description", type: "textarea", maxLength: 500 },
      ]}
    />
  );
}
