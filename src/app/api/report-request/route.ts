import { NextRequest, NextResponse } from "next/server";

interface AbusiveReport {
  id: string;
  requestId: string;
  reason: string;
  reporterPhone?: string;
  reportedAt: string;
}

const reportsStore: AbusiveReport[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, reason, reporterPhone } = body;

    if (!requestId || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or reason" },
        { status: 400 }
      );
    }

    const report: AbusiveReport = {
      id: crypto.randomUUID(),
      requestId,
      reason,
      reporterPhone,
      reportedAt: new Date().toISOString(),
    };

    reportsStore.push(report);

    return NextResponse.json({
      success: true,
      message: "Request reported. Our safety system will review it immediately.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
