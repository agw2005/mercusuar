import { computed, signal } from "@preact/signals";
import { dateToYearMonth } from "#/libs/dateToMonthYear.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";

export const selectedDate = signal(dateToYearMonth(new Date()));

export const startingDayLabel = computed(() =>
  formatIsoToDayMonth(new Date(selectedDate.value).toISOString())
);
