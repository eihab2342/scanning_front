import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

/** Never renders a raw error object/stack — only ApiError's already-humanized message, or a generic fallback. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : "Something went wrong loading this data.";

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="size-3.5" data-icon="inline-start" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
