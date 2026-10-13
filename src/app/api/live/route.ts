import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || !session.userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Derive verified active business membership
  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      ...(session.activeBusinessId ? { businessId: session.activeBusinessId } : {}),
      isActive: true,
    },
    include: { business: true },
  });

  if (!membership) {
    return new Response(JSON.stringify({ error: "No active business workspace" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const businessId = membership.businessId;
  const userId = session.userId;
  const userRole = membership.role;

  // Setup Server-Sent Events stream
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection event
  const initData = JSON.stringify({
    type: "CONNECTED",
    businessId,
    userId,
    role: userRole,
    timestamp: new Date().toISOString(),
  });
  writer.write(encoder.encode(`event: connected\ndata: ${initData}\n\n`));

  // Interval to send periodic heartbeat and check for recent outbox events
  let lastChecked = new Date();
  const intervalId = setInterval(async () => {
    try {
      // Query recent outbox events strictly scoped to this business
      const recentEvents = await prisma.outboxEvent.findMany({
        where: {
          businessId,
          createdAt: { gt: lastChecked },
        },
        take: 5,
        orderBy: { createdAt: "asc" },
      });

      lastChecked = new Date();

      if (recentEvents.length > 0) {
        for (const evt of recentEvents) {
          const payload = JSON.stringify({
            id: evt.id,
            eventType: evt.eventType,
            aggregateType: evt.aggregateType,
            aggregateId: evt.aggregateId,
            status: evt.status,
            createdAt: evt.createdAt,
          });
          writer.write(encoder.encode(`event: update\ndata: ${payload}\n\n`));
        }
      } else {
        // Send heartbeat ping
        writer.write(encoder.encode(`event: ping\ndata: {"time":"${new Date().toISOString()}"}\n\n`));
      }
    } catch {
      // ignore writer error if disconnected
    }
  }, 4000);

  // Close writer when client disconnects
  req.signal.addEventListener("abort", () => {
    clearInterval(intervalId);
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
