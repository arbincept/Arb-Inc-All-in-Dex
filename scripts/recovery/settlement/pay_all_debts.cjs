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

const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers?.JsonRpcProvider;
const parseEther = ethers.parseEther || ethers.utils?.parseEther;
const formatEther = ethers.formatEther || ethers.utils?.formatEther;
const isAddress = ethers.isAddress || ethers.utils?.isAddress;

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RPC_URL = process.env.RPC_URL || process.env.BSC_RPC_URL || "https://bsc-rpc.publicnode.com";
const PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

async function payDebts() {
	console.log("🚀 AVVIO SCRIPT DI PAGAMENTO MASSIVO (PAY ALL DEBTS)...");

	if (!PRIVATE_KEY) {
		console.error("❌ ERRORE CRITICO: TREASURY_PRIVATE_KEY mancante nel file .env");
		process.exit(1);
	}

	const provider = new JsonRpcProvider(RPC_URL);
	const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

	console.log(`🏦 Wallet Titolare: ${wallet.address}`);
	
	try {
	    const balance = await provider.getBalance(wallet.address);
	    console.log(`💰 Saldo Disponibile On-Chain: ${formatEther(balance.toString())} BNB`);
	} catch (error) {
	    console.error("❌ ERRORE RPC:", error.message);
	    process.exit(1);
	}

	let cursor = 0;
	let pendingKeys = [];
	try {
        do {
            const result = await redis.scan(cursor, { match: "rewards:pending:*", count: 1000 });
            cursor = result[0];
            pendingKeys.push(...result[1]);
        } while (cursor !== 0 && cursor !== "0");
    } catch (error) {
         const allKeys = await redis.keys("rewards:pending:*");
         if (allKeys && allKeys.length > 0) pendingKeys = allKeys;
    }

	if (pendingKeys.length === 0) {
		console.log("🤷‍♂️ Nessun debito pendente.");
		process.exit(0);
	}

	let totSent = 0n;

	for (const key of pendingKeys) {
		const walletAddress = key.replace("rewards:pending:", "");
		const pendingStr = await redis.get(key);
		
		if (!pendingStr || parseFloat(pendingStr) <= 0) continue;
		
		let amountToPayText = parseFloat(pendingStr).toFixed(18).replace(/\.?0+$/, "");
		if (amountToPayText === "") amountToPayText = "0";
		if (parseFloat(amountToPayText) === 0) continue;

		const amountInWei = parseEther(amountToPayText);
		const amountBigInt = BigInt(amountInWei.toString());

		if (!isAddress(walletAddress)) {
			console.log(`⚠️ Ignorato: ${walletAddress}`);
			continue;
		}

		console.log(`🔄 Preparazione invio ${amountToPayText} BNB a ${walletAddress}...`);
		try {
			const tx = await wallet.sendTransaction({ to: walletAddress, value: amountInWei });
			await tx.wait(1); 
			await redis.set(key, "0");
			totSent += amountBigInt;
		} catch (error) {
			console.error(`   ❌ Fallito invio a ${walletAddress}. Errore:`, error.message);
		}
	}
	console.log(`\n💸 Totale Erogato: ${formatEther(totSent.toString())} BNB`);
	process.exit(0);
}

payDebts().catch(error => {
	console.error("☠️ ERRORE SCRIPT:", error);
	process.exit(1);
});
