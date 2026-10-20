import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	return NextResponse.json({
		status: "active",
		model: "automated_revshare",
		totalPoints: "0",
		totalPending: "0.0000",
		protocolDebt: "0.0000",
	});
}
