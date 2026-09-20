# Arbitrage Inception
## DappBay Project Whitepaper and Technical Disclosure

**Version:** 1.0.0
**Date:** 20 September 2026
**Network:** BNB Smart Chain (BSC), Chain ID 56
**Website:** [arbitrage-inc.exchange](https://arbitrage-inc.exchange)
**Source code:** [GitHub](https://github.com/arbincept/Arb-Inc-All-in-Dex)
**License:** MIT

> This document is a technical and product description for project discovery and ecosystem review, including DappBay. It is not an investment prospectus, a promise of returns, a legal opinion, an audit, or a MiCA whitepaper. Token trading involves substantial risk, including total loss. Users are responsible for checking whether the application and token are available and appropriate in their jurisdiction.

## 1. Project Overview

Arbitrage Inception is an open-source Web3 application that brings several decentralized finance tools into one interface:

- BNB Smart Chain DEX aggregation and swap routing;
- cross-chain swap and bridge integrations;
- non-custodial limit-order functionality;
- liquidity and protocol integrations;
- public blockchain telemetry and service-health monitoring;
- an optional community points and rewards service.

The application is designed as a wallet-connected interface. Users keep control of their wallet and sign transactions themselves. The application does not ask users for seed phrases or private keys.

## 2. Product and Features

### DEX Aggregator

The swap interface is an aggregation and routing layer, not a centralized exchange. It obtains quotes and routes through KyberSwap and uses third-party AMM liquidity, including PancakeSwap pools where available. The application does not operate a proprietary order book or custody user trading funds.

#### DEX Characteristics

| Feature | Description |
|---|---|
| Primary network | BNB Smart Chain (BSC), Chain ID 56 |
| Execution model | User wallet signs transactions to public routers and liquidity-pool contracts |
| Liquidity model | Third-party AMM pools and routing protocols; the application does not guarantee liquidity |
| Routing layer | KyberSwap aggregator and its supported route providers |
| Liquidity venues | PancakeSwap V2 pools for ARB INC; KyberSwap's global BSC aggregator liquidity for other supported assets |
| ARB INC liquidity | ARB INC liquidity resides in the relevant PancakeSwap V2 pool; the interface may link directly to that pool when required |
| Platform custody | None for swaps; private keys and seed phrases are not requested or stored |
| Order book | No proprietary centralized order book; limit orders are documented separately and depend on supported on-chain execution infrastructure |
| Protocol fee | 0.5% routing fee where enabled and displayed; third-party fees and gas are additional |
| Price protection | Quotes, slippage settings and transaction conditions must be reviewed by the user before signing |

For ARB INC, the relevant PancakeSwap V2 pool is the primary liquidity venue. For other supported assets, KyberSwap operates as a global BSC aggregator and may source routes from multiple DEX venues. The effective route depends on the selected asset pair, available liquidity, provider response and current network conditions. For the 4% ARB INC transfer tax, the interface advises users to configure sufficiently high slippage when using the relevant route; this is not a protection against price impact or loss.

A route can fail, expire, return less than expected or become unavailable. Prices, liquidity, route availability, fees and execution results can change between quote and transaction confirmation. Arbitrage Inception does not guarantee the best price, execution, liquidity, uptime or protection from MEV.

### Cross-Chain Transfers

The bridge interface is powered by Mayan Finance, including routes using Wormhole-connected infrastructure. It supports configured routes between BNB Smart Chain, Ethereum, Arbitrum, Polygon, Base, Avalanche and Solana. Arbitrage Inception supplies the interface and referral configuration; it does not operate the bridge, custody bridged assets or control the external relayers and liquidity.

Cross-chain execution depends on Mayan Finance, Wormhole-connected infrastructure, the selected source and destination networks, relayers, liquidity, finality and network conditions. Arbitrage Inception does not guarantee delivery time, exchange rate or bridge completion.

### Limit Orders

The limit-order interface is powered by KyberSwap on BNB Smart Chain. It uses KyberSwap route and market-rate data and depends on KyberSwap-supported liquidity and execution infrastructure. Users create conditional orders from their own wallet and should review the target token, approval, expiry, slippage and execution conditions before signing. An order may remain unfilled, fail or incur network and protocol costs.

### Community Rewards

The project includes an optional rewards and community-points service. Points and eligibility data are recorded through hosted infrastructure. Where a claim is available, a server-side operational signer may submit a BNB payout from the designated treasury. Claims depend on the service being available, the recorded balance, eligibility rules, gas, treasury liquidity and operational controls.

This service is separate from wallet-based trading. It is not a bank account, deposit, investment product or guarantee of income. The separate RevShare page may record reward rounds and recipient allocations; those records are not the same as the repository's Redis accounting or claim endpoint.

## 3. Architecture

The system has four practical layers:

1. **Frontend:** Next.js, React, TypeScript and PWA-compatible user interface.
2. **Wallet and transaction layer:** Wagmi, Viem, Ethers, Web3-Onboard and supported wallet connectors.
3. **Third-party execution layer:** DEX routers, liquidity pools, bridge providers and on-chain contracts selected by the user.
4. **Telemetry and rewards layer:** public RPC data, monitoring scripts, Upstash Redis accounting and an operational payout signer for the optional rewards service.

Trading and bridge transactions are signed by the user's wallet and sent to public smart contracts or third-party protocols. The hosted rewards layer is not fully on-chain: points, pending balances and eligibility are maintained off-chain before a possible on-chain claim.

## 4. ARB INC Token

| Property | Value |
|---|---|
| Name | Arbitrage Inception |
| Symbol | ARB INC |
| Standard | BEP-20 |
| Network | BNB Smart Chain, Chain ID 56 |
| Contract | `0x5ee54869ecd5e752c31af095187326d4a4d50e1c` |
| Decimals | 9 |
| Stated maximum supply | 1,000,000,000 |
| Ownership | Renounced to `0x000000000000000000000000000000000000dEaD` |
| Explorer | [BscScan contract](https://bscscan.com/address/0x5ee54869ecd5e752c31af095187326d4a4d50e1c) |

The published contract disclosures state that supply is fixed and no mint, blacklist, pause or tax-parameter administration is available after deployment. Users should verify the deployed contract and its current state independently before interacting with it.

The token has a stated 4% transfer tax on supported buys and sells. The tax affects the amount received and may be routed according to the deployed contract and connected project infrastructure. A tax is not a fee paid to a user and does not create a guaranteed reward.

ARB INC does not represent ownership in a company, a claim on company assets, a redemption right, a fixed interest payment or a guaranteed return. Market price, liquidity, availability and transferability can change or disappear.

## 5. Fees and Treasury Flows

Depending on the route and feature used, users may encounter:

- a displayed aggregator or routing fee, currently documented as 0.5% where enabled;
- a bridge referral fee, currently documented as 0.30% where enabled through the Mayan Finance integration;
- bridge-provider fees and source/destination network gas;
- third-party protocol fees, spread, slippage and execution costs;
- the ARB INC transfer tax when the token contract applies it.

The project-stated token-tax accounting model assigns 40% to community-reward accounting, 40% to development infrastructure and 20% to operations and ecosystem growth. These percentages describe an intended accounting model and are not a claim that every transfer-tax amount is received, available or distributed in those proportions.

A documented `SAFE_FACTOR` of `0.73` is an internal distribution and solvency parameter, not a guarantee that 73% of any amount will be paid to users. Treasury balances, eligibility, gas, implementation changes and third-party services can affect any distribution.

The public RevShare token page lists a distribution wallet and revenue-recipient wallets. Its current disclosed split is 41% developer wallet, 39% treasury wallet and 20% third wallet, with reward rounds described at 24-hour intervals. This is a separate public record and should not be confused with the project's token-tax allocation percentages or hosted Redis claim accounting.

## 6. Decentralisation and Control Model

The ARB INC token contract is presented as immutable and ownership-renounced. The frontend repository is public and licensed under MIT. These facts do not mean every project component is decentralised.

- User trading is non-custodial and wallet-signed.
- Routing and bridge execution rely on third-party protocols.
- The frontend and hosted APIs may be unavailable or changed.
- Rewards points and pending balances use hosted Redis infrastructure.
- The optional BNB claim process uses an operational hot signer.
- Treasury and fee-recipient wallets remain relevant operational dependencies.

The project has no promise that the frontend, rewards service, third-party routes or token markets will continue indefinitely.

## 7. Security and Audit Status

The token source is published and the repository contains contract and security disclosures. A HashDit automated scan is referenced in the repository. The project has **not** completed a paid independent manual smart-contract audit according to its current audit disclosure. Automated scanning, source verification and tests do not eliminate smart-contract risk.

Relevant security risks include:

- smart-contract vulnerabilities and malicious token contracts;
- bridge, router, relayer, oracle and RPC failures;
- MEV, sandwich attacks, slippage and failed transactions;
- compromised wallets, phishing and approval abuse;
- hosted rewards database or signer compromise;
- incorrect balances, stale quotes or frontend compromise;
- network congestion, chain reorganisation and loss of access;
- total or partial loss of funds.

Security issues should be reported through the repository's [security policy](SECURITY.md). Never include seed phrases, private keys or signing secrets in a report.

## 8. Governance and Development

The project is maintained as open-source software through its public repository. Contributions, issue reports and pull requests are public. Open-source maintenance does not itself create a legal entity, token-holder governance right or promise of perpetual development.

Current public channels:

- [GitHub repository](https://github.com/arbincept/Arb-Inc-All-in-Dex)
- [Telegram](https://t.me/ArbitrageInception)
- [X / Twitter](https://x.com/Arbitrageincept)
- [Dapp](https://arbitrage-inc.exchange)

## 9. Legal and User Notice

This document is not a legal classification of ARB INC or of any service. The project does not claim regulatory approval, endorsement, licensing or audit certification through this document. MiCA, financial-services, consumer-protection, tax, sanctions and other rules may apply differently depending on the user's location, the activity performed and the person operating a particular service.

No public offer, fundraising campaign or return on investment is promised by this document. A DEX pool, token listing, price display, reward record or protocol integration is not a promise of liquidity or future value. Users should obtain independent advice where required and interact only with contracts and URLs they have verified.

## 10. Supporting Documentation

- [Audit and contract disclosures](../AUDIT.md)
- [Security policy](SECURITY.md)
- [Governance disclosure](../GOVERNANCE.md)
- [API documentation](API.md)
- [Project metadata](../dapp-metadata.json)
- [DeFiLlama protocol page](https://defillama.com/protocol/arbitrage-inc)
