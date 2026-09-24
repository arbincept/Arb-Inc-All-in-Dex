# Designing Reliable Web3 Transaction States

Wallet-driven applications are not ordinary forms. A user can disconnect a wallet, switch chains, reject a signature, lose an RPC connection, or submit a transaction that remains pending. This repository models those boundaries across swaps, approvals, wrapping and limit orders.

## A useful state model

Treat each operation as a sequence of independently observable states:

1. **Input:** token, amount, destination and chain are valid.
2. **Quote or preparation:** an external API or contract read returns transaction data.
3. **User authorization:** the wallet requests an approval or typed-data signature.
4. **Submission:** the wallet provider returns a transaction hash.
5. **Confirmation:** the receipt is mined and the application reconciles balances and UI state.
6. **Recovery:** a timeout, rejection, revert or provider error is actionable and does not leave stale success state.

This model is especially important for ERC-20 approvals and native BNB wrapping, where preparation and execution are separate transactions.

## What contributors should preserve

- Never handle private keys in frontend or API code.
- Keep chain and token-decimal checks close to transaction preparation.
- Do not report a transaction as successful before receipt confirmation.
- Preserve the original provider/API error when it contains useful recovery information.
- Avoid broad formatting or dependency changes in signing and transaction modules without targeted validation.

## Practical test contributions

The lowest-risk improvements are mocked tests for rejected wallets, stale quotes, failed approvals, unavailable RPC endpoints and pending receipts. These tests improve confidence without sending real funds or changing production contracts.

The repository's [integration matrix](../INTEGRATION-MATRIX.md) identifies which behaviors are automated and which still need manual wallet or external-protocol verification.