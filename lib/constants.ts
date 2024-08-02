import { COLOR_PALETTES, FAQ, PALETTE_NAME, PLAN } from "./types";
import { Check, X } from "lucide-react";
import Analytics from "@/components/icons/analytics";
import Integration from "@/components/icons/integration";
import Settings from "@/components/icons/settings";
import Search from "@/components/icons/search";

export const words = ["visual", "contextual", "voice"];

export const features: {
  title: string;
  desc: string;
  colorPalette: PALETTE_NAME;
}[] = [
  {
    title: "smart contextual search",
    desc: "Nexus's smart contextual search is designed to grasp the nuances of your queries, ensuring a deep understanding of the context, delivers highly relevant results by analyzing the context behind each search. With Nexus, you get precise outcomes that cater specifically to your needs.",
    colorPalette: "Radiant Orchid Dream",
  },
  {
    title: "voice search",
    desc: "Search hands-free with Nexus's innovative voice search feature, which allows you to find what you're looking for effortlessly. Simply speak your query, and Nexus will quickly deliver the results you need without the need for typing, making your search experience smoother than ever.",
    colorPalette: "Velvet Night",
  },
  {
    title: "sorting and filtering",
    desc: "Enhance your search experience with advanced filtering and sorting options. These features allow you to narrow down results based on specific criteria, making it easier to locate the most pertinent information efficiently.",
    colorPalette: "Oceanic Dream",
  },
  {
    title: "visual search",
    desc: "Integrate advanced image recognition technology to enable users to upload photos for searching, enhances user experience by providing intuitive and efficient access to the needed data based on visual inputs. By leveraging ML algorithms, it ensures accurate and swift retrieval of related content.",
    colorPalette: "Ocean Depths",
  },
  {
    title: "personalized dashboard",
    desc: "We offer customizable dashboards that aggregate frequently accessed data and recent searches, allowing users to have all their important information in one place. By consolidating key data and search history, we enhance productivity and ensure users can easily access the information they need.",
    colorPalette: "Midnight Velvet",
  },
];

export const images = [
  {
    src: "./Gmail.svg",
    alt: "Gmail logo",
    key: "gmail",
    width: 64,
    height: 64,
  },
  {
    src: "./Google_Drive.svg",
    alt: "Google Drive logo",
    key: "drive",
    width: 64,
    height: 64,
  },
  {
    src: "./Teams.svg",
    alt: "MS Teams logo",
    key: "teams",
    width: 64,
    height: 64,
  },
  {
    src: "./Discord.svg",
    alt: "Discord logo",
    key: "discord",
    width: 64,
    height: 64,
  },
  {
    src: "./Dropbox.svg",
    alt: "Dropbox logo",
    key: "dropbox",
    width: 64,
    height: 64,
  },
  {
    src: "./Github.svg",
    alt: "GitHub logo",
    key: "gitHub",
    width: 64,
    height: 64,
  },
  {
    src: "./Google_Docs.svg",
    alt: "Google Docs logo",
    key: "docs",
    width: 64,
    height: 64,
  },
  {
    src: "./Notion.svg",
    alt: "Notion logo",
    key: "notion",
    width: 64,
    height: 64,
  },
  {
    src: "./OneDrive.svg",
    alt: "OneDrive logo",
    key: "oneDrive",
    width: 64,
    height: 64,
  },
  {
    src: "./Outlook.svg",
    alt: "Outlook logo",
    key: "outlook",
    width: 64,
    height: 64,
  },
];

export const temp = [
  {
    src: "/temp/temp1.png",
    alt: "temp1",
    key: "temp1",
    width: 512,
    height: 512,
  },
  {
    src: "/temp/temp2.png",
    alt: "temp2",
    key: "temp2",
    width: 512,
    height: 512,
  },
  {
    src: "/temp/temp3.png",
    alt: "temp3",
    key: "temp3",
    width: 512,
    height: 512,
  },
  {
    src: "/temp/temp4.png",
    alt: "temp4",
    key: "temp4",
    width: 512,
    height: 512,
  },
  {
    src: "/temp/temp5.png",
    alt: "temp5",
    key: "temp5",
    width: 512,
    height: 512,
  },
  {
    src: "/temp/temp6.png",
    alt: "temp6",
    key: "temp6",
    width: 512,
    height: 512,
  },
];

