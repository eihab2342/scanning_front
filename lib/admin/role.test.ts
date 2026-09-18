import { describe, it, expect } from "vitest";
import { canPerform, roleLabel } from "./role";

describe("canPerform (mirrors backend @PlatformRoles decorators exactly)", () => {
  it("super_admin can suspend/unsuspend an organization; support and billing_ops cannot", () => {
    expect(canPerform("super_admin", "organization.suspend")).toBe(true);
    expect(canPerform("support", "organization.suspend")).toBe(false);
    expect(canPerform("billing_ops", "organization.suspend")).toBe(false);
  });

  it("impersonation is super_admin and support only — billing_ops is deliberately excluded", () => {
    expect(canPerform("super_admin", "organization.impersonate")).toBe(true);
    expect(canPerform("support", "organization.impersonate")).toBe(true);
    expect(canPerform("billing_ops", "organization.impersonate")).toBe(false);
  });

  it("commercial writes (subscription/plan/feature) are super_admin and billing_ops only — support is read-only", () => {
    for (const action of ["organization.update_subscription", "subscription.override_write", "plan.write", "feature.write", "plan_feature.write"] as const) {
      expect(canPerform("super_admin", action)).toBe(true);
      expect(canPerform("billing_ops", action)).toBe(true);
      expect(canPerform("support", action)).toBe(false);
    }
  });

  it("returns false for a null/undefined role rather than throwing", () => {
    expect(canPerform(null, "plan.write")).toBe(false);
    expect(canPerform(undefined, "plan.write")).toBe(false);
  });

  it("platform settings (brand/public-site/SEO/legal copy) are super_admin only", () => {
    expect(canPerform("super_admin", "platform_settings.manage")).toBe(true);
    expect(canPerform("billing_ops", "platform_settings.manage")).toBe(false);
    expect(canPerform("support", "platform_settings.manage")).toBe(false);
  });

  it("CMS pages + landing content (features/FAQ) are super_admin only, same bucket as platform settings", () => {
    expect(canPerform("super_admin", "content.manage")).toBe(true);
    expect(canPerform("billing_ops", "content.manage")).toBe(false);
    expect(canPerform("support", "content.manage")).toBe(false);
  });

  it("cash payment review is super_admin + billing_ops — same as any other subscription-activating write", () => {
    expect(canPerform("super_admin", "cash_payment.review")).toBe(true);
    expect(canPerform("billing_ops", "cash_payment.review")).toBe(true);
    expect(canPerform("support", "cash_payment.review")).toBe(false);
  });
});

describe("roleLabel", () => {
  it("formats each platform role for display", () => {
    expect(roleLabel("super_admin")).toBe("Super Admin");
    expect(roleLabel("support")).toBe("Support");
    expect(roleLabel("billing_ops")).toBe("Billing Ops");
  });
});
