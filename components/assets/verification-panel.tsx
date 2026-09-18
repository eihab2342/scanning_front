"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Info, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/common/copy-button";
import { useVerifyAsset } from "@/lib/api/use-assets";
import { Asset } from "@/lib/api/types";
import { verificationMethodLabel } from "@/lib/asset-format";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

function ChallengeField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className={cn("min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs", mono && "font-mono")}>{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function VerificationPanel({ asset, canVerify }: { asset: Asset; canVerify: boolean }) {
  const verify = useVerifyAsset(asset.id);
  const [lastResult, setLastResult] = useState<{ verified: boolean; detail: string } | null>(null);
  const requiresReverification = asset.consecutiveFailedChecks > 0;

  async function handleVerify() {
    setLastResult(null);
    try {
      const result = await verify.mutateAsync();
      setLastResult({ verified: result.asset.ownershipStatus === "verified", detail: result.checkDetail });
      if (result.asset.ownershipStatus === "verified") {
        toast.success("Ownership verified.");
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not run the verification check.");
    }
  }

  const challenge = asset.challenge;
  const verifyLabel = challenge.method === "dns_txt" ? "Verify DNS Record" : "Verify File";

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium">Verify ownership — {verificationMethodLabel(asset.verificationMethod)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        {requiresReverification ? (
          <Alert>
            <Info />
            <AlertDescription>
              This asset was previously verified, but an automatic recheck failed. Re-verify ownership to restore scanning.
            </AlertDescription>
          </Alert>
        ) : null}

        {challenge.method === "dns_txt" ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_2fr]">
              <ChallengeField label="Type" value="TXT" mono={false} />
              <ChallengeField label="Host" value={challenge.host} />
              <ChallengeField label="Value" value={challenge.value} />
            </div>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open your DNS provider.</li>
              <li>Add the TXT record shown above.</li>
              <li>Save the DNS change.</li>
              <li>DNS propagation may take some time.</li>
              <li>Return here and click Verify.</li>
            </ol>
          </>
        ) : (
          <>
            <ChallengeField label="File URL" value={challenge.url} />
            <ChallengeField label="File contents" value={challenge.content} />
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadTextFile(challenge.path.split("/").pop() ?? "verification.txt", challenge.content)}
              >
                <Download className="size-3.5" data-icon="inline-start" />
                Download verification file
              </Button>
            </div>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Download or create the verification file above.</li>
              <li>Place it at the exact path shown in the file URL.</li>
              <li>Make sure it&apos;s publicly accessible over HTTPS.</li>
              <li>Return here and click Verify.</li>
            </ol>
          </>
        )}

        {lastResult && !lastResult.verified ? (
          <Alert>
            <Info />
            <AlertDescription>We couldn&apos;t verify ownership yet. {lastResult.detail}</AlertDescription>
          </Alert>
        ) : null}

        {canVerify ? (
          <div>
            <Button onClick={handleVerify} disabled={verify.isPending}>
              {verify.isPending ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <CheckCircle2 className="size-4" data-icon="inline-start" />
              )}
              {verify.isPending ? "Checking…" : verifyLabel}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You don&apos;t have permission to verify this asset — ask an admin or owner.</p>
        )}
      </CardContent>
    </Card>
  );
}