export const colorPalettes: COLOR_PALETTES = {
  "Radiant Orchid Dream": {
    linearGradient1: {
      stop1: "#e36dd7",
      stop2: "#dfbed3",
    },
    linearGradient2: {
      stop1: "#8a20d5",
      stop2: "#e36dd7",
    },
    radialGradient: {
      stop1: "#e56ebd",
      stop2: "#6636da",
    },
  },
  "Velvet Night": {
    linearGradient1: {
      stop1: "#667eea",
      stop2: "#764ba2",
    },
    linearGradient2: {
      stop1: "#8e2de2",
      stop2: "#4a00e0",
    },
    radialGradient: {
      stop1: "#667eea",
      stop2: "#764ba2",
    },
  },
  "Oceanic Dream": {
    linearGradient1: {
      stop1: "#00c6ff",
      stop2: "#0072ff",
    },
    linearGradient2: {
      stop1: "#00c6ff",
      stop2: "#0072ff",
    },
    radialGradient: {
      stop1: "#00d2ff",
      stop2: "#357ee4",
    },
  },
  "Ocean Depths": {
    linearGradient1: {
      stop1: "#4ca1af",
      stop2: "#2c3e50",
    },
    linearGradient2: {
      stop1: "#4ca1af",
      stop2: "#2c3e50",
    },
    radialGradient: {
      stop1: "#2c3e50",
      stop2: "#4ca1af",
    },
  },
  "Midnight Velvet": {
    linearGradient1: {
      stop1: "#212529",
      stop2: "#343a40",
    },
    linearGradient2: {
      stop1: "#212529",
      stop2: "#343a40",
    },
    radialGradient: {
      stop1: "#343a40",
      stop2: "#212529",
    },
  },
};

export const content = [
  {
    title: "Sign up - Quick Registration",
    desc: "Create your Nexus account with your email and a password, or use your Google account for instant access.",
    content: "",
  },
  {
    title: "Connect your Apps - Easy Integration",
    desc: "Link your work apps like Gmail, Slack, OneDrive, and Google Drive through a secure process. Nexus uses safe APIs to ensure your data remains private.",
    content: "",
  },
  {
    title: "Start searching - Instant Access",
    desc: "Type your query into the search bar to quickly find emails, messages, tickets, or documents from all connected apps. Enjoy advanced features like contextual search, voice search, and real-time results.",
    content: "",
  },
];

export const plans: PLAN[] = [
  {
    plan: "Starter",
    price: "0",
    desc: "For starter, get started with free plan forever and ever.",
    features: [
      {
        content: "50 credits global search",
        icon: Check,
        available: true,
      },
      {
        content: "50 credits for AI chat, translate, and summarize",
        icon: Check,
        available: true,
      },
      {
        content: "10 credits for visual search",
        icon: Check,
        available: true,
      },
      {
        content: "Multiple account integrations",
        icon: X,
        available: false,
      },
      {
        content: "Workspace analytics",
        icon: X,
        available: false,
      },
      {
        content: "Intregration Passkey",
        icon: X,
        available: false,
      },
    ],
  },
  {
    plan: "Professional",
    price: "19",
    desc: "For professional, get everything in free plus something extra.",
    features: [
      {
        content: "Unlimited global search",
        icon: Check,
        available: true,
      },
      {
        content: "Unlimited credits for AI chat, translate, and summarize",
        icon: Check,
        available: true,
      },
      {
        content: "100 credits for visual search",
        icon: Check,
        available: true,
      },
      {
        content: "Multiple account integrations",
        icon: Check,
        available: true,
      },
      {
        content: "Workspace analytics",
        icon: Check,
        available: true,
      },
      {
        content: "Intregration Passkey",
        icon: Check,
        available: true,
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
