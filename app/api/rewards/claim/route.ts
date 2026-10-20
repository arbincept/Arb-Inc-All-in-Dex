import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
	return NextResponse.json(
		{
			success: false,
			message: "Manual claiming is deprecated. ARB INC rewards are now automatically pushed on-chain every 24 hours to qualified holders via RevShare (Min. 1,000,000 ARB). Visit https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c",
		},
		{ status: 200 },
	);
}

export async function GET() {
	return NextResponse.json({
		status: "migrated_to_revshare",
		revshare_url: "https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c",
	});
}
