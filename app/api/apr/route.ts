import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_ADDRESS =
	"0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c".toLowerCase();
const TOTAL_SUPPLY = 1_000_000_000;
const REWARD_TAX_PERCENTAGE = 4.0;
const HOLDER_TAX_SHARE = 0.50; // 50% of the 4% tax goes directly to qualified holders via RevShare
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

		// 2. Total Volume & Participating Capital
		let totalVolume24hUsd = 0;
		for (const pair of data.pairs) {
			totalVolume24hUsd += parseFloat(pair.volume?.h24 || "0");
		}

		// 3. Circulating Token Capital for Holder Rewards
		const primaryPair = data.pairs[0];
		const marketCapUsd = parseFloat(primaryPair?.marketCap || primaryPair?.fdv || "0");
		const totalParticipatingUsd =
			marketCapUsd > 0 ? marketCapUsd : TOTAL_SUPPLY * tokenPriceUsd;
		const totalParticipatingTokens = TOTAL_SUPPLY;

		// 4. Select the strongest available historical window, then annualize it.
		const availableWindows = APR_WINDOWS_DAYS.filter(
			(days) => feeHistory.length >= days,
		);
		let periodDays = 1;
		let swapFeesUsd = 0;
		let aprSource = "DexScreener token volume tax";
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
			swapFeesUsd = bestWindow.feesUsd;
			aprSource = "DeFiLlama swap fees + DexScreener token volume tax";
		}
		// DeFiLlama tracks the 0.5% DEX fee, but not the ARB INC 4% transfer tax
		// when liquidity is too low. Holders receive 50% of this 4% tax via RevShare.
		const tokenTaxFeesUsd =
			totalVolume24hUsd * (REWARD_TAX_PERCENTAGE / 100) * HOLDER_TAX_SHARE * periodDays;
		const periodFeesUsd = swapFeesUsd + tokenTaxFeesUsd;
		const calibratedPeriodFeesUsd =
			periodFeesUsd / APR_CALIBRATION_FACTOR;
		const dailyRewardsUsd = calibratedPeriodFeesUsd / periodDays;
		const yearlyRewardsUsd = dailyRewardsUsd * 365;

		// 5. Matematica Finale APR
		let globalApr = 0;
		if (totalParticipatingUsd > 0) {
			globalApr =
				(yearlyRewardsUsd / totalParticipatingUsd) * 100;
		} else {
			return NextResponse.json({
				apr: "0.00",
				error: "Zero participating capital",
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
				swapFeesUsd,
				tokenTaxFeesUsd,
				calibratedPeriodFeesUsd,
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
