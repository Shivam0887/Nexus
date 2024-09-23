import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/navbar";

import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { FilterKey, StateType } from "@/lib/types";
import { UserProvider } from "@/hooks/useUser";

// const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Serif({ subsets: ["latin"] });

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
  const { userId } = auth();

  await ConnectToDB();
  const user = await User.findOne<UserType>({ userId });

  const userData: StateType = {
    coverImage: "",
    email: user?.email ?? "",
    hasPasskey: !!user?.hasPasskey,
    hasSubscription: false,
    imageUrl: user?.imageUrl ?? "",
    isAISearch: !!user?.isAISearch,
    plan: "Starter",
    shouldRemember: !!user?.shouldRemember,
    username: user?.username ?? "",
    filter: user?.filter ? (user.filter as FilterKey[]) : [],
    isFilterApplied: !!user?.isFilterApplied,
    isGoogleCalendarConnected: !!user?.google_calendar?.accessToken,
    Discord: {
      account: !!user?.discord?.accessToken,
      dataCollection: !!user?.discord?.dataCollection,
    },
    GitHub: {
      account: !!user?.gitHub?.accessToken,
      dataCollection: !!user?.gitHub?.dataCollection,
    },
    Gmail: {
      account: !!user?.gmail?.accessToken,
      dataCollection: !!user?.gmail?.dataCollection,
    },
    "Google Docs": {
      account: !!user?.google_docs?.accessToken,
      dataCollection: !!user?.google_docs?.dataCollection,
    },
    "Google Drive": {
      account: !!user?.google_drive?.accessToken,
      dataCollection: !!user?.google_drive?.dataCollection,
    },
    Notion: {
      account: !!user?.notion?.accessToken,
      dataCollection: !!user?.notion?.dataCollection,
    },
    OneDrive: {
      account: !!user?.oneDrive?.accessToken,
      dataCollection: !!user?.oneDrive?.dataCollection,
    },
    Slack: {
      account: !!user?.slack?.accessToken,
      dataCollection: !!user?.slack?.dataCollection,
    },
    "MS Teams": {
      account: !!user?.teams?.accessToken,
      dataCollection: !!user?.teams?.dataCollection,
    },
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="en">
        <body className={`${noto.className} bg-neutral relative`}>
          <UserProvider userData={userData}>
            <div id="drawer-portal"></div>
            <Navbar />
            {children}
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
