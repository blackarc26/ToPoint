import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Birthday Research Intelligence",
  description: "Why people stop celebrating birthdays — emotional insight discovery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-sans antialiased">{children}</body>
    </html>
  );
}
