/**
 * Given a date (either Date object or string), return the start and end dates of that week (Monday-Sunday).
 * @param inputDate Date | string - The reference date
 * @returns { weekStartDate: Date; weekEndDate: Date }
 */
export function getWeekStartAndEndDates(inputDate: Date | string): { weekStartDate: Date; weekEndDate: Date } {
  const date = inputDate instanceof Date ? new Date(inputDate) : new Date(inputDate);

  // JS: Sunday is 0, Monday is 1, ..., Saturday is 6
  const day = date.getDay();
  const diffToMonday = ((day + 6) % 7); 

  // Week start: subtract days to go back to Monday (preserving hours etc.)
  const weekStartDate = new Date(date);
  weekStartDate.setDate(date.getDate() - diffToMonday);
  weekStartDate.setHours(0,0,0,0);

  // Week end: Sunday (weekStartDate + 6 days)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23,59,59,999);

  return { weekStartDate, weekEndDate };
}


/**
 * Given a date (either Date object or string), return the start and end dates of that month.
 * @param inputDate Date | string - The reference date
 * @returns { monthStartDate: Date; monthEndDate: Date }
 */
export function getMonthStartAndEndDates(inputDate: Date | string): { monthStartDate: Date; monthEndDate: Date } {
  const date = inputDate instanceof Date ? new Date(inputDate) : new Date(inputDate);

  // Month start: set to first day of month at 00:00:00.000
  const monthStartDate = new Date(date);
  monthStartDate.setDate(1);
  monthStartDate.setHours(0, 0, 0, 0);

  // Month end: set to last day of month at 23:59:59.999
  const monthEndDate = new Date(date);
  monthEndDate.setMonth(monthEndDate.getMonth() + 1);
  monthEndDate.setDate(0); // Set to last day of previous month
  monthEndDate.setHours(23, 59, 59, 999);

  return { monthStartDate, monthEndDate };
}
