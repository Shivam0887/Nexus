import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/navbar";

import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { StateType } from "@/lib/types";
import { UserProvider } from "@/hooks/useUser";
import { ModalProvider } from "@/hooks/useModalSelection";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus: AI-Search Assistant",
  description:
    "An AI-powered search assistant that centralizes information from various work applications, allowing users to quickly find and access data across platforms like Gmail, Slack, Jira, and Google Drive. It uses search APIs to fetch information in real time without storing data, ensuring security and privacy. It supports multi-account integration and offers features like instant answers to work-related queries, document generation with source references, and streamlined search capabilities, enhancing team productivity and efficiency.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  await ConnectToDB();
  const user = await User.findOne<UserType>({
    userId,
  });

  const userData: StateType = {
    coverImage: "",
    email: user?.email ?? "",
    hasPasskey: Boolean(user?.hasPasskey),
    hasSubscription: false,
    imageUrl: user?.imageUrl ?? "",
    isAISearch: Boolean(user?.isAISearch),
    plan: "Starter",
    shouldRemember: Boolean(user?.shouldRemember),
    username: user?.username ?? "",
    GOOGLE_CALENDAR: {
      connectionStatus: Number(!!user?.GOOGLE_CALENDAR.accessToken),
    },
    DISCORD: {
      connectionStatus: Number(!!user?.DISCORD.accessToken),
    },
    GITHUB: {
      connectionStatus: Number(!!user?.GITHUB.accessToken),
    },
    GMAIL: {
      connectionStatus: Number(!!user?.GMAIL.accessToken),
    },
    NOTION: {
      connectionStatus: Number(!!user?.NOTION.accessToken),
    },
    SLACK: {
      connectionStatus: Number(!!user?.SLACK.accessToken),
    },
    MICROSOFT_TEAMS: {
      connectionStatus: Number(!!user?.MICROSOFT_TEAMS.accessToken),
    },
    GOOGLE_DRIVE: {
      connectionStatus: Number(!!user?.GOOGLE_DRIVE.accessToken),
      GoogleDocsConnectionStatus:
        !!user?.GOOGLE_DRIVE.GOOGLE_DOCS.connectionStatus,
      GoogleSheetsConnectionStatus:
        !!user?.GOOGLE_DRIVE.GOOGLE_SHEETS.connectionStatus,
      GoogleSlidesConnectionStatus:
        !!user?.GOOGLE_DRIVE.GOOGLE_SLIDES.connectionStatus,
    },
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="en">
        <body className={`${inter.className} bg-neutral-950 relative`}>
          <UserProvider userData={userData}>
            <ModalProvider>
              <div id="drawer-portal"></div>
              <Navbar />
              <Toaster />
              {children}
            </ModalProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
