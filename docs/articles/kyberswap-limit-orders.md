# Building a KyberSwap Limit-Order Flow on BNB Chain

This article explains how the repository separates market-rate discovery, EIP-712 signing, API communication and cancellation for limit orders. It is a code-reading guide, not a promise that every wallet or external API state is permanently available.

## The flow

1. The limit-order page collects token, amount, price and wallet state.
2. The client requests a market rate through the Kyber API proxy.
3. The order builder normalizes token amounts using the token decimals and prepares the EIP-712 payload.
4. The wallet signs the typed data; private keys remain inside the wallet provider.
5. The API client submits the order and the UI polls supported order statuses.
6. Cancellation can use the gasless API path or the on-chain hard-cancel fallback.

The separation matters because a quote failure, a rejected signature, an API rejection and an on-chain revert are different failure classes. They should be visible to the user as different states rather than collapsed into a generic error.

## Where to read in the repository

- `app/limit-orders/ClientWrapper.tsx`: page state, balances, approvals, order creation and cancellation actions.
- `lib/limit-order/api-client.ts`: Kyber request and response handling.
- `lib/limit-order/maker.ts`: order and cancellation signing helpers.
- `lib/limit-order/signing.ts`: typed-data definitions and signing utilities.
- `lib/limit-order/cancel-hard.ts`: gas estimation, submission and receipt handling for hard cancellation.
- `app/api/kyber/limit-order/cancel/route.ts`: browser-to-Kyber cancellation proxy.

## Safe contribution areas

Good first contributions include adding deterministic fixtures for decimal conversion, documenting an API error response, or improving the UI copy for a rejected signature. Changes to signing fields, nonce handling, order encoding or fee calculations require focused tests and review because they affect transaction semantics.

## Manual verification checklist

- Connect a test wallet on BNB Smart Chain.
- Verify token decimals and balances before creating an order.
- Confirm the typed-data domain and order fields in the wallet prompt.
- Test rejected signatures and unavailable quotes.
- Verify both gasless cancellation and the hard-cancel error path on a safe test environment.
- Confirm that the order history refresh distinguishes open, filled, expired and cancelled states.