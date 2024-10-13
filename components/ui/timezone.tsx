"use client";

const timeZones = Intl.supportedValuesOf("timeZone");

const TimeZone = () => {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-x-2">
      <label htmlFor="timeZone" className="text-sm px-2 tracking-wide">
        Timezone
      </label>
      <select
        id="timeZone"
        name="timeZone"
        defaultValue={localTimeZone}
        required
        className="bg-primary rounded-md p-2 text-sm outline-none"
      >
        {timeZones.map((zone) => (
          <option key={zone} value={zone} className="text-sm bg-primary">
            {zone}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeZone;
