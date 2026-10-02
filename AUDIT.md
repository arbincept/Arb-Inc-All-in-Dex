# Contract Audit & Transparency
## Token Contract
| Field | Value |
|---|---|
| Address | 0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c |
| Network | BNB Smart Chain (Chain ID 56) |
| Standard | BEP-20 |
| Source | [BSCScan Verified](https://bscscan.com/address/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c#code) |
| SPDX License | MIT |
| Contract Name | TaxableToken |
| Compiler | v0.8.30+commit.73712a01 |
## Immutability — No Admin Functions
The contract has NO privileged functions after deployment:
- No `onlyOwner` modifier exists anywhere in the contract
- No `setTaxWallet()` — tax wallet is immutable post-deploy
- No `setTaxPercentage()` — tax percentage is immutable post-deploy
- No `mint()` — supply is fixed
- No `pause()` or `blacklist()` functions
The `owner` state variable exists but controls nothing — there are zero
functions that check `msg.sender == owner`. Ownership cannot be used to
alter contract behavior. Verify this by reading the ABI on BSCScan.
## Parameters Set at Deploy (Immutable)
| Parameter | Value |
|---|---|
| Total Supply | 1,000,000,000 (9 decimals) |
| Tax Percentage | 4% (buy and sell) |
| Tax Wallet | 0x66BB01F14229E2179bAD84D52A69C0e4628dE63f |
## Security Reviews & Audit Status

### Automated Static Analysis (HashDit Bot)
- **BNB Chain Developer Tools:** An automated static scan by **HashDit Bot** reported zero findings in the linked submission ([PR #98](https://github.com/bnb-chain/developer-tools-list/pull/98#issuecomment-5652788720)).
- **BNB Chain Awesome Catalog:** An automated HashDit Bot scan reported zero findings in the linked submission ([PR #16](https://github.com/bnb-chain/awesome/pull/16#issuecomment-5686496121)).
- *Important:* These are automated bot scan results only, not an independent security audit, certification, or guarantee that the contract is safe. Automated scans do not replace a manual human security audit.

### Continuous Mathematical Testing
- 13/13 passing automated invariant tests in `tests/financial-math.test.mjs` verifying protocol reserve solvency (`SAFE_FACTOR = 0.73`) and Treasury utilization boundaries (<= 80%).

### Manual Audit Disclosure
- The smart contract has **not undergone a third-party paid manual audit**. It is a standard BEP-20 implementation with immutable parameters (ownership renounced, fixed supply, no mint, no blacklist) and verified source code on BSCScan.

For detailed security disclosures, CSP specifications, and RPC architecture, see [`docs/SECURITY.md`](docs/SECURITY.md).

## Third-Party Integrations (Frontend Only)
- KyberSwap Aggregator API
- Mayan Finance Bridge (Wormhole)
- PancakeSwap Router

