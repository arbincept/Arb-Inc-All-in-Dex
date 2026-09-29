import { NextResponse } from "next/server";

const KYBER_API_BASE =
	process.env.KYBER_AGGREGATOR_API_URL ||
	"https://api.kyberswap.com/swap/bsc/api/v1";
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

const ALLOWED_QUERY_PARAMS = [
	"tokenIn",
	"tokenOut",
	"amountIn",
	"sender",
	"recipient",
	"slippageTolerance",
	"deadline",
	"gasInclude",
	"feeAmount",
	"chargeFeeBy",
	"isInBps",
	"feeReceiver",
	"origin",
	"source",
	"referral",
	"includedSources",
	"excludedSources",
	"excludeRFQSources",
	"onlyScalableSources",
	"onlyDirectPools",
	"onlySinglePath",
];

export async function GET(request: Request) {
	const apiKey = process.env.KYBER_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "Kyber API key is not configured" },
			{ status: 503 },
		);
	}

	const incoming = new URL(request.url).searchParams;
	const upstream = new URL(`${KYBER_API_BASE}/routes`);

	for (const name of ALLOWED_QUERY_PARAMS) {
		const value = incoming.get(name);
		if (value !== null) upstream.searchParams.set(name, value);
	}

	for (const required of ["tokenIn", "tokenOut", "amountIn", "sender", "recipient"]) {
		if (!upstream.searchParams.has(required)) {
			return NextResponse.json({ error: `Missing ${required}` }, { status: 400 });
		}
	}
	for (const addressParam of ["tokenIn", "tokenOut", "sender", "recipient"]) {
		if (!ADDRESS_PATTERN.test(upstream.searchParams.get(addressParam) || "")) {
			return NextResponse.json({ error: `Invalid ${addressParam}` }, { status: 400 });
		}
	}
	if (!/^[0-9]+$/.test(upstream.searchParams.get("amountIn") || "")) {
		return NextResponse.json({ error: "Invalid amountIn" }, { status: 400 });
	}

	try {
		const headers = {
				Accept: "application/json",
				"X-Api-Key": apiKey,
				"x-client-id": "arb-inc",
		};
		const routeResponse = await fetch(upstream, {
			headers,
			cache: "no-store",
		});
		const routeBody = await routeResponse.json();
		if (!routeResponse.ok || routeBody.code !== 0 || !routeBody.data?.routeSummary) {
			return NextResponse.json(routeBody, { status: routeResponse.status });
		}

		const buildBody: Record<string, unknown> = {
			routeSummary: routeBody.data.routeSummary,
			sender: upstream.searchParams.get("sender"),
			recipient: upstream.searchParams.get("recipient"),
			slippageTolerance: Number(upstream.searchParams.get("slippageTolerance") || 50),
			enableGasEstimation: upstream.searchParams.get("gasInclude") === "true",
		};
		for (const name of [
			"feeAmount",
			"chargeFeeBy",
			"isInBps",
			"feeReceiver",
			"deadline",
		]) {
			const value = upstream.searchParams.get(name);
			if (value !== null) {
				buildBody[name] = ["feeAmount", "deadline"].includes(name)
					? Number(value)
					: name === "isInBps"
						? value === "true"
						: value;
			}
		}
		const response = await fetch(`${KYBER_API_BASE}/route/build`, {
			method: "POST",
			headers: { ...headers, "Content-Type": "application/json" },
			body: JSON.stringify(buildBody),
			cache: "no-store",
		});
		const body = await response.text();
		return new NextResponse(body, {
			status: response.status,
			headers: {
				"Content-Type": response.headers.get("content-type") || "application/json",
			},
		});
	} catch {
		return NextResponse.json({ error: "Kyber swap service unavailable" }, { status: 502 });
	}
}