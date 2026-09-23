import { NextResponse } from "next/server";

const KYBER_LIMIT_ORDER_URL =
	"https://limit-order.kyberswap.com/write/api/v1/orders/cancel";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const response = await fetch(KYBER_LIMIT_ORDER_URL, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Origin: "https://kyberswap.com",
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});

		return new NextResponse(await response.text(), {
			status: response.status,
			headers: {
				"Content-Type":
					response.headers.get("content-type") || "application/json",
			},
		});
	} catch {
		return NextResponse.json(
			{ code: 502, message: "Kyber Limit Order service unavailable" },
			{ status: 502 },
		);
	}
}