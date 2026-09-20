import { useEffect, useState } from "react";

export const useProtocolData = (
	CONTRACT_ADDRESS: string,
	TREASURY_WALLET: string,
	ACCUMULATOR_WALLET: string,
) => {
	const [data, setData] = useState({
		tokenVolume24h: null as number | null,
		tokenLiquidity: null as number | null,
		treasuryBnb: "...",
		accBnb: "...",
		accTokens: "...",
		protocolDebt: "...",
		globalApr: "...",
		aprPeriodDays: null as number | null,
		aprPeriodFeesUsd: null as number | null,
		aprSource: "",
		timerDisplay: "...",
		isProcessing: false,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resDex = await fetch(
					`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`,
				);
				const dataDex = await resDex.json();
				let vol = 0,
					liq = 0;
				if (dataDex.pairs) {
					vol = dataDex.pairs.reduce(
						(acc: number, pair: any) => acc + (pair.volume?.h24 || 0),
						0,
					);
					liq = dataDex.pairs.reduce(
						(acc: number, pair: any) => acc + (pair.liquidity?.usd || 0),
						0,
					);
				}

				const fetchRpcWithFallback = async (method: string, params: any[]) => {
					const endpoints = [
						"https://binance.nodereal.io",
						"https://bsc-rpc.publicnode.com",
					];
					for (const url of endpoints) {
						try {
							const res = await fetch(url, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								signal: AbortSignal.timeout(4000),
								body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
							});
							if (res.ok) {
								const data = await res.json();
								if (data.result !== undefined) return data;
							}
						} catch (e) {
							// fallback al prossimo endpoint
						}
					}
					return { result: "0x0" };
				};

				const [dT, dAB, dAT] = await Promise.all([
					fetchRpcWithFallback("eth_getBalance", [TREASURY_WALLET, "latest"]),
					fetchRpcWithFallback("eth_getBalance", [ACCUMULATOR_WALLET, "latest"]),
					fetchRpcWithFallback("eth_call", [
						{
							to: CONTRACT_ADDRESS,
							data:
								"0x70a08231" +
								ACCUMULATOR_WALLET.substring(2).padStart(64, "0"),
						},
						"latest",
					]),
				]);
				const [statsRes, aprRes] = await Promise.all([
					fetch("/api/stats"),
					fetch("/api/apr"),
				]);

				const sData = statsRes.ok ? await statsRes.json() : {};
				const aData = aprRes.ok ? await aprRes.json() : {};

				setData((prev) => ({
					...prev,
					tokenVolume24h: vol,
					tokenLiquidity: liq,
					treasuryBnb: dT.result
						? (Number(BigInt(dT.result)) / 1e18).toFixed(4)
						: "...",
					accBnb: dAB.result
						? (Number(BigInt(dAB.result)) / 1e18).toFixed(4)
						: "...",
					accTokens: dAT.result
						? (Number(BigInt(dAT.result)) / 1e9).toLocaleString(undefined, {
								maximumFractionDigits: 0,
							})
						: "...",
					protocolDebt: sData.protocolDebt || "0.0000",
					globalApr: aData.apr ? aData.apr + "%" : "...",
					aprPeriodDays: aData.metrics?.periodDays || null,
					aprPeriodFeesUsd: aData.metrics?.periodFeesUsd || null,
					aprSource: aData.metrics?.aprSource || "",
				}));
			} catch (e) {
				console.error("Data fetch error:", e);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 60000);

		const ANCHOR_TIME = new Date("2026-09-17T04:35:00-03:00").getTime();
		const INTERVAL = 24 * 60 * 60 * 1000;

		const tInterval = setInterval(() => {
			const now = new Date().getTime();
			const elapsed = now - ANCHOR_TIME;
			const cycles = Math.floor(elapsed / INTERVAL);
			const lastPayout = ANCHOR_TIME + cycles * INTERVAL;
			const nextPayout = lastPayout + INTERVAL;
			const timeSinceLast = now - lastPayout;

			if (timeSinceLast >= 0 && timeSinceLast <= 120000) {
				setData((prev) => ({
					...prev,
					isProcessing: true,
					timerDisplay: "Processing...",
				}));
			} else {
				const diff = nextPayout - now;
				const h = Math.floor(diff / 3600000);
				const m = Math.floor((diff % 3600000) / 60000);
				const s = Math.floor((diff % 60000) / 1000);
				setData((prev) => ({
					...prev,
					isProcessing: false,
					timerDisplay: `${h}h ${m}m ${s}s`,
				}));
			}
		}, 1000);

		return () => {
			clearInterval(interval);
			clearInterval(tInterval);
		};
	}, [CONTRACT_ADDRESS, TREASURY_WALLET, ACCUMULATOR_WALLET]);

	return data;
};
