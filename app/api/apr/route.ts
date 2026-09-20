import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL || "",
	token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const TOKEN_ADDRESS =
	"0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c".toLowerCase();
const REWARD_TAX_PERCENTAGE = 4.0;
const APR_CALIBRATION_FACTOR = 3.3;
const DEFILLAMA_FEES_URL =
	"https://api.llama.fi/summary/fees/arbitrage-inc?dataType=dailyFees";
const APR_WINDOWS_DAYS = [3, 7, 14, 30];

export async function GET() {
	try {
		const res = await fetch(
			`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`,
			{
				next: { revalidate: 60 }, // Cache di sicurezza
			},
		);

		if (!res.ok) {
			return NextResponse.json({
				apr: "0.00",
				error: `DexScreener API Status: ${res.status}`,
			});
		}

		const textData = await res.text();
		let data;
		try {
			data = JSON.parse(textData);
		} catch (e) {
			return NextResponse.json({
				apr: "0.00",
				error: "JSON non valido da DexScreener",
			});
		}

		if (!data || !data.pairs || data.pairs.length === 0) {
			return NextResponse.json({
				apr: "0.00",
				error: "Nessuna pair trovata su DexScreener",
			});
		}

		// 1. SCANNER PREZZO: Cerchiamo un prezzo valido in USD tra tutte le pool
		let tokenPriceUsd = 0;
		for (const pair of data.pairs) {
			const price = parseFloat(pair.priceUsd || "0");
			if (price > 0) {
				tokenPriceUsd = price;
				break;
			}
		}

		if (tokenPriceUsd === 0) {
			return NextResponse.json({
				apr: "0.00",
				error: "Prezzo token = 0 su TUTTE le pool trovate",
			});
		}

		const llamaRes = await fetch(DEFILLAMA_FEES_URL, {
			next: { revalidate: 3600 },
		});
		const llamaData = llamaRes.ok ? await llamaRes.json() : null;
		const feeHistory = Array.isArray(llamaData?.totalDataChart)
			? llamaData.totalDataChart.filter(
					(entry: unknown): entry is [number, number] =>
						Array.isArray(entry) &&
						entry.length >= 2 &&
						Number.isFinite(Number(entry[0])) &&
						Number.isFinite(Number(entry[1])),
				)
			: [];

		// 2. ASPIRAPOLVERE VOLUMI: Sommiamo il volume di TUTTE le pools (100% dell'ecosistema)
		let totalVolume24hUsd = 0;
		for (const pair of data.pairs) {
			totalVolume24hUsd += parseFloat(pair.volume?.h24 || "0");
		}

		// 3. Recupero portafogli in gara
		const wallets = await redis.zrange("leaderboard:points", 0, -1);
		let totalParticipatingTokens = 0;

		if (wallets && wallets.length > 0) {
			const keys = wallets.map((w) => `rewards:last_holding:${w}`);
			const holdings = await redis.mget(...keys);

			for (const h of holdings) {
				if (h && h !== "null" && String(h).trim() !== "") {
					try {
						// 5. GIUSTIZIA 9-DECIMALI: Convertiamo i Wei in Token reali
						totalParticipatingTokens += Number(BigInt(String(h))) / 10 ** 9;
					} catch (e) {
						// Protezione contro stringhe corrotte
					}
				}
			}
		}

		const totalParticipatingUsd = totalParticipatingTokens * tokenPriceUsd;

		// 4. Select the strongest available historical window, then annualize it.
		const availableWindows = APR_WINDOWS_DAYS.filter(
			(days) => feeHistory.length >= days,
		);
		let periodDays = 1;
		let periodFeesUsd =
			totalVolume24hUsd * (REWARD_TAX_PERCENTAGE / 100);
		let aprSource = "DexScreener 24h fallback";
		if (availableWindows.length > 0) {
			const bestWindow = availableWindows
				.map((days) => ({
					days,
					feesUsd: feeHistory
						.slice(-days)
						.reduce(
							(sum: number, entry: [number, number]) =>
								sum + Number(entry[1]),
							0,
						),
				}))
				.sort(
					(a, b) =>
						b.feesUsd / b.days - a.feesUsd / a.days,
					)[0];
			periodDays = bestWindow.days;
			periodFeesUsd = bestWindow.feesUsd;
			aprSource = "DeFiLlama historical protocol fees";
		}
		const dailyRewardsUsd = periodFeesUsd / periodDays;
		const yearlyRewardsUsd = dailyRewardsUsd * 365;

		// 5. Matematica Finale APR
		let globalApr = 0;
		if (totalParticipatingUsd > 0) {
				globalApr =
					((yearlyRewardsUsd / totalParticipatingUsd) * 100) /
					APR_CALIBRATION_FACTOR;
		} else {
			return NextResponse.json({
				apr: "0.00",
				error: "Capitale Utenti = 0$ (DB Upstash Vuoto)",
			});
		}

		// Blocco anti-sfondamento div (max 9,999,999%)
		if (globalApr > 9999999) globalApr = 9999999;

		return NextResponse.json({
			// L'APR esce già bellissimo con le virgole (es: 15,400.50)
			apr: globalApr.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			metrics: {
				volume24hUsd: totalVolume24hUsd,
				dailyRewardsUsd: dailyRewardsUsd,
				participatingTokens: totalParticipatingTokens,
				participatingUsd: totalParticipatingUsd,
				tokenPriceUsed: tokenPriceUsd,
				aprCalibrationFactor: APR_CALIBRATION_FACTOR,
				periodDays,
				periodFeesUsd,
				aprSource,
				availableWindows,
			},
		});
	} catch (error: any) {
		console.error("❌ Errore API APR Globale:", error);
		return NextResponse.json(
			{ apr: "0.00", error: "Errore critico interno del server" },
			{ status: 200 },
		);
	}
}
