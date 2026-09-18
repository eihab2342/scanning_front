import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerificationPanel } from "./verification-panel";
import { renderWithQueryClient } from "@/test/test-utils";
import { makeAsset, makeHttpAsset } from "@/test/fixtures";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});

import { apiFetch } from "@/lib/api/client";
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
});

describe("VerificationPanel — DNS TXT", () => {
  it("renders the exact backend-provided host and value, not a client-invented format", () => {
    const asset = makeAsset({ challenge: { method: "dns_txt", recordType: "TXT", host: "example.com", value: "future-verify=9f8e7d6c" } });
    renderWithQueryClient(<VerificationPanel asset={asset} canVerify />);

    expect(screen.getByText("TXT")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("future-verify=9f8e7d6c")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify dns record/i })).toBeInTheDocument();
  });

  it("shows a loading state and disables the button while a check is in flight", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation(() => new Promise(() => {}));
    renderWithQueryClient(<VerificationPanel asset={makeAsset()} canVerify />);

    await user.click(screen.getByRole("button", { name: /verify dns record/i }));

    const button = await screen.findByRole("button", { name: /checking/i });
    expect(button).toBeDisabled();
  });

  it("renders a failed check safely — the backend detail message, not a raw exception", async () => {
    const user = userEvent.setup();
    const asset = makeAsset();
    mockedApiFetch.mockResolvedValue({
      asset,
      verificationInstructions: "...",
      checkDetail: 'TXT record "future-verify=abc-123-def" not found on example.com',
    });

    renderWithQueryClient(<VerificationPanel asset={asset} canVerify />);
    await user.click(screen.getByRole("button", { name: /verify dns record/i }));

    expect(await screen.findByText(/we couldn't verify ownership yet/i)).toBeInTheDocument();
    expect(screen.getByText(/TXT record "future-verify=abc-123-def" not found on example.com/)).toBeInTheDocument();
  });

  it("shows a 'requires re-verification' banner when a previous automatic check failed", () => {
    const asset = makeAsset({ consecutiveFailedChecks: 1 });
    renderWithQueryClient(<VerificationPanel asset={asset} canVerify />);
    expect(screen.getByText(/automatic recheck failed/i)).toBeInTheDocument();
  });

  it("hides the Verify button (assets.verify follows permission, not role) when the caller lacks assets.verify", () => {
    const asset = makeAsset();
    renderWithQueryClient(<VerificationPanel asset={asset} canVerify={false} />);
    expect(screen.queryByRole("button", { name: /verify dns record/i })).not.toBeInTheDocument();
    expect(screen.getByText(/don't have permission to verify/i)).toBeInTheDocument();
  });
});

describe("VerificationPanel — HTTP file", () => {
  it("renders the exact backend-provided URL and file contents", () => {
    const asset = makeHttpAsset();
    renderWithQueryClient(<VerificationPanel asset={asset} canVerify />);

    expect(screen.getByText(asset.challenge.method === "http_file" ? asset.challenge.url : "")).toBeInTheDocument();
    expect(screen.getByText(asset.challenge.method === "http_file" ? asset.challenge.content : "")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify file/i })).toBeInTheDocument();
  });

  it("a successful check reports success via the mutation result", async () => {
    const user = userEvent.setup();
    const asset = makeHttpAsset();
    const verified = { ...asset, ownershipStatus: "verified" as const, verifiedAt: "2026-09-17T00:00:00.000Z" };
    mockedApiFetch.mockResolvedValue({ asset: verified, verificationInstructions: "...", checkDetail: "Found token in https://example.com/x" });

    renderWithQueryClient(<VerificationPanel asset={asset} canVerify />);
    await user.click(screen.getByRole("button", { name: /verify file/i }));

    await vi.waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith(`/assets/${asset.id}/verify`, expect.objectContaining({ method: "POST" })));
    expect(screen.queryByText(/we couldn't verify ownership yet/i)).not.toBeInTheDocument();
  });
});
