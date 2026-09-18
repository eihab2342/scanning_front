import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  it("copies the value to the clipboard and shows accessible 'Copied' feedback, not an alert()", async () => {
    // userEvent.setup() installs its own jsdom clipboard polyfill, so the
    // test's mock must be defined after setup() to win — defining it first
    // (e.g. in beforeEach) gets silently overwritten by userEvent's own stub.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const alertSpy = vi.spyOn(window, "alert");

    render(<CopyButton value="future-verify=abc-123" label="Copy value" />);

    await user.click(screen.getByRole("button", { name: "Copy value" }));

    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("future-verify=abc-123");
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
