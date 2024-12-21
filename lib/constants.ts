import {
  CombinedFilterKey,
  DrawerDirection,
  FAQ,
  FilterKey,
  LogoType,
  PLAN,
  TSortBy,
} from "./types";
import { CalendarCheck, Check, X } from "lucide-react";
import Analytics from "@/components/icons/analytics";
import Integration from "@/components/icons/integration";
import Settings from "@/components/icons/settings";
import Search from "@/components/icons/search";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

export const words = ["visual", "contextual", "voice"];

export const images: LogoType[] = [
  {
    src: "./Gmail.svg",
    alt: "GMAIL",
    desc: "Seamlessly integrate Gmail with Nexus to manage your emails efficiently. Quickly search and access emails, attachments, and conversation threads. ",
    key: "gmail",
    width: 64,
    height: 64,
  },
  {
    src: "./Google_Drive.svg",
    alt: "GOOGLE_DRIVE",
    desc: "Enhance your file management by connecting Google Drive to Nexus. Instantly locate documents, spreadsheets, and presentations. ",
    key: "drive",
    width: 64,
    height: 64,
  },
  {
    src: "./Google_Calendar.svg",
    alt: "GOOGLE_CALENDAR",
    desc: "Create events and tasks into your calendar by integrating Google Calendar with Nexus.",
    key: "calendar",
    width: 64,
    height: 64,
  },
  {
    src: "./Teams.svg",
    alt: "MICROSOFT_TEAMS",
    desc: "Improve team collaboration by integrating MS Teams with Nexus. Effortlessly search and retrieve messages, files, and meeting notes from various channels. ",
    key: "teams",
    width: 64,
    height: 64,
  },
  {
    src: "./Github.svg",
    alt: "GITHUB",
    desc: "Streamline your development projects by integrating Github with Nexus. Search through repositories, pull requests, and issues effortlessly. ",
    key: "gitHub",
    width: 64,
    height: 64,
  },
  {
    src: "./Discord.svg",
    alt: "DISCORD",
    desc: "Enhance your community interactions by integrating Discord with Nexus. Easily search through messages, media, and server content. ",
    key: "discord",
    width: 64,
    height: 64,
  },
  {
    src: "./Slack.svg",
    alt: "SLACK",
    desc: "Enhance your community interactions by integrating Slack with Nexus. Easily search through messages, media, and server content.",
    key: "slack",
    width: 64,
    height: 64,
  },
  {
    src: "./Notion.svg",
    alt: "NOTION",
    desc: "Optimize your workflow by integrating Notion with Nexus. Quickly search through notes, databases, and projects.",
    key: "notion",
    width: 64,
    height: 64,
  },
];

export const content = [
  {
    title: "Sign up - Quick Registration",
    desc: "Create your Nexus account with your email and a password, or use your Google account for instant access.",
    content: "",
    isVideo: true,
    src: "/sign-in.mp4",
    videoPreviewImage: "/sign-in-preview.png",
  },
  {
    title: "Connect your Apps - Easy Integration",
    desc: "Link your work apps like Gmail, Slack, OneDrive, and Google Drive through a secure process. Nexus uses safe APIs to ensure your data remains private.",
    content: "",
    isVideo: true,
    src: "/integration.mp4",
    videoPreviewImage: "/integration-preview.png",
  },
  {
    title: "Start searching - Instant Access",
    desc: "Type your query into the search bar to quickly find emails, messages, tickets, or documents from all connected apps. Enjoy advanced features like contextual search, voice search, and real-time results.",
    content: "",
    isVideo: true,
    src: "/search.mp4",
    videoPreviewImage: "/search-preview.png",
  },
];

export const plans: PLAN[] = [
  {
    plan: "Starter",
    price: "0",
    desc: "For starter, get started with free plan forever and ever.",
    features: [
      {
        content: "Limited 50 credits global search",
        icon: Check,
        available: true,
      },
      {
        content: "Limited 50 credits for AI chat, and summarize",
        icon: Check,
        available: true,
      },
      {
        content: "Workspace analytics",
        icon: X,
        available: false,
      },
      {
        content: "Integration Passkey",
        icon: X,
        available: false,
      },
      {
        content: "Multiple account integrations",
        icon: CalendarCheck,
        available: false,
        comingSoon: true,
      },
      {
        content: "2 credits for visual search",
        icon: CalendarCheck,
        available: false,
        comingSoon: true,
      },
    ],
  },
  {
    plan: "Professional",
    price: "499",
    desc: "For professional, get everything in free plus something extra.",
    features: [
      {
        content: "Unlimited global search",
        icon: Check,
        available: true,
      },
      {
        content: "Unlimited credits for AI chat, and summarize",
        icon: Check,
        available: true,
      },
      {
        content: "Workspace analytics",
        icon: Check,
        available: true,
      },
      {
        content: "Integration Passkey",
        icon: Check,
        available: true,
      },
      {
        content: "Multiple account integrations",
        icon: CalendarCheck,
        available: false,
        comingSoon: true,
      },
      {
        content: "10 credits for visual search",
        icon: CalendarCheck,
        available: false,
        comingSoon: true,
      },
    ],
  },
];

