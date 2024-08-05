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
    mongoose.set("strictQuery", true);
    await mongoose.connect(URI, {
      dbName: "Nexus",
    });

    switch (mongoose.connection.readyState) {
      case 0: {
        console.log("⚠️ Disconnected to MongoDB!");
        break;
      }
      case 1: {
        console.log("✅ Connected to MongoDB!");
        break;
      }
      case 2: {
        console.log("⏳ Connecting to MongoDB...");
        break;
      }
      case 3: {
        console.log("⏳ Disconnecting to MongoDB...");
        break;
      }
      default: {
        console.log("Unknown state");
      }
    }

    mongoose.connection.off("error", () => {
      console.log("❌ Error in MongoDB connection");
    });
    mongoose.connection.on("error", () => {
      console.log("❌ Error in MongoDB connection");
    });

    isConnected = true;
  } else {
    console.log("😎 Already connected to MongoDB!");
  }
}
