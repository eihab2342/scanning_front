"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Accessible copy-to-clipboard affordance — never uses alert(); feedback is a brief inline icon/label swap. */
export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (insecure context, permission denial) — fail silently, the value is still visible to select/copy manually.
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className={cn("shrink-0", className)} aria-label={copied ? "Copied" : label}>
      {copied ? <Check className="size-3.5" data-icon="inline-start" /> : <Copy className="size-3.5" data-icon="inline-start" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
