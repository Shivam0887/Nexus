"use client";
import "react-datepicker/dist/react-datepicker.css";

import Picker from "react-datepicker";
import {
  getMonth,
  getYear,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  getDay,
  format,
} from "date-fns";

import React, { useEffect, useState } from "react";
import { Roboto } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { CalendarDateFormat, CalendarTimeFormat } from "@/lib/constants";

type CustomHeaderProps = {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  rangeEndYearAdvance?: number;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
};

type CalendarProviderProps = {
  onChange: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
  name: string;
  disabled: boolean;
};

type TimeProviderProps = {
  onChange: (date: Date) => void;
  startTime: Date | null;
  endTime: Date | null;
  name: string;
  disabled: boolean;
};

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

const timeInterval = 15;

function range(start: number, end: number, step = 1) {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const recurrenceEvents = [
  "Doesn't repeat",
  "Daily",
  "Weekly on ",
  "Monthly on the last ",
  "Annually on ",
  "Every weekday (Monday to Friday)",
];

export const handleCustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  changeMonth,
  changeYear,
  rangeEndYearAdvance = 0,
  nextMonthButtonDisabled,
  prevMonthButtonDisabled,
}: CustomHeaderProps) => {
  const years = range(1960, getYear(new Date()) + rangeEndYearAdvance, 1);

  return (
    <div
      className={`mx-3 flex justify-between items-center gap-2 bg-white ${roboto.className}`}
    >
      <div className="flex items-center gap-2 text-base font-medium">
        <select
          value={getYear(date)}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={months[getMonth(date)]}
          onChange={({ target: { value } }) =>
            changeMonth(months.indexOf(value))
          }
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-x-2">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="border-none hover:bg-neutral-200 rounded-full transition-colors"
        >
          <ChevronLeft className="size-4 stroke-2" />
        </button>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="border-none hover:bg-neutral-200 rounded-full transition-colors"
        >
          <ChevronRight className="size-4 stroke-2" />
        </button>
      </div>
    </div>
  );
};

const getFutureDate = (date: Date, count: number = 1) => {
  const checkCount = count === 0 ? 1 : count;
  return new Date(date.getTime() + checkCount * 24 * 60 * 60 * 1000);
};

const CalendarProvider = ({
  onChange,
  startDate,
  endDate,
  name,
  disabled,
}: CalendarProviderProps) => {
  if (startDate && endDate) return null;
  return (
    <Picker
      dateFormat={CalendarDateFormat}
      renderCustomHeader={(props) => handleCustomHeader({...props, rangeEndYearAdvance: 10})}
      selectsStart={startDate !== null}
      selectsEnd={endDate !== null}
      autoFocus={endDate !== null}
      selected={startDate ?? endDate}
      onChange={(date) => {
        if (date) onChange(date);
      }}
      showPopperArrow={false}
      name={name}
      required
      disabled={disabled}
      className="focus:outline-none transition-colors rounded-md hover:bg-neutral-700 bg-inherit text-sm p-2"
    />
  );
};

const TimeProvider = ({
  endTime,
  onChange,
  startTime,
  name,
  disabled,
}: TimeProviderProps) => {
  if (startTime && endTime) return null;
  return (
    <Picker
      dateFormat={CalendarTimeFormat}
      selected={startTime ?? endTime}
      onChange={(date) => {
        if (date) onChange(date);
      }}
      selectsStart={startTime !== null}
      selectsEnd={endTime !== null}
      showPopperArrow={false}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={timeInterval}
      showTimeCaption={false}
      name={name}
      required
      disabled={disabled}
      popperClassName="rounded-md"
      className="focus:outline-none transition-colors rounded-md hover:bg-neutral-700 bg-inherit text-sm p-2 scroll-none max-w-[4.5rem]"
    />
  );
};

export const DatePicker = ({
  disabled,
  setDisabled,
}: {
  disabled: boolean;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [startTime, setStartTime] = useState<Date>(
    setSeconds(
      setMinutes(
        new Date(),
        timeInterval * (Math.floor(new Date().getMinutes() / timeInterval) + 1)
      ),
      0
    )
  );
  const [endTime, setEndTime] = useState<Date>(
    new Date(startTime.getTime() + 3600 * 1000)
  );

  const [isNextDay, setIsNextDay] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);

  const { pending } = useFormStatus();

  useEffect(() => {
    setDisabled(pending);
  }, [pending, setDisabled]);

  const handleTime = (newEndTime: Date, currentStartTime: Date) => {
    let flag = false;

    if (getHours(currentStartTime) >= getHours(newEndTime)) {
      flag =
        getHours(currentStartTime) > getHours(newEndTime) ||
        getMinutes(currentStartTime) > getMinutes(newEndTime);

      if (flag) setEndDate(getFutureDate(startDate, 1));
    }

    setIsNextDay(flag);
    setEndTime(newEndTime);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarProvider
          endDate={null}
          onChange={setStartDate}
          startDate={startDate}
          name="startDate"
          disabled={disabled}
        />

        {(!isAllDay || isNextDay) && (
          <div className="flex items-center">
            <TimeProvider
              endTime={null}
              onChange={(time) => {
                setStartTime(time);
                handleTime(endTime, time);
              }}
              startTime={startTime}
              name="startTime"
              disabled={disabled}
            />
            <span>-</span>
            <TimeProvider
              endTime={endTime}
              onChange={(time) => handleTime(time, startTime)}
              startTime={null}
              name="endTime"
              disabled={disabled}
            />
          </div>
        )}

        {(isAllDay || isNextDay) && (
          <div className="text-white">
            <CalendarProvider
              endDate={endDate}
              onChange={(date) => {
                // end-date can't be less than the start-date
                if (date.getDate() >= startDate.getDate()) {
                  if (isNextDay) setEndDate(getFutureDate(startDate, 1));
                }
                setEndDate(date);
              }}
              startDate={null}
              name="endDate"
              disabled={disabled}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 px-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => {
              if (e.currentTarget.checked) setIsNextDay(false);
              else handleTime(endTime, startTime);
              setIsAllDay(e.currentTarget.checked);
            }}
            disabled={disabled}
            id="allDay"
            name="allDay"
            className="customCheckbox"
          />
          <label htmlFor="allDay" className="text-sm">
            All Day
          </label>
        </div>
        <select
          disabled={disabled}
          defaultValue="0"
          className="text-sm focus:outline-none bg-neutral-900 p-2 rounded-md"
          name="event"
        >
          {recurrenceEvents.map((event, i) => (
            <option
              key={`event${i + 1}`}
              value={i}
              className="text-sm bg-neutral-900"
            >
              {event +
                `${
                  i >= 2 && i <= 4
                    ? i === 4
                      ? format(startDate, "LLLL dd")
                      : days[getDay(startDate)]
                    : ""
                }`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
