import { describe, it, expect } from "vitest";

describe("Scheduling Conflict & Overlap Prevention Logic", () => {
  interface ScheduledShift {
    technicianId: string;
    startTime: string; // ISO or HH:mm
    endTime: string;
  }

  // Standard interval overlap test: startA < endB AND endA > startB
  function hasTimingConflict(shiftA: ScheduledShift, shiftB: ScheduledShift): boolean {
    if (shiftA.technicianId !== shiftB.technicianId) {
      return false; // Different technicians can work concurrently
    }
    return shiftA.startTime < shiftB.endTime && shiftA.endTime > shiftB.startTime;
  }

  it("detects exact overlap when assigning the same technician to the same time slot", () => {
    const existingJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "10:00",
      endTime: "12:00",
    };

    const newJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "10:00",
      endTime: "12:00",
    };

    expect(hasTimingConflict(existingJob, newJob)).toBe(true);
  });

  it("detects partial overlap when new job starts during an active job", () => {
    const existingJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "10:00",
      endTime: "12:00",
    };

    const overlappingJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "11:30",
      endTime: "13:30",
    };

    expect(hasTimingConflict(existingJob, overlappingJob)).toBe(true);
  });

  it("allows back-to-back jobs without overlap", () => {
    const morningJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "10:00",
      endTime: "12:00",
    };

    const afternoonJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "12:00",
      endTime: "14:00",
    };

    expect(hasTimingConflict(morningJob, afternoonJob)).toBe(false);
  });

  it("allows overlapping times when assigned to different technicians", () => {
    const techOneJob: ScheduledShift = {
      technicianId: "tech-1",
      startTime: "10:00",
      endTime: "12:00",
    };

    const techTwoJob: ScheduledShift = {
      technicianId: "tech-2",
      startTime: "10:00",
      endTime: "12:00",
    };

    expect(hasTimingConflict(techOneJob, techTwoJob)).toBe(false);
  });
});
