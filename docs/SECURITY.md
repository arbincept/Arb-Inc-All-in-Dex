# Security Policy & Architecture Disclosures

This document outlines the security architecture, audit status, Content-Security-Policy (CSP) specifications, and risk mitigation models of the **Arbitrage Inception** platform.

---

## 1. Architectural Model & Custodial Boundaries

Arbitrage Inception operates on a fully decentralized, non-custodial model with automated on-chain revenue sharing:

```
+-------------------------------------------------------------------------+
|                        CLIENT BROWSER / dAPP                            |
+-------------------------------------------------------------------------+
        |                                                 |
        | (1) Wallet-to-Contract Swaps & Orders           | (2) Read-Only Telemetry / Stats
        v                                                 v
+-----------------------------+               +--------------------------+
| Non-Custodial Smart Routing |               | Companion Telemetry API  |
| - KyberSwap BSC Aggregator  |               | - Next.js Serverless API |
| - PancakeSwap Core AMM      |               | - Zero Private Key State |
| - Mayan Finance Bridge      |               | - No Hot Signer          |
+-----------------------------+               +--------------------------+
        |                                                 
        v                                                 
  Funds remain 100% in user's                  
  wallet; contracts execute peer-              
  to-contract on BSC / Solana.                 

+-------------------------------------------------------------------------+
|                  ON-CHAIN AUTOMATED REVENUE SHARING                      |
|  - 50% Token Transfer Tax -> Pushed directly to qualified holders       |
|  - 50% Token Transfer Tax -> Pushed directly to Protocol Operations     |
|  - 100% Automated On-Chain Distribution via RevShare (Zero Custody)     |
+-------------------------------------------------------------------------+
```

1. **Non-Custodial Swaps & Bridge:** All token swaps, multi-hop routing, and cross-chain bridging are executed client-side via user wallet signatures (MetaMask, Rabby, WalletConnect) directly interacting with audited smart contracts (KyberSwap Aggregator, PancakeSwap routers, and Mayan Finance Wormhole contracts). The platform never takes custody of, holds, or has access to user private keys or trading principal.
2. **Automated On-Chain RevShare (Decommissioned Hot Signers):** Following the October 2026 protocol upgrade, manual claiming contracts and server-side hot signers were permanently decommissioned. Token holder rewards are automatically distributed on-chain every 24 hours to qualified holders (>= 1,000,000 ARB) via RevShare. This eliminates all server-held private key attack surfaces, manual claim risks, and centralized custody.

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

### Continuous Mathematical Solvency Verification & Accounting Model
- The repository maintains automated unit tests ([`tests/financial-math.test.mjs`](../tests/financial-math.test.mjs), passing tests in CI/CD).
- **Current Era (October 20, 2026 onward):** Automated on-chain RevShare distributes 50% of the ARB INC token transfer tax directly to holders and 50% to protocol operations. The safe factor and intermediate treasury claiming mechanics were retired in favor of this direct distribution.
- **Historical Invariant Verification:** Historical solvency models (`SAFE_FACTOR = 0.73` and utilization boundary checks) are retained in test suites for verifying legacy period accounting and treasury data integrity.

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
