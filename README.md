<div align="center">

# Arb-Inc All-in-Dex

[![CI](https://github.com/arbincept/Arb-Inc-All-in-Dex/actions/workflows/ci.yml/badge.svg)](https://github.com/arbincept/Arb-Inc-All-in-Dex/actions/workflows/ci.yml)

**Swap, bridge, and explore DeFi from one open-source interface.**

Built and maintained by **[Luca Celebrano · @Lukecele](https://github.com/Lukecele)**, founder of [Arbitrage Inception](https://github.com/arbincept).

**[Open app](https://arbitrage-inc.exchange)** · **[Follow Lukecele](https://github.com/Lukecele)** · **[Quick start](#quick-start)** · **[MIT license](LICENSE)**

</div>

> [!TIP]
> **Support Open-Source DeFi Development!**  
> If you find **Arb-Inc All-in-Dex** useful for your trades, research, or builds, please take a moment to **give this repository a ⭐ Star** in the top-right corner! Your star directly helps boost protocol indexing, visibility, and ongoing open-source maintenance.


![All-in-Dex application home with swap, bridge and protocol telemetry](public/live-home.png)

<sub>Application screenshot from this repository. Live data and available routes change over time.</sub>

## What you can explore

| Feature | Start here |
| :--- | :--- |
| **DEX aggregation** | Compare routed quotes through KyberSwap in the [swap interface](https://arbitrage-inc.exchange/swap-all). |
| **Cross-chain bridging** | Explore EVM and Solana routes through Mayan Finance in the [bridge](https://arbitrage-inc.exchange/bridge). |
| **Limit orders** | Inspect the [limit-order interface](https://arbitrage-inc.exchange/limit-orders) and its wallet authorization flow. |
| **Lending and staking** | Open the [Earn gateway](https://arbitrage-inc.exchange/vaults), which links to the separate Earn application. |
| **Protocol telemetry** | Explore the dashboard and [public DefiLlama metrics](https://defillama.com/protocol/arbitrage-inc). |

Built with **Next.js, React, TypeScript, viem, and wagmi**, with a PWA manifest for mobile installation.

## Try it

1. Open the swap interface, select an input and output asset such as BNB and USDT, and enter an amount.
2. Connect a wallet to request a quote; the current interface requires a wallet address for the quote request.
3. Inspect the quote, route, fees, price impact, and slippage. Review the transaction before signing if you choose to execute it.

Quotes and supported routes depend on the underlying providers and current liquidity.

![BNB to USDT quote preview showing estimated output, slippage, platform fee and router](public/demo/swap-quote.png)

<sub>Quote snapshot supplied by the maintainer. Displayed values change with provider responses and liquidity. [Screenshot details](docs/demo.md).</sub>

## Quick start

Use **Node.js 22+** and **npm**, matching the repository's CI toolchain.

```bash
git clone https://github.com/arbincept/Arb-Inc-All-in-Dex.git
cd Arb-Inc-All-in-Dex
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

**Configuration:** [.env.example](.env.example) lists provider settings. All DEX operations (swaps, limit orders, and bridging) are non-custodial and execute client-side via the user's Web3 wallet. Token holder revenue sharing is handled automatically on-chain through RevShare (50% to qualified holders, 50% to protocol operations), completely eliminating the need for server-side hot signers or reward claim custody. Optional companion telemetry/leaderboard endpoints can use `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` when enabled. Keep all provider secrets outside `NEXT_PUBLIC_*` variables.

### Project checks

```bash
npm test
npm run build
```

The test command covers financial math and Web3 security logic. These commands are also used in [CI](.github/workflows/ci.yml).

## How it fits together

- **Wallet-based trading:** the frontend connects a user's wallet to non-custodial swap, bridge, and limit-order integrations.
- **Automated RevShare:** 50% of the 4% ARB INC token transfer tax is pushed automatically on-chain every 24 hours to qualified holders (>= 1,000,000 ARB), while 50% is allocated to protocol operations. No manual claiming or server hot-wallet signers are used.
- **Monitoring:** [scripts](scripts/README.md) contain operational tooling; [API documentation](docs/API.md) describes the companion endpoints.

## Fees and deployment notes

- Supported aggregated swaps apply a **0.5% protocol fee**.
- The **ARB INC token has a 4% transfer tax** on buys and sells, split evenly (50/50) between holder RevShare and protocol operations.
- Bridge fees and source/destination gas depend on the route.
- RevShare distributions occur automatically on-chain based on accumulated token transfer taxes.

Read the [contract disclosures](AUDIT.md), [security documentation](docs/SECURITY.md), and [whitepaper](docs/WHITEPAPER.md) for deployment details. Automated scans do not establish a manual audit or guarantee transaction safety.

[Terms](https://arbitrage-inc.exchange/terms-of-service) · [Privacy](https://arbitrage-inc.exchange/privacy-policy) · [Italian disclaimer](DISCLAIMER_IT.md)

## Open-source references

- **DefiLlama:** fee adapter contributions [#6275](https://github.com/DefiLlama/dimension-adapters/pull/6275) and [#9453](https://github.com/DefiLlama/dimension-adapters/pull/9453).
- **Awesome-Web3:** included through [merged submission #796](https://github.com/ahmet/awesome-web3/pull/796).

## Contribute

Reproducible bug reports, clearer documentation, and focused improvements are welcome. Start with an [issue](https://github.com/arbincept/Arb-Inc-All-in-Dex/issues) describing the behavior, environment, and expected result. Include the relevant checks with a pull request.

For sensitive reports, use the organization's [security policy](https://github.com/arbincept/.github/blob/main/SECURITY.md).

## More from Lukecele

This project is part of an independent ecosystem built by **[Luca Celebrano (@Lukecele)](https://github.com/Lukecele)**.

[Inception Flap Scanner](https://github.com/arbincept/inception-flap-scanner) · [BSC Arbitrage Scanner](https://github.com/arbincept/bsc-arbitrage-scanner) · [Arbitrage Inc Earn](https://github.com/arbincept/arbitrage-inc-earn)

If this project helps you, **[give it a star](https://github.com/arbincept/Arb-Inc-All-in-Dex)** and **[follow Lukecele](https://github.com/Lukecele)** for future builds. [Sponsorship](https://github.com/sponsors/Lukecele) helps support ongoing work.

[Telegram](https://t.me/ArbitrageInception) · [Updates on X](https://x.com/Arbitrageincept) · [MIT license](LICENSE)
