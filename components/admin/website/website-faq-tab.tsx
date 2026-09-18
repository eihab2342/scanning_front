import { SettingsSectionForm } from "./settings-section-form";
import { AdminLandingFaqTab } from "./admin-landing-faq-tab";

export function WebsiteFaqTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSectionForm title="Heading" fields={[{ key: "faqTitle", label: "Title", maxLength: 120 }]} />
      <div>
        <h4 className="mb-2 text-sm font-medium text-foreground">Questions</h4>
        <AdminLandingFaqTab />
      </div>
    </div>
  );
}
