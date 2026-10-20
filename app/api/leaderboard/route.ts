import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	return NextResponse.json({
		leaderboard: [],
		status: "migrated_to_revshare",
		revshare_url:
			"https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c",
	});
}
