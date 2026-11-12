import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CONTRACT_ADDRESS = "0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";

export async function GET() {
	try {
		const [tokenRes, distRes, timeRes] = await Promise.all([
			fetch(`https://app.revshare.ltd/api/token/${CONTRACT_ADDRESS}`, {
				headers: { "User-Agent": "Mozilla/5.0" },
				next: { revalidate: 60 },
			}),
			fetch(`https://app.revshare.ltd/api/token/${CONTRACT_ADDRESS}/distributions`, {
				headers: { "User-Agent": "Mozilla/5.0" },
				next: { revalidate: 60 },
			}),
			fetch("https://app.revshare.ltd/api/current-time", {
				headers: { "User-Agent": "Mozilla/5.0" },
				cache: "no-store",
			}),
		]);

		if (!tokenRes.ok || !distRes.ok) {
			throw new Error("Failed to fetch data from RevShare");
		}

		const tokenData = await tokenRes.json();
		const distData = await distRes.json();

		let currentTimeMs = Date.now();
		if (timeRes.ok) {
			const timeData = await timeRes.json();
			if (timeData?.current_date) {
				currentTimeMs = new Date(timeData.current_date).getTime();
			}
		}

		const token = tokenData?.token || tokenData;
		const distributionIntervalMinutes = parseInt(token?.distributionInterval || "7000", 10);

		if (!Array.isArray(distData) || distData.length === 0) {
			return NextResponse.json({
				success: false,
				error: "No distribution history available",
			});
		}

		// Sort to find latest distribution
		const sorted = [...distData].sort(
			(a: any, b: any) =>
				new Date(b.date_added || b.dateAdded).getTime() -
				new Date(a.date_added || a.dateAdded).getTime(),
		);
		const latest = sorted[0];
		const lastDistributionMs = new Date(latest.date_added || latest.dateAdded).getTime();

		const intervalMs = distributionIntervalMinutes * 60 * 1000;
		const elapsedSinceLast = currentTimeMs - lastDistributionMs;

		let targetNextPayoutMs: number;
		let isProcessing = false;

		if (elapsedSinceLast < intervalMs) {
			targetNextPayoutMs = lastDistributionMs + intervalMs;
		} else {
			const overtime = elapsedSinceLast - intervalMs;
			if (overtime < 300000) {
				isProcessing = true;
				targetNextPayoutMs = lastDistributionMs + intervalMs;
			} else {
				const cycles = Math.floor(elapsedSinceLast / intervalMs);
				targetNextPayoutMs = lastDistributionMs + (cycles + 1) * intervalMs;
			}
		}

		return NextResponse.json({
			success: true,
			distributionIntervalMinutes,
			lastDistributionDate: new Date(lastDistributionMs).toISOString(),
			nextPayoutDate: new Date(targetNextPayoutMs).toISOString(),
			targetNextPayoutMs,
			serverTimeMs: currentTimeMs,
			isProcessing,
		});
	} catch (error: any) {
		console.error("Error in RevShare epoch API:", error);
		// Resilient fallback: 7000-minute cycle anchored to latest confirmed distribution
		const fallbackLastMs = new Date("2026-11-11T01:22:51Z").getTime();
		const intervalMs = 7000 * 60 * 1000;
		const now = Date.now();
		const elapsed = now - fallbackLastMs;
		const cycles = Math.floor(elapsed / intervalMs);
		const targetNextPayoutMs = fallbackLastMs + (cycles + 1) * intervalMs;

		return NextResponse.json({
			success: true,
			distributionIntervalMinutes: 7000,
			lastDistributionDate: "2026-11-11T01:22:51.000Z",
			nextPayoutDate: new Date(targetNextPayoutMs).toISOString(),
			targetNextPayoutMs,
			serverTimeMs: now,
			isProcessing: false,
			fallback: true,
		});
	}
}
