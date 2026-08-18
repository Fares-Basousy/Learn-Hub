import {
  MAX_END_MINUTE,
  MIN_DURATION_MINUTES,
  MIN_START_MINUTE,
  TIME_STEP_MINUTES,
  durationOptions,
  formatMinutes,
  rangesOverlap,
  startTimeOptions,
} from "@/lib/timetable";

describe("formatMinutes", () => {
  it("formats morning times with AM", () => {
    expect(formatMinutes(9 * 60)).toBe("9:00 AM");
  });

  it("formats afternoon times with PM", () => {
    expect(formatMinutes(13 * 60)).toBe("1:00 PM");
  });

  it("formats noon as 12 PM, not 0 PM", () => {
    expect(formatMinutes(12 * 60)).toBe("12:00 PM");
  });

  it("formats midnight as 12 AM, not 0 AM", () => {
    expect(formatMinutes(0)).toBe("12:00 AM");
  });

  it("pads single-digit minutes", () => {
    expect(formatMinutes(9 * 60 + 5)).toBe("9:05 AM");
  });
});

describe("startTimeOptions", () => {
  it("starts at MIN_START_MINUTE and steps by TIME_STEP_MINUTES", () => {
    const options = startTimeOptions();
    expect(options[0]).toBe(MIN_START_MINUTE);
    expect(options[1] - options[0]).toBe(TIME_STEP_MINUTES);
  });

  it("never offers a start time that can't fit the minimum duration", () => {
    const options = startTimeOptions();
    for (const start of options) {
      expect(start + MIN_DURATION_MINUTES).toBeLessThanOrEqual(MAX_END_MINUTE);
    }
  });
});

describe("durationOptions", () => {
  it("includes the 1.5h (90 minute) minimum session length", () => {
    // Regression test: MIN_DURATION_MINUTES was previously 120 (2h), which made
    // 1.5h sessions impossible to schedule from the admin UI.
    expect(durationOptions(MIN_START_MINUTE)).toContain(90);
  });

  it("only offers durations that fit before the closing time", () => {
    const start = MAX_END_MINUTE - 100;
    for (const d of durationOptions(start)) {
      expect(start + d).toBeLessThanOrEqual(MAX_END_MINUTE);
    }
  });
});

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(rangesOverlap(60, 120, 90, 150)).toBe(true);
  });

  it("detects one range fully containing another", () => {
    expect(rangesOverlap(0, 200, 50, 100)).toBe(true);
  });

  it("does not flag adjacent (back-to-back) ranges as overlapping", () => {
    expect(rangesOverlap(60, 120, 120, 180)).toBe(false);
  });

  it("does not flag disjoint ranges", () => {
    expect(rangesOverlap(60, 90, 200, 240)).toBe(false);
  });
});
