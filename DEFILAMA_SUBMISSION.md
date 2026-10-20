# DeFiLlama Adapter Submission

## Adapter

The upstream-style reference is [defillama-adapters/aggregators/arbitrage-inc.ts](defillama-adapters/aggregators/arbitrage-inc.ts). Copy it into `aggregators/arbitrage-inc/index.ts` in the DefiLlama `dimension-adapters` repository. The local project excludes `defillama-adapters/` from its application TypeScript build because its imports belong to the upstream repository.

## Scope

- Chain: BNB Smart Chain (`CHAIN.BSC`)
- Start date: `2026-10-01` (earliest local implementation boundary; verify the first on-chain receipt before opening the PR)
- Kyber swap fees received by `0x0F477f8c88b48E299AcE83B14303157d032382EC`
- Kyber limit-order fees received by `0x75F7F06a5C5c440c1aDbd586826CD26253EDE219`
- ARB INC transfer-tax proceeds realized as native BNB from treasury `0x66BB01F14229E2179bAD84D52A69C0e4628dE63f`
- Holder revenue reported with `dailyHoldersRevenue`
- Mayan bridge activity excluded
- No signer, private key, Redis state, wallet leaderboard, or individual user points
- Personal wallet trading activity excluded from protocol volume and fees
- Data dependency: Allium, through upstream `getETHReceived` for native BNB receipts

## Accounting

The adapter reads native BNB received by the treasury wallet `0x66BB01F14229E2179bAD84D52A69C0e4628dE63f`. That wallet receives `40%` of BNB realized when the ARB INC accumulator sells transfer-tax tokens, so:

```text
swapVolume       = swapFees / 0.005
limitOrderVolume = limitOrderFees / 0.001
realizedArbTaxBnb = treasuryBnb / 0.40
dailyRevenue = swapFees + limitOrderFees + realizedArbTaxBnb
dailyHoldersRevenue = realizedArbTaxBnb * 0.292
dailyProtocolRevenue = swapFees + limitOrderFees + realizedArbTaxBnb * 0.708
```

This uses realized BNB proceeds rather than an ARB INC market price. The holder percentage is an accounting allocation, not aggregator volume. Holding points and qualifying DEX activity points only determine each eligible holder's internal pro-rata allocation; they are not adapter inputs.

## Wallet boundaries

The accounting roles are kept distinct:

- Treasury: `0x66BB01F14229E2179bAD84D52A69C0e4628dE63f`
- Accumulator: `0x4c1caA917FD012b285Ba35E93535675e5B59806C`
- Second team wallet (20%): `0x3b523ec5ac7f37a151142b756040301729061348`
- Team/dev fee receiver (40% and personal activity): `0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7`
- Swap fee receiver: `0x0F477f8c88b48E299AcE83B14303157d032382EC`
- Limit-order fee receiver: `0x75F7F06a5C5c440c1aDbd586826CD26253EDE219`

Because the treasury is dedicated and has no other inbound source, the adapter can safely use the treasury as its tax target. The swap and limit-order receivers are distinct, so their fee streams no longer need to be inferred from a shared wallet. The 40% team/personal wallet and the second team wallet are excluded from aggregator volume.

## Volume boundary

The fee adapter does not manufacture `dailyVolume` from ARB INC tax proceeds. Aggregator volume must remain in the Kyber aggregator adapter and must be derived only from identifiable Kyber fee events:

```text
swap volume        = identifiable swap fees / 0.005
limit-order volume = identifiable limit-order fees / 0.001
```

The dedicated receivers allow each fee rate to be applied only to its own stream. Personal activity, team-wallet receipts, accumulator balances, and treasury tax proceeds are excluded from aggregator volume.

## Personal activity boundary

Personal trading by founders, team members, or other individually controlled wallets is not protocol activity. It must not be included in `dailyVolume`, `dailyFees`, `dailyRevenue`, or holder-revenue calculations. Personal wallets and leaderboard activity are excluded unless a future on-chain contract or receiver makes the activity independently identifiable. Internal points may be used for allocation, but they are never adapter inputs.

## Methodology text

**Fees:** Kyber swap fees, Kyber limit-order fees, and ARB INC transfer-tax proceeds realized in BNB from the dedicated treasury allocation.

**Revenue:** All collected Kyber fees plus the full realized ARB INC tax proceeds. No supply-side costs are reported, so `dailyRevenue` equals `dailyFees`; personal activity is excluded.

**Protocol revenue:** 100% of Kyber fees plus the `70.8%` protocol allocation of realized ARB INC tax proceeds.

**Holder revenue:** `29.2%` of realized ARB INC tax proceeds, represented by `40%` treasury allocation multiplied by the `0.73` safety factor. The resulting BNB is distributed to eligible ARB INC holder participants using the protocol's internal allocation rules.

## Submission checklist

1. Copy the adapter into the upstream `dimension-adapters/aggregators/arbitrage-inc/index.ts` path.
2. In a complete upstream checkout, run the repository's adapter test command (`pnpm test`) for BSC and inspect the returned daily breakdown.
3. Confirm no bridge transactions, signer logic, Redis calls, or leaderboard data are present.
4. Submit only the upstream adapter file in the PR; local tests, this document, and `dapp-metadata.json` are not upstream adapter files.
5. Include the project website (`https://arbitrage-inc.exchange/`), repository, and X/Twitter (`@Arbitrageincept`) in the PR description.
