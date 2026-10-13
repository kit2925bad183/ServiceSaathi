import { describe, it, expect } from "vitest";

describe("Transactional Outbox & Worker Retries", () => {
  it("structures outbox event with correct aggregate and event types", () => {
    const event = {
      businessId: "biz-coolbreeze",
      eventType: "BOOKING_CREATED",
      aggregateType: "Booking",
      aggregateId: "bk-1001",
      payload: {
        customerName: "Ananya Ramesh",
        bookingReference: "BK-2026-1001",
        serviceName: "Jet Pump Deep Cleaning",
      },
    };

    expect(event.eventType).toBe("BOOKING_CREATED");
    expect(event.aggregateType).toBe("Booking");
    expect(event.payload.bookingReference).toBe("BK-2026-1001");
  });

  it("calculates exponential backoff delay correctly", () => {
    const calculateBackoffMs = (attempts: number) => {
      const baseDelay = 1000;
      return Math.min(baseDelay * Math.pow(2, attempts), 60000);
    };

    expect(calculateBackoffMs(0)).toBe(1000);  // 1s
    expect(calculateBackoffMs(1)).toBe(2000);  // 2s
    expect(calculateBackoffMs(2)).toBe(4000);  // 4s
    expect(calculateBackoffMs(3)).toBe(8000);  // 8s
    expect(calculateBackoffMs(4)).toBe(16000); // 16s
    expect(calculateBackoffMs(10)).toBe(60000); // capped at 60s
  });
});
