import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/navbar";

import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ConnectToDB } from "@/lib/utils";
import { StateType } from "@/lib/types";
import { UserProvider } from "@/hooks/useUser";
import { ModalProvider } from "@/hooks/useModalSelection";
import { Toaster } from "@/components/ui/sonner";
import { DrawerProvider } from "@/hooks/useDrawerSelection";
import DrawerManager from "@/providers/drawer-provider";
import ModalManager from "@/providers/modal-provider";
import { decryptedUserData } from "@/actions/security.actions";
import { TUser } from "@/models/user.model";
import { Subscription, TSubscription } from "@/models/subscription.model";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus: AI-Search Assistant",
  description:
    "An AI-powered search assistant that centralizes information from various work applications, allowing users to quickly find and access data across platforms like Gmail, Slack, and Google Drive. It uses search APIs to fetch information in real time without storing data, ensuring security and privacy. It supports multi-account integration and offers features like instant answers to work-related queries, document generation with source references, and streamlined search capabilities, enhancing team productivity and efficiency.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  await ConnectToDB();
  const user = (await decryptedUserData(userId)) as TUser | undefined;
  const subscription = await Subscription.findOne<TSubscription>({ subId: user?.currentSubId ?? "" });

  const userData: StateType = {
    email: user?.email ?? "",
    hasPasskey: Boolean(user?.hasPasskey),
    hasSubscription: Boolean(user?.hasSubscription),
    imageUrl: user?.imageUrl ?? "",
    isAISearch: Boolean(user?.isAISearch),
    isExpired: subscription ? subscription.currentEnd < Date.now() : false,
    subscriptionStatus: subscription ? subscription.status : "none",
    startDate: subscription?.currentStart,
    endDate: subscription?.currentEnd,
    plan: user?.plan ? user.plan as ("Starter" | "Professional") : "Starter",
    aiModel: "ollama",
    credits: {
      ai: user?.credits?.ai ?? 0,
      search: user?.credits?.search ?? 0
    },
    shouldRemember: Boolean(user?.shouldRemember),
    username: user?.username ?? "",
    GOOGLE_CALENDAR: {
      connectionStatus: Number(!!user?.GOOGLE_CALENDAR.connectionStatus),
    },
    DISCORD: {
      connectionStatus: Number(!!user?.DISCORD.connectionStatus),
      searchStatus: !!user?.DISCORD.searchStatus,
    },
    GITHUB: {
      connectionStatus: Number(!!user?.GITHUB.connectionStatus),
      searchStatus: !!user?.GITHUB.searchStatus,
    },
    GMAIL: {
      connectionStatus: Number(!!user?.GMAIL.connectionStatus),
      searchStatus: !!user?.GMAIL.searchStatus,
    },
    NOTION: {
      connectionStatus: Number(!!user?.NOTION.connectionStatus),
      searchStatus: !!user?.NOTION.searchStatus,
    },
    SLACK: {
      connectionStatus: Number(!!user?.SLACK.connectionStatus),
      searchStatus: !!user?.SLACK.searchStatus,
    },
    MICROSOFT_TEAMS: {
      connectionStatus: Number(!!user?.MICROSOFT_TEAMS.connectionStatus),
      searchStatus: !!user?.MICROSOFT_TEAMS.searchStatus,
    },
    GOOGLE_DRIVE: {
      connectionStatus: Number(!!user?.GOOGLE_DRIVE.connectionStatus),
    },
    GOOGLE_DOCS: { searchStatus: !!user?.GOOGLE_DOCS.searchStatus },
    GOOGLE_SHEETS: { searchStatus: !!user?.GOOGLE_SHEETS.searchStatus },
    GOOGLE_SLIDES: { searchStatus: !!user?.GOOGLE_SLIDES.searchStatus },
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="en">
        <body className={`${inter.className} bg-neutral-950 relative`}>
          <UserProvider userData={userData}>
            <ModalProvider>
              <DrawerProvider>
                <div id="drawer-portal"></div>
                <Navbar />
                <Toaster />
                <DrawerManager />
                <ModalManager />
                {children}
              </DrawerProvider>
            </ModalProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}