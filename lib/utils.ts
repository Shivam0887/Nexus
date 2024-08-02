import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import mongoose from "mongoose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let isConnected = false;

export async function ConnectToDB() {
  const URI = process.env.MONGODB_URI;

  if (!URI) {
    console.info("Connection URI not found");
    throw new Error("Unable to connect. Please try again later.");
  }

  if (!isConnected) {
    isConnected = true;

    mongoose.set("strictQuery", true);
    await mongoose.connect(URI, {
      dbName: "Nexus",
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ Connected to MongoDB!");
    });
    mongoose.connection.on("connecting", () => {
      console.log("⏳ Connecting to MongoDB...");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Disconnected to MongoDB!");
    });

    mongoose.connection.on("error", () => {
      console.log("❌ Error in MongoDB connection");
    });
  } else {
    console.log("😎 Already connected to MongoDB!");
  }
}
