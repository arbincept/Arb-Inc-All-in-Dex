import { NextResponse } from "next/server";

const KYBER_API_BASE =
	process.env.KYBER_AGGREGATOR_API_URL ||
	"https://api.kyberswap.com/swap/bsc/api/v1";
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const tokenIn = searchParams.get("tokenIn");
	const tokenOut = searchParams.get("tokenOut");
	const amountIn = searchParams.get("amountIn");

	if (
		!tokenIn ||
		!tokenOut ||
		!amountIn ||
		!ADDRESS_PATTERN.test(tokenIn) ||
		!ADDRESS_PATTERN.test(tokenOut) ||
		!/^[0-9]+$/.test(amountIn)
	) {
		return NextResponse.json({ error: "Invalid Kyber quote parameters" }, { status: 400 });
	}

	const upstreamUrl = new URL(`${KYBER_API_BASE}/routes`);
	upstreamUrl.searchParams.set("tokenIn", tokenIn);
	upstreamUrl.searchParams.set("tokenOut", tokenOut);
	upstreamUrl.searchParams.set("amountIn", amountIn);

	const headers: HeadersInit = {
		Accept: "application/json",
		"x-client-id": "arb-inc",
	};
	if (process.env.KYBER_API_KEY) {
		headers["X-Api-Key"] = process.env.KYBER_API_KEY;
	}

	try {
		const response = await fetch(upstreamUrl, { headers, cache: "no-store" });
		const body = await response.text();
		return new NextResponse(body, {
			status: response.status,
			headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
		});
	} catch {
		return NextResponse.json({ error: "Kyber quote service unavailable" }, { status: 502 });
	}
}