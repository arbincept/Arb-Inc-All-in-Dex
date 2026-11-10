import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_ADDRESS =
	"0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c".toLowerCase();
const TOTAL_SUPPLY = 1_000_000_000;

export async function GET() {
	try {
		const res = await fetch(
			`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`,
			{
				next: { revalidate: 60 },
			},
		);

		if (!res.ok) {
			return NextResponse.json({
				apr: "0.00",
				error: `DexScreener API Status: ${res.status}`,
			});
		}

		const textData = await res.text();
		let data: any;
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

		// 1. Ordina le pool per liquidità decrescente per identificare la pool primaria
		const sortedPairs = [...data.pairs].sort(
			(a: any, b: any) =>
				(parseFloat(b.liquidity?.usd || "0") || 0) -
				(parseFloat(a.liquidity?.usd || "0") || 0),
		);
		const primaryPair = sortedPairs[0] || data.pairs[0];
		const tokenPriceUsd = parseFloat(primaryPair?.priceUsd || "0") || 0;

		// 2. Volume 24h e Liquidità aggregati su TUTTE le pool (multi-pool)
		let totalVolume24hUsd = 0;
		let totalLiquidityUsd = 0;
		for (const pair of data.pairs) {
			totalVolume24hUsd += parseFloat(pair.volume?.h24 || "0") || 0;
			totalLiquidityUsd += parseFloat(pair.liquidity?.usd || "0") || 0;
		}

		// 3. Market Cap del token ARB INC (FDV o Market Cap dalla pool primaria con fallback supply)
		const marketCapUsd =
			parseFloat(primaryPair?.marketCap || primaryPair?.fdv || "0") ||
			TOTAL_SUPPLY * tokenPriceUsd;

		// 4. Calcolo APR Annualizzato: (Volume 24h tutte le pool * 365 / Market Cap) * 100
		let globalApr = 0;
		if (marketCapUsd > 0) {
			globalApr = ((totalVolume24hUsd * 365) / marketCapUsd) * 100;
		}

		// Protezione anti-overflow (max 9,999,999%)
		if (globalApr > 9999999) globalApr = 9999999;

		return NextResponse.json({
			apr: globalApr.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			metrics: {
				volume24hUsd: totalVolume24hUsd,
				liquidityUsd: totalLiquidityUsd,
				marketCapUsd,
				tokenPriceUsd,
				poolCount: data.pairs.length,
				aprSource: "DexScreener multi-pool 24h volume / market cap",
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
