import { SettingsSectionForm } from "./settings-section-form";

export function WebsiteGeneralTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm
        title="Brand"
        fields={[
          { key: "platformName", label: "Platform name", maxLength: 120 },
          { key: "logoUrl", label: "Logo URL", type: "url" },
        ]}
      />
      <SettingsSectionForm
        title="Support"
        fields={[
          { key: "supportEmail", label: "Support email", type: "email" },
          { key: "supportUrl", label: "Support URL", type: "url" },
          { key: "contactUrl", label: "Contact URL", type: "url", description: "Used only when no support email is set." },
        ]}
      />
      <SettingsSectionForm
        title="SEO"
        fields={[
          { key: "seoTitle", label: "SEO title", maxLength: 160, description: "Falls back to the hero title, then the platform name." },
          { key: "seoDescription", label: "SEO description", type: "textarea", maxLength: 300 },
        ]}
      />
      <SettingsSectionForm
        title="Legal"
        description="Optional — leave blank to use the real in-app /terms and /privacy pages (editable from the Pages tab). Set a URL here only to point at terms/privacy hosted elsewhere instead."
        fields={[
          { key: "termsUrl", label: "Terms URL (override)", type: "url" },
          { key: "privacyUrl", label: "Privacy URL (override)", type: "url" },
        ]}
      />
    </div>
  );
}
