import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CrmProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Jara CRM",
  description: "WhatsApp-led sales follow-up CRM for Nigerian B2B teams"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}
