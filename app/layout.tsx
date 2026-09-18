import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { PermissionsProvider } from "@/lib/auth/permissions-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Dashboard`,
  description: "Manage verified assets, security scans, and reports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <PermissionsProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </PermissionsProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
