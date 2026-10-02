# Security Policy & Architecture Disclosures

This document outlines the security architecture, audit status, Content-Security-Policy (CSP) specifications, and risk mitigation models of the **Arbitrage Inception** platform.

---

## 1. Architectural Model & Custodial Boundaries

Arbitrage Inception strictly decouples **non-custodial trading execution** from the **companion rewards service**:

```
+-------------------------------------------------------------------------+
|                        CLIENT BROWSER / dAPP                            |
+-------------------------------------------------------------------------+
        |                                                 |
        | (1) Wallet-to-Contract Swaps                    | (2) Read State & Point Claims
        v                                                 v
+-----------------------------+               +--------------------------+
| Non-Custodial Smart Routing |               | Companion Rewards Engine |
| - KyberSwap BSC Aggregator  |               | - Next.js Serverless API |
| - PancakeSwap Core AMM      |               | - Upstash Redis State    |
| - Mayan Finance Bridge      |               | - Automated Hot Signer   |
+-----------------------------+               +--------------------------+
        |                                                 |
        v                                                 v
  Funds remain 100% in user's                  Reward payouts distributed
  wallet; contracts execute peer-              from Protocol Reserve to
  to-contract on BSC / Solana.                 eligible participant wallets.
```

1. **Non-Custodial Swaps & Bridge:** All token swaps, multi-hop routing, and cross-chain bridging are executed client-side via user wallet signatures (MetaMask, Rabby, WalletConnect) directly interacting with audited smart contracts (KyberSwap Aggregator, PancakeSwap routers, and Mayan Finance Wormhole contracts). The platform never takes custody of, holds, or has access to user private keys or trading principal.
2. **Hosted Companion Rewards Service:** Community reward points and fee-derived distribution claims are tracked off-chain using Upstash Redis state machines. Payout claims are signed by an automated protocol reserve hot signer and distributed in BNB directly to user wallets.

---

## 2. Security Review Status & Disclosures

### Automated Security Static Analysis (HashDit Bot)
- **BNB Chain Developer Tools Catalog:** An automated static scan by **HashDit Bot** reported zero findings in the linked submission ([PR #98](https://github.com/bnb-chain/developer-tools-list/pull/98#issuecomment-5652788720)).
- **BNB Chain Awesome Catalog:** An automated HashDit Bot scan reported zero findings in the linked submission ([PR #16](https://github.com/bnb-chain/awesome/pull/16#issuecomment-5686496121)).
- **Notice on Automated Scans:** These are bot scan results only, not an independent security audit, certification, or guarantee that the contract is safe. Automated analysis evaluates common code patterns and vulnerability vectors but does not replace an independent, full-scope manual human audit.

### Independent Manual Audit Disclosure
- The native BEP-20 token contract (`0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c`) has **not undergone a third-party paid manual audit**. 
- The contract is a standard BEP-20 implementation with immutable parameters:
  - Ownership has been renounced (`owner` controls no admin functions).
  - No `mint()`, `pause()`, or `blacklist()` functions exist.
  - Tax percentage (4%) and tax wallet are permanently immutable.
  - Verified source code is published on [BscScan](https://bscscan.com/address/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c#code).

### Continuous Mathematical Solvency Verification
- The protocol runs continuous automated unit tests ([`tests/financial-math.test.mjs`](../tests/financial-math.test.mjs), 13/13 passing tests in CI/CD).
- Enforces strict Treasury reserve solvency constraints:
  - `SAFE_FACTOR = 0.73` (mandatory 27% protocol reserve retention on inbound yields).
  - Utilization cap <= 80% (automatic `CRITICAL` or `WARNING` triage if claims exceed safe reserves).

---

## 3. Content-Security-Policy (CSP) & Technical Rationale

The frontend enforces strict HTTP security headers configured in `next.config.mjs`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.walletconnect.com https://*.walletconnect.org https://*.web3modal.org https://mayan.finance https://*.mayan.finance https://*.kyberswap.com https://*.googletagmanager.com; ...
```

### Technical Scope & Necessity of `'unsafe-eval'`
- **Client-Side Web3 Wallet Handshakes:** Injected Web3 providers (such as the MetaMask browser extension, Rabby, and Coinbase Wallet) and Web3 connector libraries (`@walletconnect/ethereum-provider`, `@web3modal/wagmi`) rely on dynamic code generation and WebAssembly (WASM) memory initialization for:
  1. Compiling and running client-side elliptic curve and cryptographic primitives (secp256k1, keccak256).
  2. ABI serialization and deserialization routines.
  3. Window message proxying between browser extension sandboxes and dApp frames.
- **Isolation Scope:** `'unsafe-eval'` is permitted **exclusively** within the client browser context (`script-src`). Node.js serverless functions, REST API routes, and backend accounting processes execute in pure Node.js environments with zero `eval()` usage.

---

## 4. RPC Architecture & Redundancy

The protocol uses ordered RPC endpoints on BNB Smart Chain (Chain ID 56), with NodeReal and other public providers preferred where configured:

| Endpoint | Provider | Role | Rate / Performance |
|---|---|---|---|
| `https://binance.nodereal.io` | NodeReal / MegaNode | Primary Node | Official BSC infrastructure, instant receipt indexing |
| `https://bsc-rpc.publicnode.com` | PublicNode | Distributed Cluster | High-capacity read & call node cluster |
| `https://1rpc.io/bnb` | Automata Network | Resilient Fallback | Privacy-preserving, multi-region fallback RPC |

Custom private RPCs can be injected via the `BSC_RPC_URL` environment variable. Unauthenticated `rpc.ankr.com` was deprecated due to mandatory API key requirements.

The claim handlers currently retain `bsc-dataseed.binance.org`, `bsc-dataseed1.binance.org`, and `bsc-dataseed2.binance.org` as legacy fallbacks after the primary endpoint. These endpoints are not preferred, but they remain operational dependencies for compatibility; this repository therefore does not claim to have fully eliminated legacy dataseed RPCs.

---

## 5. Vulnerability Reporting

To report a vulnerability or security concern, please contact the maintainer directly:
- **Lead Developer:** Luca Celebrano
- **Email:** [luca.celebrano1@gmail.com](mailto:luca.celebrano1@gmail.com)
- **Telegram:** [@ArbitrageInception](https://t.me/ArbitrageInception)
- **PGP / Verification:** Published on founder profile [https://github.com/Lukecele](https://github.com/Lukecele)
