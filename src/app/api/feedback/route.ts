import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JobStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, rating, comment } = body;

    if (!jobId || !rating) {
      return NextResponse.json({ error: "jobId and rating are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Enforce requirement: Feedback must belong to an actual completed job
    if (job.status !== JobStatus.COMPLETED) {
      return NextResponse.json(
        { error: `Cannot submit feedback: Job is currently ${job.status}. Feedback can only be submitted for completed jobs.` },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        businessId: job.businessId,
        jobId: job.id,
        customerId: job.customerId,
        rating: Math.floor(rating),
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record feedback";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
