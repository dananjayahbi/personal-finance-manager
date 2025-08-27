import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Finance Manager",
  description: "Take control of your financial future with our comprehensive personal finance management app. Track expenses, manage budgets, and achieve your financial goals.",
  keywords: ["Personal Finance", "Budgeting", "Expense Tracking", "Financial Goals", "Money Management"],
  authors: [{ name: "Finance Manager Team" }],
  openGraph: {
    title: "Personal Finance Manager",
    description: "Track expenses, manage budgets, and achieve your financial goals",
    siteName: "Personal Finance Manager",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Finance Manager",
    description: "Track expenses, manage budgets, and achieve your financial goals",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
