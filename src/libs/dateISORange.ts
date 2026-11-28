export const dateISORange = (month: number, year: number) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${
    String(nextMonth).padStart(2, "0")
  }-01T00:00:00.000Z`;
  return [start, end];
};
