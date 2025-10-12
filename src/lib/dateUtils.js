export function formatDateToISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}
export function getCurrentWeekStartDate() {
  const today = new Date();
  return getWeekStartDate(today);
}

export function isCurrentDate(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getWeekStartDate(dateIntoWeek) {
  const day = dateIntoWeek.getDay(); // 0 (Sun) to 6 (Sat)
  const offset = dateIntoWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(dateIntoWeek.setDate(offset));
}

export function getDayOfForWeek(date) {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return days[date.getDay()];
}

export function formatDateRange(dates) {
  let startDate = new Date(dates[0]);
  let endDate = new Date(dates[dates.length - 1]);
  if (!startDate || !endDate) return "";

  let rangeString = endDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (startDate == endDate) {
    return `le ${rangeString}`;
  }
  rangeString = `au ${rangeString}`;
  if (startDate.getYear() !== endDate.getYear()) {
    rangeString = `${startDate.toLocaleDateString("fr-FR", {
      year: "numeric",
    })}} ${rangeString}`;
  }
  if (startDate.getMonth() !== endDate.getMonth()) {
    rangeString = `${startDate.toLocaleDateString("fr-FR", {
      month: "long",
    })} ${rangeString}`;
  }
  rangeString = `du ${startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
  })} ${rangeString}`;
  return rangeString;
}

export function isToday(date) {
  const today =
    typeof date === "object" && date instanceof Date ? date : new Date(date);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
