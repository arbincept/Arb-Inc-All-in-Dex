# Arbitrage Inception: Public API Documentation

This document outlines the public HTTP REST endpoints provided by the Arbitrage Inception frontend application (`https://arbitrage-inc.exchange`).

---

## 1. Overview & Architecture Separation

The Arbitrage Inception platform operates on a decentralized, non-custodial model:
* **DEX & Cross-Chain Execution (Non-Custodial):** Token swaps and cross-chain bridging execute client-side directly between the user's Web3 wallet and on-chain protocol smart contracts (KyberSwap Aggregator, PancakeSwap V2/V3, Mayan Finance / Wormhole).
* **Automated On-Chain RevShare (No Custody / No Hot Signers):** 50% of the ARB INC token transfer tax is pushed automatically on-chain to qualified holders (>= 1,000,000 ARB) every 24 hours. The platform does not use server-side hot signers, custody private keys, or maintain manual claiming contracts.
* **Companion Telemetry API (Read-Only):** The endpoints below manage read-only leaderboard metrics, APR calculations, partner offers, and operational telemetry.

---

## 2. Public Endpoints

### 2.1 Get Leaderboard Metrics
Retrieves the top community participant ranking and overall protocol reward points.

* **Method:** `GET`
* **Path:** `/api/leaderboard`
* **Response:**
```json
{
  "leaderboard": [
    {
      "address": "0x74a8ea4126d0e099eb6a50d508e9be6d24d345cc",
      "points": 1823.45,
      "status": "diamond"
    }
  ],
  "totalPoints": 177857.64,
  "lastUpdated": 1789546000000
}
```

---

### 2.2 Get Protocol APR Estimate
Returns the annualized percentage rate (APR) estimate based on historical volume fee inflows into the rewards treasury.

* **Method:** `GET`
* **Path:** `/api/apr`
* **Response:**
```json
{
  "apr": "48.5",
  "periodDays": 30,
  "currency": "BNB"
}
```

---

### 2.3 Get Wallet Rewards & Referral Statistics
Fetches address-specific reward points, claimable BNB balances, and referral network counts.

* **Method:** `GET`
* **Path:** `/api/rewards/stats`
* **Query Parameters:**
  * `wallet` *(required)*: The EVM wallet address to query (e.g., `0x...`).
  * `ref` *(optional)*: The referrer's address if attributing a new peer invite.
* **Response:**
```json
{
  "points": 420.50,
  "claimable": 0.0385,
  "referralCount": 4,
  "referralEarnings": 42.05,
  "status": "diamond"
}
```

---

### 2.4 Get Ecosystem Offers
Retrieves available ecosystem partner tasks and eligible incentive programs.

* **Method:** `GET`
* **Path:** `/api/offers`
* **Query Parameters:**
  * `wallet` *(optional)*: Target wallet address (defaults to guest).
* **Response:**
```json
{
  "offers": [
    {
      "id": "bsc-swap",
      "title": "Trade on Arbitrage Inception DEX",
      "points": 100,
      "link": "/"
    }
  ]
}
```

---

### 2.5 Record DEX Interaction for Rewards Telemetry
Verifies an on-chain transaction receipt and logs community loyalty points.

* **Method:** `POST`
* **Path:** `/api/dex-reward`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "txHash": "0x789abc...",
  "userWallet": "0x123def...",
  "type": "swap",
  "referrerWallet": "0x456ghi..."
}
```
* **Response (Success):**
```json
{
  "success": true,
  "pointsAdded": 100
}
```

---

### 2.6 Claim Endpoint (Deprecated — Migrated to Automated RevShare)
Manual reward claiming has been permanently deprecated following the migration to automated on-chain RevShare distributions.

* **Method:** `POST` / `GET`
* **Path:** `/api/claim` and `/api/rewards/claim`
* **Response:**
```json
{
  "success": false,
  "message": "Manual claiming is deprecated. ARB INC rewards are automatically pushed to qualified holders on-chain every 24 hours via RevShare.",
  "revshare_url": "https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c"
}
```
* **Architecture Note:** In accordance with the October 20, 2026 protocol update, server-held hot signers and manual claiming were decommissioned. 50% of the token transfer tax is directly distributed on-chain to qualified holders holding at least 1,000,000 ARB. Real-time distributions can be verified at [app.revshare.ltd](https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c).
