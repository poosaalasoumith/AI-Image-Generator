import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { AuthSync } from "@/components/auth-sync";
import { Toaster } from "sonner";
import GlobalLoading from "@/app/loading";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate stunning AI images with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#52525b", // zinc-500 for a silver/premium look
              },
              elements: {
                card: "shadow-xl border border-zinc-200 dark:border-zinc-800",
              }
            }}
          >
            <ClerkLoading>
              <div className="fixed inset-0 z-[100] bg-background">
                <GlobalLoading />
              </div>
            </ClerkLoading>
            <AuthSync />
            <TooltipProvider>
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Toaster />
            </TooltipProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
