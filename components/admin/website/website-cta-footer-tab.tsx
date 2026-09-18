import { SettingsSectionForm } from "./settings-section-form";

export function WebsiteCtaFooterTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm
        title="Bottom CTA"
        fields={[
          { key: "ctaTitle", label: "Title", maxLength: 160 },
          { key: "ctaDescription", label: "Subheading", type: "textarea", maxLength: 300 },
        ]}
      />
      <SettingsSectionForm
        title="Footer"
        fields={[{ key: "footerText", label: "Footer text", maxLength: 300, description: "Falls back to a generated copyright line when left blank." }]}
      />
    </div>
  );
}
