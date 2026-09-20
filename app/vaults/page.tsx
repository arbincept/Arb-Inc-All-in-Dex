"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function VaultsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050508", color: "white" }}>
      <Header activePage="/vaults" />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "110px 20px 40px" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "42px", fontWeight: 900, marginBottom: "16px" }}>🏗️ Non-Custodial Vaults</h1>
          <p style={{ color: "#94a3b8", fontSize: "18px" }}>Single-Transaction DeFi Routing on BNB Chain</p>
          <p style={{ color: "#64748b", marginTop: "12px", fontSize: "15px" }}>
            Direct peer-to-contract routing into premier DeFi primitives (Venus Protocol & Lista DAO).
          </p>
        </div>

        <div
          style={{
            marginTop: "40px",
            padding: "28px",
            borderRadius: "24px",
            background: "rgba(15, 15, 30, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "14px", color: "#fff" }}>
            Visit Arbitrage Inception Earn
          </h2>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8, marginBottom: "16px" }}>
            Arbitrage Inception Earn is a dedicated companion interface for non-custodial DeFi protocols on BNB Smart Chain. It provides direct, permissionless access to third-party money-market and liquid-staking protocols without intermediary custody or centralized fund management. Rates, risks and availability are determined by those protocols and are not guaranteed.
          </p>
          <a
            href="https://arbitrage-inc-earn.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#8b5cf6",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Go to Arbitrage Inc Earn
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
