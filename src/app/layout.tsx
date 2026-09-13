import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenC Cohort Leaderboard 🏆",
  description: "Fair, momentum-driven creator leaderboard for the GenC community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F17] text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
