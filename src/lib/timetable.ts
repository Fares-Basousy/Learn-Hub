export const CLASSROOMS = ["Classroom 1", "Classroom 2", "Classroom 3"];

export const MIN_START_MINUTE = 8 * 60; // 8:00 AM
export const MAX_END_MINUTE = 22 * 60; // 10:00 PM
export const MIN_DURATION_MINUTES = 90;
export const TIME_STEP_MINUTES = 30;

export function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function startTimeOptions(): number[] {
  const options: number[] = [];
  for (
    let m = MIN_START_MINUTE;
    m + MIN_DURATION_MINUTES <= MAX_END_MINUTE;
    m += TIME_STEP_MINUTES
  ) {
    options.push(m);
  }
  return options;
}

export function durationOptions(startMinute: number): number[] {
  const options: number[] = [];
  for (
    let d = MIN_DURATION_MINUTES;
    startMinute + d <= MAX_END_MINUTE;
    d += TIME_STEP_MINUTES
  ) {
    options.push(d);
  }
  return options;
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
