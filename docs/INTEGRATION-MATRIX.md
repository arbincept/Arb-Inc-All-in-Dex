# Integration and Test Matrix

This matrix records the capabilities currently described by the repository and the level of verification available in the current project. It is intentionally conservative: an integration is not marked as fully verified only because its SDK is installed.

| Area | Current integration or route | Evidence in repository | Current verification | Contribution ideas |
| --- | --- | --- | --- | --- |
| DEX aggregation | KyberSwap, PancakeSwap V2/V3, Uniswap V3, Biswap | Swap routes, Kyber API docs and wallet transaction code | Unit/build coverage plus smoke-test scripts; live transaction behavior requires manual wallet testing | Add mocked quote and transaction-state fixtures |
| Swap UI | `/swap`, `/swap-all` | App routes and swap client components | Page smoke coverage; destructive transaction paths require manual testing | Document error states and add non-signing browser checks |
| Limit orders | `/limit-orders` | Limit-order client, signing and cancellation modules | Unit/build coverage; wallet signature and cancellation paths require manual testing | Add deterministic EIP-712 fixture tests |
| Cross-chain bridge | Mayan Finance and Wormhole Swift routes | Bridge UI and integration code | Page/API checks; bridge completion depends on external networks | Add mocked quote, timeout and recovery scenarios |
| Wallets | EVM connectors plus Solana and Sui integrations | Wallet configuration and connector code | Local/browser dependent; no claim of universal wallet compatibility | Reproduce one connector issue per supported wallet |
| Token operations | Balances, decimals, allowance, approval and BNB wrapping | Swap and token utility modules | Unit/build checks; wallet/RPC behavior needs manual verification | Add token-decimal edge-case fixtures |
| RPC resilience | Multi-RPC fallback and health checks | RPC configuration and watcher scripts | Build/tests cover deterministic logic; provider outage drills are manual | Add mocked provider failure tests |
| API proxies | Kyber and application API routes | `app/api` routes and `docs/API.md` | Build and route-level checks | Add request/response examples and failure contracts |
| PWA/mobile | Manifest, icons and responsive application | `public/manifest.json` and app metadata | Build plus manual device/browser review | Add a documented mobile smoke checklist |
| Telemetry | DeFiLlama adapter and health/reward scripts | `lib/defillama` and `scripts/` | Script-level review and CI where configured | Document data freshness and failure handling |

## Reading the status

- **Automated** means the current repository has a repeatable check for the behavior.
- **Manual** means the behavior depends on a wallet, live RPC, external protocol, or real browser environment.
- **Contribution ideas** are intentionally scoped so they can be proposed without changing production behavior first.

For security reports, follow [SECURITY.md](../SECURITY.md) rather than opening a public issue.