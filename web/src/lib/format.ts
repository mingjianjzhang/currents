const long = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** Formats a YYYY-MM-DD date without shifting it into the viewer's timezone. */
export const formatDay = (iso: string) => long.format(new Date(`${iso}T00:00:00Z`));
export const formatDayShort = (iso: string) => short.format(new Date(`${iso}T00:00:00Z`));
