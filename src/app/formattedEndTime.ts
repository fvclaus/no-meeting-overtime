import { useEffect, useState } from "react";

export function formatEndTime() {
  const [endTimeFormatter, setEndTimeFormatter] = useState<
    (date: Date) => string
  >((a) => (a !== undefined ? a.toISOString() : "undefined"));

  // Cannot use navigator.language with SSR
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
    });
    setEndTimeFormatter((date: Date) => formatter.format(date));
  }, []);
  return endTimeFormatter;
}
