import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const { txHash, userWallet } = body;

		return NextResponse.json({
			success: true,
			txHash: txHash || "",
			userWallet: userWallet || "",
			status: "migrated_to_revshare",
			message: "Swap recorded. Holder rewards are automated via RevShare.",
		});
	} catch (e: any) {
		return NextResponse.json({ success: true });
	}
}
