import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/navbar";

import { ClerkProvider } from "@clerk/nextjs";

// const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Serif({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus: AI-Search Assistant",
  description:
    "An AI-powered search assistant that centralizes information from various work applications, allowing users to quickly find and access data across platforms like Gmail, Slack, Jira, and Google Drive. It uses search APIs to fetch information in real time without storing data, ensuring security and privacy. It supports multi-account integration and offers features like instant answers to work-related queries, document generation with source references, and streamlined search capabilities, enhancing team productivity and efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${noto.className} bg-neutral relative`}>
          <div id="drawer-portal"></div>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