export const faqs: FAQ[] = [
  {
    title: "How does Nexus work?",
    desc: "Nexus uses AI-powered search algorithms to centralize information from various work applications. It fetches data in real-time without storing it, ensuring security and privacy.",
  },
  {
    title: "What are the advanced features of Nexus?",
    desc: "Nexus offers advanced features like smart contextual search, voice search, advanced filtering and sorting, personalized dashboards, multi-language support, visual search capability, authentication security, saved filter presets, and integration with Google Calendar.",
  },
  {
    title: "How can I integrate Nexus with my work applications?",
    desc: "Nexus supports integration with popular work applications like Gmail, Slack, Notion, and Google Drive. You can easily connect your accounts and access data from these platforms within Nexus.",
  },
  {
    title: "Can I search using images in Nexus?",
    desc: "Absolutely! Nexus integrates image recognition technology, allowing you to search using images and receive related documents or information.",
  },
];

export const icons = [
  { Icon: Search, href: "/search", label: "Search" },
  { Icon: Analytics, href: "/analytics", label: "Analytics" },
  { Icon: Integration, href: "/integrations", label: "Integrations" },
  { Icon: Settings, href: "/settings", label: "Settings" },
];

export const DrawerDir: Record<
  DrawerDirection,
  {
    dimen: string[];
    translateIn: string;
    translateOut: string;
    handleStyles: React.CSSProperties;
    styles: React.CSSProperties;
  }
> = {
  top: {
    dimen: ["50vh", "100vw"],
    translateIn: "translate(0%, 0%)",
    translateOut: "translate(0%, -100%)",
    handleStyles: {
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "1.5rem",
    },
    styles: {
      top: 0,
      insetInline: 0,
      borderBottom: "2px solid #404040",
      borderRadius: "0 0 1rem 1rem",
    },
  },
  bottom: {
    dimen: ["50vh", "100vw"],
    translateIn: "translate(0%, 0%)",
    translateOut: "translate(0%, 100%)",
    handleStyles: {
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "1.5rem",
    },
    styles: {
      bottom: 0,
      insetInline: 0,
      borderTop: "2px solid #404040",
      borderRadius: "1rem 1rem 0 0",
    },
  },
  left: {
    dimen: ["100vh", "75vw"],
    translateIn: "translate(0%, 0%)",
    translateOut: "translate(-100%, 0%)",
    handleStyles: {
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      height: "7rem",
      width: "0.5rem",
      marginRight: "1.5rem",
    },
    styles: {
      left: 0,
      insetBlock: 0,
      borderRight: "2px solid #404040",
      borderRadius: "0 1rem 1rem 0",
    },
  },
  right: {
    dimen: ["100vh", "75vw"],
    translateIn: "translate(0%, 0%)",
    translateOut: "translate(100%, 0%)",
    handleStyles: {
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      height: "7rem",
      width: "0.5rem",
      marginLeft: "1.5rem",
    },
    styles: {
      right: 0,
      insetBlock: 0,
      borderLeft: "2px solid #404040",
      borderRadius: "1rem 0 0 1rem",
    },
  },
};

export const Platforms = [
  "DISCORD",
  "GITHUB",
  "GMAIL",
  "GOOGLE_CALENDAR",
  "GOOGLE_DRIVE",
  "MICROSOFT_TEAMS",
  "NOTION",
  "SLACK",
] as const;

export const SortBy: TSortBy[] = ["date", "last hour", "last day", "last week"];

export const LogoMap: {
  [key in Exclude<CombinedFilterKey, "GOOGLE_DRIVE">]: string;
} = {
  GOOGLE_DOCS: "./Google_Docs.svg",
  GOOGLE_SHEETS: "./Google_Sheets.svg",
  GOOGLE_SLIDES: "./Google_Slides.svg",
  MICROSOFT_TEAMS: "./Teams.svg",
  DISCORD: "./Discord.svg",
  GITHUB: "./Github.svg",
  GMAIL: "./Gmail.svg",
  NOTION: "./Notion.svg",
  SLACK: "./Slack.svg",
  GOOGLE_CALENDAR: "./Google_Calendar.svg",
};

export const Scopes: Record<FilterKey, string[]> = {
  GMAIL: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
  GOOGLE_DRIVE: ["https://www.googleapis.com/auth/drive.readonly"],
  GOOGLE_CALENDAR: ["https://www.googleapis.com/auth/calendar.events"],
  MICROSOFT_TEAMS: [],
  DISCORD: [],
  GITHUB: [],
  NOTION: [],
  SLACK: ["search:read", "users:read.email", "users:read"],
};

export const CalendarDateFormat = "EEEE, dd MMMM yy";
export const CalendarTimeFormat = "h:mmaaa";

export const UserKeys = [
  "birthday",
  "imageUrl",
  "plan",
  "passkey",
  "hasPasskey",
  "shouldRemember",
  "isAISearch",
  "hasSubscription",
  "GOOGLE_DOCS",
  "GOOGLE_SHEETS",
  "GOOGLE_SLIDES",
  "userId",
  "username",
  "email",
  "searchCount",
  "searchHistory",
  "GMAIL",
  "GOOGLE_DRIVE",
  "GOOGLE_CALENDAR",
  "MICROSOFT_TEAMS",
  "DISCORD",
  "GITHUB",
  "NOTION",
  "SLACK",
  "createdAt",
  "updatedAt",
  "currentSubId",
  "subscriptionId",
  "isOTPVerified",
  "credits"
];

export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];