const path = require("path");
[
	path.resolve(__dirname, "../../../.env.local"),
	path.resolve(__dirname, "../../../.env"),
	path.resolve(__dirname, "..", ".env.local"),
	path.resolve(__dirname, "..", ".env"),
	path.resolve(process.cwd(), ".env.local"),
	path.resolve(process.cwd(), ".env"),
].forEach((p) => {
	try {
		require("dotenv").config({ path: p });
	} catch (e) {}
});
const { Redis } = require("@upstash/redis");

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function pulizia() {
	console.log("🧹 Inizio pulizia del database leaderboard...");

	// Eliminiamo SOLO la classifica dei punti.
	// I BNB e i referral rimangono intatti.
	await redis.del("leaderboard:points");

	console.log("✅ Tabellone punti AZZERATO con successo! L'albero Referral e i fondi sono salvi.");
}

pulizia();
