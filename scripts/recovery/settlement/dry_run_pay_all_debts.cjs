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
const { ethers } = require("ethers");

const parseEther = ethers.parseEther || ethers.utils?.parseEther;
const formatEther = ethers.formatEther || ethers.utils?.formatEther;
const isAddress = ethers.isAddress || ethers.utils?.isAddress;

// Configurazione Redis
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkDebtsReadOnly() {
	console.log("🔍 AVVIO SCRIPT DI SIMULAZIONE (DRY RUN - SOLA LETTURA)...");
	console.log("⚠️ NESSUNA TRANSAZIONE VERRA' INVIATA E NESSUN DATO MODIFICATO SU REDIS.\n");

	let cursor = 0;
	let pendingKeys = [];
	try {
		do {
			const result = await redis.scan(cursor, { match: "rewards:pending:*", count: 1000 });
			cursor = result[0];
			pendingKeys.push(...result[1]);
		} while (cursor !== 0 && cursor !== "0");
	} catch (error) {
		console.error("❌ ERRORE REDIS SCAN:", error.message);
		const allKeys = await redis.keys("rewards:pending:*");
		if (allKeys && allKeys.length > 0) pendingKeys = allKeys;
	}

	if (pendingKeys.length === 0) {
		console.log("🤷‍♂️ Nessun debito pendente trovato in Redis.");
		process.exit(0);
	}

	console.log(`📋 Trovati ${pendingKeys.length} wallet passivi in Redis da verificare.`);

	let totToPay = 0n;
	let validWallets = 0;
	let invalidWallets = 0;

	for (const key of pendingKeys) {
		const walletAddress = key.replace("rewards:pending:", "");
		const pendingStr = await redis.get(key);

		if (!pendingStr || parseFloat(pendingStr) <= 0) continue;

		let amountToPayText = parseFloat(pendingStr).toFixed(18).replace(/\.?0+$/, "");
		if (amountToPayText === "") amountToPayText = "0";
		if (parseFloat(amountToPayText) === 0) continue;

		const amountInWei = BigInt(parseEther(amountToPayText).toString());

		if (!isAddress(walletAddress)) {
			invalidWallets++;
			console.log(`⚠️  Ignorato: ${walletAddress} (Indirizzo Non Valido, non verrebbe pagato)`);
			continue;
		}

		validWallets++;
		totToPay += amountInWei;
		console.log(`✔️  Previsto: ${amountToPayText} BNB a ${walletAddress}`);
	}

	console.log("\n========================================================");
	console.log("📊 REPORT DI SIMULAZIONE PAGAMENTI PENDENTI (SOLA LETTURA)");
	console.log("========================================================");
	console.log(`✅ Indirizzi validi da pagare: ${validWallets}`);
	console.log(`❌ Indirizzi scartati:         ${invalidWallets}`);
	console.log(`💸 Totale stimato necessario:  ${formatEther(totToPay.toString())} BNB`);
	console.log("========================================================\n");
	console.log("Per eseguire i pagamenti ON-CHAIN, esegui: node pay_all_debts.cjs");
	process.exit(0);
}

checkDebtsReadOnly().catch(error => {
	console.error("☠️  ERRORE SCRIPT:", error);
	process.exit(1);
});
