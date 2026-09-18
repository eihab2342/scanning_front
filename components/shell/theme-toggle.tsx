"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

/** Avoids a hydration mismatch: the server has no notion of the persisted theme, so the icon only reflects the real value once mounted client-side. */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
