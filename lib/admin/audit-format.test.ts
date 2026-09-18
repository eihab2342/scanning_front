import { describe, it, expect } from "vitest";
import { formatAdminAction } from "./audit-format";

describe("formatAdminAction", () => {
  it("strips the admin. prefix and humanizes underscores", () => {
    expect(formatAdminAction("admin.organization_suspended")).toBe("Organization suspended");
  });

  it("handles plan./feature./subscription. prefixes the same way", () => {
    expect(formatAdminAction("plan.created")).toBe("Created");
    expect(formatAdminAction("feature.archived")).toBe("Archived");
    expect(formatAdminAction("subscription.override_created")).toBe("Override created");
  });

  it("leaves an action with no recognized prefix as-is (just capitalized)", () => {
    expect(formatAdminAction("scan.denied")).toBe("Scan.denied");
  });
});
