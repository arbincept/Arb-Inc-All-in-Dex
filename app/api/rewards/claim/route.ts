import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
	return NextResponse.json(
		{
			success: false,
			message: "Manual claiming is deprecated. ARB INC token tax is automated on-chain via RevShare. Currently routed 100% split 50/50 across the two core dev wallets pending RevShare upstream holder distribution fix. Visit https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c",
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
