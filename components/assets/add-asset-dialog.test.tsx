import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddAssetDialog } from "./add-asset-dialog";
import { renderWithQueryClient } from "@/test/test-utils";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

import { apiFetch } from "@/lib/api/client";
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockPush.mockReset();
});

describe("AddAssetDialog", () => {
  it("submits the exact hostname and verification method the user entered", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockResolvedValue({
      asset: { id: "asset-new", hostname: "example.com", type: "domain", ownershipStatus: "pending", verificationMethod: "http_file", verifiedAt: null, lastCheckedAt: null, createdAt: "2026-09-01T00:00:00.000Z", consecutiveFailedChecks: 0, challenge: { method: "http_file", url: "https://example.com/x", path: "/x", content: "tok" } },
      verificationInstructions: "...",
    });

    renderWithQueryClient(<AddAssetDialog open onOpenChange={vi.fn()} atLimit={false} />);

    await user.type(screen.getByLabelText("Domain"), "Example.com");
    await user.click(screen.getByRole("button", { name: /http file/i }));
    await user.click(screen.getByRole("button", { name: /^add asset$/i }));

    await vi.waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith("/assets", expect.objectContaining({ method: "POST" })));
    const [, options] = mockedApiFetch.mock.calls[0];
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ type: "domain", value: "example.com", verificationMethod: "http_file" });
    expect(mockPush).toHaveBeenCalledWith("/assets/asset-new");
  });

  it("shows the limit-reached explanation and does not render the form when atLimit is true", () => {
    renderWithQueryClient(<AddAssetDialog open onOpenChange={vi.fn()} atLimit limitDescription="Your current plan allows up to 5 assets." />);

    expect(screen.getByText("Your current plan allows up to 5 assets.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Domain")).not.toBeInTheDocument();
  });

  it("surfaces a race-condition limit error from the backend without a raw exception", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockRejectedValue(new ApiError(403, "This organization's asset limit has been reached for its current plan"));

    renderWithQueryClient(<AddAssetDialog open onOpenChange={vi.fn()} atLimit={false} />);

    await user.type(screen.getByLabelText("Domain"), "example.com");
    await user.click(screen.getByRole("button", { name: /^add asset$/i }));

    expect(await screen.findByText("This organization's asset limit has been reached for its current plan")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
