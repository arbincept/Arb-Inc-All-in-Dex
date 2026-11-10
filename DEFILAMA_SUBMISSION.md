# DeFiLlama Aggregator Adapter Submission - Arbitrage Inc

## Adapter Path in Upstream Repository
`aggregators/arbitrage-inc/index.ts` in [DefiLlama/dimension-adapters](https://github.com/DefiLlama/dimension-adapters)

---

## 🎯 PR Title
`refactor(aggregators): arbitrage-inc - return to clean native model with dedicated swap & limit order receivers`

---

## 📝 PR Description (Ready to Copy-Paste for DefiLlama)

```markdown
### Project Name
Arbitrage Inc.

### Project Type
DEX Aggregator (BNB Smart Chain)

### Website & Links
- Website: https://arbitrage-inc.exchange
- Twitter/X: https://x.com/Arbitrageincept

---

### Summary of Changes: Return to Clean Original Architecture

Following feedback from maintainers (@bheluga), this PR streamlines and refactors the `arbitrage-inc` aggregator adapter back to our first approved, robust architecture (`b915a976` / PR #6279):

1. **Purged All Token Transfer Tax & RevShare Accounting**:
   - In full compliance with DefiLlama policy (*"transfer taxes cannot be fees or revenue"*), we have completely removed token tax accumulators, treasury reserves, and custom tax multipliers.
   - The adapter now exclusively tracks **100% genuine platform routing fees** from executed trades.

2. **Native Reliability (Zero Allium / External API Key Dependencies)**:
   - Eliminated `Dependencies.ALLIUM` and `getETHReceived` calls which were causing CI failures when the test runner lacked an Allium API key.
   - The adapter relies strictly on DefiLlama's standard `addTokensReceived` helper, resolving seamlessly across both indexer and native RPC event logs.

3. **Accurate Active Fee Receiver Wallets**:
   - **Dedicated Swap Fee Receiver**: `0x0F477f8c88b48E299AcE83B14303157d032382EC` (0.5% fee rate / 50 BPS).
   - **Dedicated Limit Order Fee Receiver**: `0x75F7F06a5C5c440c1aDbd586826CD26253EDE219` (0.1% fee rate / 10 BPS).
   - **Legacy Swap Fee Receiver** (pre-October 1, 2026): `0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7` (0.1% fee rate).

4. **Transparent Volume Derivation**:
   - `dailyVolume` = `(swapFees / 0.005) + (limitOrderFees / 0.001)`.
   - `dailyFees` = `swapFees + limitOrderFees`.
   - `dailyRevenue` = `dailyFees` (no supply-side costs).
   - `dailyProtocolRevenue` = `dailyFees`.
```

---

## 💻 Adapter Code (`aggregators/arbitrage-inc/index.ts`)

```typescript
import type { FetchOptions, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { addTokensReceived } from "../../helpers/token";

// Protocol fee receivers on BSC:
// - SWAP_FEE_RECEIVER: Dedicated BSC swap fee receiver (0.5% fee rate)
const SWAP_FEE_RECEIVER = "0x0F477f8c88b48E299AcE83B14303157d032382EC";
// - LIMIT_ORDER_FEE_RECEIVER: Dedicated BSC limit-order fee receiver (0.1% fee rate)
const LIMIT_ORDER_FEE_RECEIVER = "0x75F7F06a5C5c440c1aDbd586826CD26253EDE219";

// Legacy receiver used before the October 1, 2026 migration (0.1% fee rate)
const LEGACY_SWAP_FEE_RECEIVER = "0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7";
const RECEIVER_MIGRATION_TIMESTAMP = 1790812800; // 2026-10-01 00:00:00 UTC

const SWAP_FEE_RATE = 0.005; // 0.5%
const LIMIT_ORDER_FEE_RATE = 0.001; // 0.1%
const LEGACY_FEE_RATE = 0.001; // 0.1%

const fetch = async (options: FetchOptions) => {
	const timestamp = options.endTimestamp ?? (options.startTimestamp + 86400);

	// Pre-migration (before Oct 1, 2026): Legacy single receiver at 0.1% fee rate
	if (timestamp <= RECEIVER_MIGRATION_TIMESTAMP) {
		const dailyFees = await addTokensReceived({
			options,
			targets: [LEGACY_SWAP_FEE_RECEIVER],
		});
		const dailyVolume = dailyFees.clone(1 / LEGACY_FEE_RATE);

		return {
			dailyFees,
			dailyRevenue: dailyFees,
			dailyProtocolRevenue: dailyFees,
			dailyVolume,
		};
	}

	// Current model (Oct 1, 2026 onward): Dedicated Swap (0.5%) & Limit Order (0.1%) receivers
	const [swapFees, limitOrderFees] = await Promise.all([
		addTokensReceived({ options, targets: [SWAP_FEE_RECEIVER] }),
		addTokensReceived({ options, targets: [LIMIT_ORDER_FEE_RECEIVER] }),
	]);

	const dailyFees = options.createBalances();
	dailyFees.add(swapFees, "Swap Fees");
	dailyFees.add(limitOrderFees, "Limit Order Fees");

	const dailyVolume = options.createBalances();
	dailyVolume.add(swapFees.clone(1 / SWAP_FEE_RATE), "Swap Volume");
	dailyVolume.add(limitOrderFees.clone(1 / LIMIT_ORDER_FEE_RATE), "Limit Order Volume");

	return {
		dailyFees,
		dailyRevenue: dailyFees,
		dailyProtocolRevenue: dailyFees,
		dailyVolume,
	};
};

const methodology = {
	Volume:
		"Routed trading volume inferred from collected protocol fees: swap fees divided by 0.5% (200x) and limit order fees divided by 0.1% (1000x). Pre-October 1, 2026 volume is inferred from the legacy receiver at 0.1%.",
	Fees:
		"Protocol routing fees collected from trades executed via Arbitrage Inc on BSC: 0.5% on DEX swaps to 0x0F477f8c88b48E299AcE83B14303157d032382EC and 0.1% on limit orders to 0x75F7F06a5C5c440c1aDbd586826CD26253EDE219.",
	Revenue:
		"100% of collected protocol fees from DEX swaps and limit orders are retained by the protocol.",
	ProtocolRevenue:
		"100% of collected trading fees are protocol revenue.",
};

const breakdownMethodology = {
	Volume: {
		"Swap Volume": "Volume routed through DEX swaps (fees / 0.005).",
		"Limit Order Volume": "Volume routed through limit orders (fees / 0.001).",
	},
	Fees: {
		"Swap Fees": "0.5% protocol routing fee collected on DEX swaps.",
		"Limit Order Fees": "0.1% protocol fee collected on executed limit orders.",
	},
	Revenue: {
		"Swap Fees": "0.5% protocol routing fee collected on DEX swaps.",
		"Limit Order Fees": "0.1% protocol fee collected on executed limit orders.",
	},
	ProtocolRevenue: {
		"Swap Fees": "0.5% protocol routing fee collected on DEX swaps.",
		"Limit Order Fees": "0.1% protocol fee collected on executed limit orders.",
	},
};

const adapter: SimpleAdapter = {
	version: 2,
	pullHourly: true,
	chains: [CHAIN.BSC],
	fetch,
	start: "2026-03-23",
	methodology,
	breakdownMethodology,
};

export default adapter;
```
