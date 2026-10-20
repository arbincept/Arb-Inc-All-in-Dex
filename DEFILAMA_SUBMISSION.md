# DeFiLlama Adapter Submission - Arbitrage Inception

## Adapter Path in Upstream Repository
`aggregators/arbitrage-inc/index.ts` in [DefiLlama/dimension-adapters](https://github.com/DefiLlama/dimension-adapters)

## Scope & Accounting Eras

### 1. Legacy Era (2026-03-23 to 2026-09-30)
- Legacy swap fee receiver: `0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7` (0.1% -> 0.5% transition on June 8, 2026).
- Accumulator ARB INC token tax: `0x4c1caA917FD012b285Ba35E93535675e5B59806C`.
- 40% treasury allocation * 0.73 safety factor = 29.2% holders revenue, 60% protocol tax revenue.

### 2. October Migration Era (2026-10-01 to 2026-10-19)
- Dedicated Kyber swap fee receiver: `0x0F477f8c88b48E299AcE83B14303157d032382EC` (0.5% routing fee).
- Dedicated Kyber limit-order fee receiver: `0x75F7F06a5C5c440c1aDbd586826CD26253EDE219` (0.1% routing fee).
- Treasury wallet (`0x66BB01F14229E2179bAD84D52A69C0e4628dE63f`) received 40% realized BNB tax proceeds.
- Safe factor (0.73) applied to treasury allocation (29.2% holders revenue, 70.8% protocol tax revenue).

### 3. Automated RevShare Era (2026-10-20 Onward)
- Swap fee receiver: `0x0F477f8c88b48E299AcE83B14303157d032382EC` (0.5% routing fee) - Confirmed unchanged.
- Limit-order fee receiver: `0x75F7F06a5C5c440c1aDbd586826CD26253EDE219` (0.1% routing fee) - Confirmed unchanged.
- Treasury intermediary (`0x66BB...`) is decommissioned.
- Safe factor is permanently eliminated.
- Transfer tax (4%) is collected by `TAX_ACCUMULATOR` (`0x4c1caA917FD012b285Ba35E93535675e5B59806C`) and split directly:
  - `dailyHoldersRevenue`: 50% distributed directly to token holders (holding >= 1,000,000 ARB INC) every 24 hours on-chain via RevShare.
  - `dailyProtocolRevenue`: 100% of Kyber swap fees + 100% of limit-order fees + 50% of ARB INC token tax.
  - `dailyFees`: swapFees + limitOrderFees + 100% token tax.
  - `dailyRevenue`: dailyFees.
  - `dailyVolume`: swapFees / 0.005 + limitOrderFees / 0.001.

## Accounting Formulas (Post-October 20, 2026)

```text
swapVolume          = swapFees / 0.005
limitOrderVolume    = limitOrderFees / 0.001
tokenTax            = accumulator ARB INC token transfers
dailyHoldersRevenue = tokenTax * 0.50
dailyProtocolRevenue = swapFees + limitOrderFees + (tokenTax * 0.50)
dailyFees           = swapFees + limitOrderFees + tokenTax
dailyRevenue        = dailyFees
dailyVolume         = swapVolume + limitOrderVolume
```
