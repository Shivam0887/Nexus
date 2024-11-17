"use server";

import { z } from "zod";
import { calendar_v3, google } from "googleapis";
import {
  differenceInDays,
  getDay,
  getDayOfYear,
  parse,
  format,
} from "date-fns";

import { ConnectToDB } from "@/lib/utils";
import { CalendarDateFormat, CalendarTimeFormat } from "@/lib/constants";

import { auth } from "@clerk/nextjs/server";
import { User, UserType } from "@/models/user.model";
import { checkAndRefreshToken, getPlatformClient } from "./utils.actions";
import { OAuth2Client } from "@/lib/types";

type CalenderResponse =
  | {
      success: true;
      data: string;
    }
  | { success: false; error: string };

const timeZones = Intl.supportedValuesOf("timeZone");

const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const isValidTime = z.string().transform((val, ctx) => {
  const time = parse(val, CalendarTimeFormat, new Date());
  if (time.toString() === "Invalid Date") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bad request. Invalid Time",
    });

    return z.NEVER;
  }

  return format(time, "HH:mm:ss");
});

const isValidDate = z.string().transform((val, ctx) => {
  const date = parse(val, CalendarDateFormat, new Date());
  if (date.toString() === "Invalid Date") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bad request. Invalid Date",
    });

    return z.NEVER;
  }

  return format(date, "yyyy-MM-dd");
});

const dataSchema = z.object({
  title: z.string().min(1, "Title can't be empty."),
  event: z.enum(["0", "1", "2", "3", "4", "5"], {
    message: " Bad request. Invalid event",
  }),
  description: z.string(),
  allDay: z.enum(["on"]).optional(),
  startTime: isValidTime.optional(),
  endTime: isValidTime.optional(),
  startDate: isValidDate,
  endDate: isValidDate.optional(),
  guest_emails: z
    .array(z.string().email("Bad request. Please provide valid guest emails."))
    .nonempty("Bad request. Please provide atleast one guest email."),
  timeZone: z.enum(timeZones as [string, ...string[]]),
});

const getRecurrenceRules = ({
  event,
  date,
}: Pick<z.infer<typeof dataSchema>, "event"> & { date: string }) => {
  const day = days[getDay(date)];
  const dayOfYear = getDayOfYear(date);

  switch (event) {
    case "1":
      return "RRULE:FREQ=DAILY;";
    case "2":
      return `RRULE:FREQ=WEEKLY;BYDAY=${day};`;
    case "3":
      return `RRULE:FREQ=MONTHLY;BYDAY=-1${day};`;
    case "4":
      return `RRULE:FREQ=YEARLY;BYYEARDAY=${dayOfYear}`;
    case "5":
      return "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;";
    default:
      return "";
  }
};

const getHours = (time: string) => {
  return parseInt(time.slice(0, 2));
};

const getMinutes = (time: string) => {
  return parseInt(time.slice(3, 5));
};

export const createCalender = async (
  formData: FormData
): Promise<CalenderResponse> => {
  const { userId } = await auth();

  await ConnectToDB();
  const user = await User.findOne<UserType>({ userId });

  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const data = Object.fromEntries(formData);
  const emails = data["guest_emails"].toString().split(" ");

  let updatedData: { [x: string]: any } = {};

  for (const key in data) {
    updatedData[key] = key === "guest_emails" ? emails : data[key];
  }

  const { error, success, data: response } = dataSchema.safeParse(updatedData);

  if (!success) {
    return {
      success: false,
      error: error.errors[0].message,
    };
  }

  const {
    guest_emails,
    description,
    title,
    event,
    startDate,
    endDate,
    endTime,
    startTime,
    allDay,
    timeZone,
  } = response;

  //1. if it is a all-day event and the user doesn't provide the end-date or
  //2. if end-date is present (if all-day event or multi-day event which require both start and end time), and neither startTime nor endTime is present.
  if (
    (allDay === "on" && endDate === undefined) ||
    (allDay !== "on" && endDate && (!startTime || !endTime))
  ) {
    return {
      success: false,
      error: "Bad request",
    };
  }

  let isNextday = false;
  if (startTime && endTime) {
    if (getHours(startTime) >= getHours(endTime)) {
      isNextday =
        getHours(startTime) > getHours(endTime) ||
        getMinutes(startTime) > getMinutes(endTime);
    }
  }

  if (
    (isNextday || allDay) &&
    (!endDate || differenceInDays(endDate, startDate) < 0)
  ) {
    return {
      success: false,
      error: "Bad request. Invalid End-date",
    };
  }

  const attendees = guest_emails.map((email) => ({
    email,
    responseStatus: "needsAction",
  }));

  const start = {
    timeZone,
    date: allDay === "on" ? startDate : undefined,
    dateTime: allDay === "on" ? undefined : startDate + "T" + startTime,
  };

  const end = {
    timeZone,
    date: allDay === "on" ? endDate : undefined,
    dateTime:
      allDay === "on"
        ? undefined
        : isNextday
        ? endDate + "T" + endTime
        : startDate + "T" + endTime,
  };

  try {
    const oauth2Client = await (async () => (await getPlatformClient(user, "GOOGLE_CALENDAR")) as OAuth2Client)();
    const response = await checkAndRefreshToken(user, "GOOGLE_CALENDAR", oauth2Client);
    if(!response.success) return response;

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    let requestBody: calendar_v3.Params$Resource$Events$Insert["requestBody"] =
      {
        description,
        summary: title,
        attendees,
        start,
        end,
      };

    if (event !== "0") {
      requestBody["recurrence"] = [
        getRecurrenceRules({ event, date: startDate }),
      ];
    }

    await calendar.events.insert({
      calendarId: user.email,
      requestBody,
    });

    return {
      success: true,
      data: "Created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
