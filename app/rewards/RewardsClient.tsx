"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	FaCoins,
	FaCheckCircle,
	FaClock,
	FaExternalLinkAlt,
	FaShieldAlt,
	FaArrowRight,
	FaGasPump,
	FaWallet,
	FaCopy,
} from "react-icons/fa";

const TOKEN_ADDRESS = "0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";
const ACCUMULATOR_ADDRESS = "0x4c1caA917FD012b285Ba35E93535675e5B59806C";
const REVSHARE_URL = "https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";
const SWAP_URL = `/swap-all?tokenOut=${TOKEN_ADDRESS.toLowerCase()}`;

export default function RewardsClient() {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			style={{
				color: "white",
				fontFamily: "sans-serif",
				maxWidth: "960px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "30px",
			}}
		>
			{/* 1. HERO / UPGRADE BANNER */}
			<div
				style={{
					background: "linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 10, 42, 0.9) 100%)",
					border: "1px solid rgba(168, 85, 247, 0.3)",
					borderRadius: "20px",
					padding: "36px 28px",
					textAlign: "center",
					boxShadow: "0 10px 40px rgba(168, 85, 247, 0.12)",
				}}
			>
				<div
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						background: "rgba(34, 197, 94, 0.12)",
						border: "1px solid rgba(34, 197, 94, 0.3)",
						borderRadius: "20px",
						padding: "6px 16px",
						fontSize: "12px",
						color: "#4ade80",
						fontWeight: "700",
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						marginBottom: "16px",
					}}
				>
					<FaCheckCircle /> 100% Automated On-Chain Distributions
				</div>
				<h2
					style={{
						margin: "0 0 12px 0",
						fontSize: "30px",
						fontWeight: "900",
						color: "#ffffff",
					}}
				>
					How ARB INC Rewards Work
				</h2>
				<p
					style={{
						color: "#cbd5e1",
						fontSize: "15px",
						maxWidth: "720px",
						margin: "0 auto 24px auto",
						lineHeight: "1.6",
					}}
				>
					Rewards for ARB INC holders are fully automated with a 50% holders / 50% team split.
					The intermediary treasury has been eliminated: the 4% token tax is split 50% directly
					to qualified token holders (≥ 1,000,000 ARB) every 24 hours via RevShare in native BNB,
					and 50% to the team for ongoing protocol development and liquidity operations.
					No manual claims, no gas fees, and zero locking required.
				</p>

				<div
					style={{
						display: "flex",
						justifyContent: "center",
						gap: "12px",
						flexWrap: "wrap",
					}}
				>
					<a
						href={REVSHARE_URL}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
							color: "white",
							textDecoration: "none",
							padding: "12px 24px",
							borderRadius: "12px",
							fontSize: "14px",
							fontWeight: "700",
							transition: "transform 0.2s ease",
							boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
						}}
					>
						<FaCoins /> Live RevShare Dashboard <FaExternalLinkAlt size={12} />
					</a>
					<Link
						href={SWAP_URL}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							background: "rgba(255, 255, 255, 0.05)",
							border: "1px solid rgba(255, 255, 255, 0.15)",
							color: "white",
							textDecoration: "none",
							padding: "12px 24px",
							borderRadius: "12px",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						Get ARB INC <FaArrowRight size={12} />
					</Link>
				</div>
			</div>

			{/* 2. KEY PARAMETERS GRID */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "16px",
				}}
			>
				<div
					style={{
						background: "rgba(17, 14, 31, 0.8)",
						border: "1px solid rgba(148, 163, 184, 0.12)",
						borderRadius: "16px",
						padding: "20px",
					}}
				>
					<div style={{ color: "#a855f7", fontSize: "20px", marginBottom: "8px" }}>
						<FaWallet />
					</div>
					<div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
						Holding Threshold
					</div>
					<div style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px" }}>
						1,000,000 ARB
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						Hold in self-custody wallet
					</div>
				</div>

				<div
					style={{
						background: "rgba(17, 14, 31, 0.8)",
						border: "1px solid rgba(168, 85, 247, 0.25)",
						borderRadius: "16px",
						padding: "20px",
					}}
				>
					<div style={{ color: "#c084fc", fontSize: "20px", marginBottom: "8px" }}>
						<FaCoins />
					</div>
					<div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
						RevShare Split
					</div>
					<div style={{ fontSize: "20px", fontWeight: "800", color: "#c084fc", margin: "6px 0 2px" }}>
						50% / 50%
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						50% Holders / 50% Team
					</div>
				</div>

				<div
					style={{
						background: "rgba(17, 14, 31, 0.8)",
						border: "1px solid rgba(148, 163, 184, 0.12)",
						borderRadius: "16px",
						padding: "20px",
					}}
				>
					<div style={{ color: "#3b82f6", fontSize: "20px", marginBottom: "8px" }}>
						<FaClock />
					</div>
					<div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
						Payout Schedule
					</div>
					<div style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px" }}>
						Every 24 Hours
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						Automated daily on-chain batch
					</div>
				</div>

				<div
					style={{
						background: "rgba(17, 14, 31, 0.8)",
						border: "1px solid rgba(148, 163, 184, 0.12)",
						borderRadius: "16px",
						padding: "20px",
					}}
				>
					<div style={{ color: "#facc15", fontSize: "20px", marginBottom: "8px" }}>
						<FaCoins />
					</div>
					<div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
						Reward Asset
					</div>
					<div style={{ fontSize: "20px", fontWeight: "800", color: "#facc15", margin: "6px 0 2px" }}>
						Native BNB
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						Sent straight to your BSC address
					</div>
				</div>

				<div
					style={{
						background: "rgba(17, 14, 31, 0.8)",
						border: "1px solid rgba(148, 163, 184, 0.12)",
						borderRadius: "16px",
						padding: "20px",
					}}
				>
					<div style={{ color: "#22c55e", fontSize: "20px", marginBottom: "8px" }}>
						<FaGasPump />
					</div>
					<div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
						Claim Gas Cost
					</div>
					<div style={{ fontSize: "20px", fontWeight: "800", color: "#22c55e", margin: "6px 0 2px" }}>
						0 BNB (Free)
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						Zero transactions required
					</div>
				</div>
			</div>

			{/* 3. STEP BY STEP GUIDE */}
			<div
				style={{
					background: "rgba(17, 14, 31, 0.6)",
					border: "1px solid rgba(255, 255, 255, 0.06)",
					borderRadius: "20px",
					padding: "32px",
				}}
			>
				<h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800", color: "white" }}>
					How to Participate in 3 Steps
				</h3>

				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
						<div
							style={{
								background: "rgba(168, 85, 247, 0.15)",
								border: "1px solid rgba(168, 85, 247, 0.4)",
								color: "#c084fc",
								width: "36px",
								height: "36px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "800",
								fontSize: "16px",
								flexShrink: 0,
							}}
						>
							1
						</div>
						<div>
							<div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
								Acquire ARB INC Tokens
							</div>
							<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
								Use our non-custodial DEX aggregator to swap BNB or any BEP-20 token
								for ARB INC. Contract:{" "}
								<code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px", color: "#c084fc" }}>
									{TOKEN_ADDRESS.slice(0, 10)}...{TOKEN_ADDRESS.slice(-8)}
								</code>
							</div>
						</div>
					</div>

					<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
						<div
							style={{
								background: "rgba(59, 130, 246, 0.15)",
								border: "1px solid rgba(59, 130, 246, 0.4)",
								color: "#60a5fa",
								width: "36px",
								height: "36px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "800",
								fontSize: "16px",
								flexShrink: 0,
							}}
						>
							2
						</div>
						<div>
							<div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
								Hold at Least 1,000,000 ARB INC
							</div>
							<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
								Keep your tokens in any self-custody Web3 wallet (MetaMask, Trust Wallet,
								Rabby, SafePal). No staking contract or locking is required. Your tokens
								remain liquid and under your full control.
							</div>
						</div>
					</div>

					<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
						<div
							style={{
								background: "rgba(34, 197, 94, 0.15)",
								border: "1px solid rgba(34, 197, 94, 0.4)",
								color: "#4ade80",
								width: "36px",
								height: "36px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "800",
								fontSize: "16px",
								flexShrink: 0,
							}}
						>
							3
						</div>
						<div>
							<div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
								Receive Direct BNB Payouts Every 24h
							</div>
							<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
								Every 24 hours, the distribution engine calculates holder proportions and
								dispatches native BNB straight to your wallet. You don't need to connect
								to any portal or pay gas to claim.
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 4. ON-CHAIN TRANSPARENCY BOX */}
			<div
				style={{
					background: "rgba(17, 14, 31, 0.8)",
					border: "1px solid rgba(168, 85, 247, 0.2)",
					borderRadius: "20px",
					padding: "28px",
				}}
			>
				<h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
					On-Chain Transparency & Verified Contracts
				</h3>

				<div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "space-between",
							alignItems: "center",
							background: "rgba(255,255,255,0.02)",
							padding: "12px 16px",
							borderRadius: "10px",
							border: "1px solid rgba(255,255,255,0.05)",
							gap: "8px",
						}}
					>
						<span style={{ color: "#94a3b8" }}>Token Contract (ARB INC):</span>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<code style={{ color: "#facc15" }}>{TOKEN_ADDRESS}</code>
							<button
								onClick={() => copyToClipboard(TOKEN_ADDRESS)}
								style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
								title="Copy Address"
							>
								{copied ? <FaCheckCircle color="#22c55e" /> : <FaCopy />}
							</button>
							<a
								href={`https://bscscan.com/token/${TOKEN_ADDRESS}`}
								target="_blank"
								rel="noreferrer"
								style={{ color: "#94a3b8" }}
							>
								<FaExternalLinkAlt size={12} />
							</a>
						</div>
					</div>

					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "space-between",
							alignItems: "center",
							background: "rgba(255,255,255,0.02)",
							padding: "12px 16px",
							borderRadius: "10px",
							border: "1px solid rgba(255,255,255,0.05)",
							gap: "8px",
						}}
					>
						<span style={{ color: "#94a3b8" }}>Accumulator & Distribution Wallet:</span>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<code style={{ color: "#c084fc" }}>{ACCUMULATOR_ADDRESS}</code>
							<button
								onClick={() => copyToClipboard(ACCUMULATOR_ADDRESS)}
								style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
								title="Copy Address"
							>
								<FaCopy />
							</button>
							<a
								href={`https://bscscan.com/address/${ACCUMULATOR_ADDRESS}`}
								target="_blank"
								rel="noreferrer"
								style={{ color: "#94a3b8" }}
							>
								<FaExternalLinkAlt size={12} />
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* 5. FAQ (REASSURING & DIRECT) */}
			<div
				style={{
					background: "rgba(17, 14, 31, 0.6)",
					border: "1px solid rgba(255, 255, 255, 0.06)",
					borderRadius: "20px",
					padding: "32px",
				}}
			>
				<h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800", color: "white" }}>
					Frequently Asked Questions
				</h3>

				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							What is the RevShare revenue split?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							The 4% ARB INC token transfer tax is split 50% / 50%: 50% is distributed directly to
							qualified token holders (≥ 1,000,000 ARB) every 24 hours on-chain in native BNB,
							and 50% is allocated to the team for development, operations, and protocol maintenance.
							DEX aggregator fees (0.5%) and limit-order fees (0.1%) remain separate protocol revenues.
						</div>
					</div>

					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							Do I need to connect my wallet or manually claim?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							No. Unlike the legacy system, rewards are automatically pushed to your holding
							address on-chain. You do not need to sign any claim transactions or spend BNB on gas.
						</div>
					</div>

					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							Where can I track past payouts and rounds?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							You can view all live distribution rounds, holder statistics, and historical payouts
							on the official RevShare platform at{" "}
							<a
								href={REVSHARE_URL}
								target="_blank"
								rel="noreferrer"
								style={{ color: "#c084fc", textDecoration: "underline" }}
							>
								app.revshare.ltd
							</a>
							{" "}or by inspecting the Accumulator wallet directly on BscScan.
						</div>
					</div>

					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							What happened to the old treasury claim page?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							We streamlined the entire architecture to eliminate the intermediate treasury wallet
							and hot-wallet signer. By routing directly from the Accumulator to token holders,
							the system is safer, simpler, and 100% automated.
						</div>
					</div>

					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							How does DEX trading fit in?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							Our DEX aggregator (0.5% fee) and limit orders (0.1% fee) powered by KyberSwap
							continue to operate independently. All trades are non-custodial and wallet-signed.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
