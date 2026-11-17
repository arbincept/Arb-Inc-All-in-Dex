import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CONTRACT_ADDRESS = "0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";

export async function GET() {
	try {
		const [tokenRes, distRes, timeRes] = await Promise.all([
			fetch(`https://app.revshare.ltd/api/token/${CONTRACT_ADDRESS}`, {
				headers: { "User-Agent": "Mozilla/5.0" },
				signal: AbortSignal.timeout(6000),
				next: { revalidate: 30 },
			}),
			fetch(`https://app.revshare.ltd/api/token/${CONTRACT_ADDRESS}/distributions`, {
				headers: { "User-Agent": "Mozilla/5.0" },
				signal: AbortSignal.timeout(6000),
				next: { revalidate: 30 },
			}),
			fetch("https://app.revshare.ltd/api/current-time", {
				headers: { "User-Agent": "Mozilla/5.0" },
				signal: AbortSignal.timeout(4000),
				cache: "no-store",
			}),
		]);

		if (!tokenRes.ok || !distRes.ok) {
			throw new Error("Failed to fetch data from RevShare");
		}

		const tokenData = await tokenRes.json();
		const distData = await distRes.json();
		const timeData = timeRes.ok ? await timeRes.json() : null;

		const token = tokenData?.token || tokenData;
		const distributionIntervalMinutes = parseInt(
			token?.distributionInterval || token?.distribution_interval || "5003",
			10,
		);

		if (!Array.isArray(distData) || distData.length === 0) {
			return NextResponse.json({
				success: false,
				error: "No distribution history available",
			});
		}

		// Sort descending to find latest distribution
		const sorted = [...distData].sort(
			(a: any, b: any) =>
				new Date(b.date_added || b.dateAdded).getTime() -
				new Date(a.date_added || a.dateAdded).getTime(),
		);
		const latest = sorted[0];

		// Align 1:1 with RevShare client algorithm
		const t = timeData?.current_date ? new Date(timeData.current_date) : new Date();
		const r = new Date(latest.date_added || latest.dateAdded);
		const l = new Date(r.getTime() + 60 * distributionIntervalMinutes * 1000);

		let remainingMs = 0;
		let isProcessing = false;

		if (l.getTime() < t.getTime()) {
			if (t.getTime() - l.getTime() < 300000) {
				isProcessing = true;
			} else {
				const e = Math.floor(
					Math.floor((t.getTime() - r.getTime()) / 60000) / distributionIntervalMinutes,
				);
				const rem =
					new Date(
						r.getTime() + (e + 1) * distributionIntervalMinutes * 60000,
					).getTime() - t.getTime();
				if (rem <= 0) {
					isProcessing = true;
				} else {
					remainingMs = rem;
				}
			}
		} else {
			remainingMs = l.getTime() - t.getTime();
		}

		const nowMs = Date.now();
		const targetNextPayoutMs = nowMs + remainingMs;

		return NextResponse.json({
			success: true,
			distributionIntervalMinutes,
			lastDistributionDate: latest.date_added || latest.dateAdded,
			nextPayoutDate: new Date(targetNextPayoutMs).toISOString(),
			remainingMs,
			targetNextPayoutMs,
			serverTimeMs: nowMs,
			isProcessing,
		});
	} catch (error: any) {
		console.error("Error in RevShare epoch API:", error);
		// Resilient fallback: 5003-minute cycle anchored to latest confirmed distribution
		const fallbackLastMs = new Date("2026-11-15T22:05:18Z").getTime();
		const intervalMs = 5003 * 60 * 1000;
		const now = Date.now();
		const elapsed = now - fallbackLastMs;
		const cycles = Math.floor(elapsed / intervalMs);
		const targetNextPayoutMs = fallbackLastMs + (cycles + 1) * intervalMs;
		const remainingMs = Math.max(0, targetNextPayoutMs - now);

		return NextResponse.json({
			success: true,
			distributionIntervalMinutes: 5003,
			lastDistributionDate: "2026-11-15 22:05:18",
			nextPayoutDate: new Date(targetNextPayoutMs).toISOString(),
			remainingMs,
			targetNextPayoutMs,
			serverTimeMs: now,
			isProcessing: false,
			fallback: true,
		});
	}
}
