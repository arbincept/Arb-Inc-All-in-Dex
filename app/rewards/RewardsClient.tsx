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
	FaSearch,
	FaSpinner,
	FaExclamationTriangle,
	FaChartLine,
} from "react-icons/fa";
import { useProtocolData } from "@/hooks/useProtocolData";

const TOKEN_ADDRESS = "0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";
const ACCUMULATOR_ADDRESS = "0x4c1caA917FD012b285Ba35E93535675e5B59806C";
const REVSHARE_URL = "https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";
const SWAP_URL = `/swap-all?tokenOut=${TOKEN_ADDRESS.toLowerCase()}`;
const MIN_QUALIFIED_HOLDING = 2500000;

export default function RewardsClient() {
	const [copied, setCopied] = useState(false);
	const data = useProtocolData(TOKEN_ADDRESS, ACCUMULATOR_ADDRESS);

	// Wallet eligibility checker state
	const [checkAddress, setCheckAddress] = useState("");
	const [isChecking, setIsChecking] = useState(false);
	const [checkResult, setCheckResult] = useState<{
		checked: boolean;
		eligible: boolean;
		balance: number;
		error?: string;
	} | null>(null);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleCheckEligibility = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const trimmed = checkAddress.trim();
		if (!trimmed || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
			setCheckResult({
				checked: true,
				eligible: false,
				balance: 0,
				error: "Please enter a valid BSC address (0x...)",
			});
			return;
		}

		setIsChecking(true);
		setCheckResult(null);

		const endpoints = [
			"https://bsc-rpc.publicnode.com",
			"https://binance.nodereal.io",
		];

		let foundBalance = 0;
		let querySuccess = false;

		for (const url of endpoints) {
			try {
				const res = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: AbortSignal.timeout(4500),
					body: JSON.stringify({
						jsonrpc: "2.0",
						method: "eth_call",
						params: [
							{
								to: TOKEN_ADDRESS,
								data: "0x70a08231" + trimmed.substring(2).padStart(64, "0"),
							},
							"latest",
						],
						id: 1,
					}),
				});

				if (res.ok) {
					const json = await res.json();
					if (json.result && json.result !== "0x") {
						foundBalance = Number(BigInt(json.result)) / 1e9;
						querySuccess = true;
						break;
					}
				}
			} catch (err) {
				// Fallback to next endpoint
			}
		}

		setIsChecking(false);
		if (querySuccess) {
			setCheckResult({
				checked: true,
				eligible: foundBalance >= MIN_QUALIFIED_HOLDING,
				balance: foundBalance,
			});
		} else {
			setCheckResult({
				checked: true,
				eligible: false,
				balance: 0,
				error: "Unable to query BSC network right now. Please verify on BscScan.",
			});
		}
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
				gap: "28px",
			}}
		>
			{/* 1. HERO / UPGRADE BANNER */}
			<div
				style={{
					background: "linear-gradient(135deg, rgba(88, 28, 135, 0.45) 0%, rgba(15, 10, 42, 0.95) 100%)",
					border: "1px solid rgba(168, 85, 247, 0.35)",
					borderRadius: "20px",
					padding: "36px 28px",
					textAlign: "center",
					boxShadow: "0 10px 40px rgba(168, 85, 247, 0.15)",
				}}
			>
				<div
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
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
					<span
						style={{
							width: "8px",
							height: "8px",
							background: "#22c55e",
							borderRadius: "50%",
							display: "inline-block",
							boxShadow: "0 0 8px #22c55e",
						}}
					/>
					Live RevShare Epoch: {data.isProcessing ? "Processing Payout..." : data.timerDisplay}
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
					Rewards for ARB INC holders are fully automated with a 50% holders / 25/25 devs split.
					The intermediary treasury has been eliminated: the 4% token tax is split 50% directly
					to qualified token holders (≥ 2,500,000 ARB) on-chain via RevShare in native BNB,
					and 25% / 25% to the two developer wallets for ongoing protocol development and operations.
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

			{/* 2. LIVE PROTOCOL PULSE & MOMENTANEOUS APR */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "16px",
				}}
			>
				{/* MOMENTANEOUS APR CARD */}
				<div
					style={{
						background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(17, 14, 31, 0.9) 100%)",
						border: "1px solid rgba(34, 197, 94, 0.3)",
						borderRadius: "16px",
						padding: "20px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "8px",
							}}
						>
							<span style={{ fontSize: "12px", color: "#4ade80", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
								Estimated Holders APR
							</span>
							<FaChartLine color="#22c55e" size={16} />
						</div>
						<div style={{ fontSize: "28px", fontWeight: "900", color: "#22c55e", margin: "6px 0 4px" }}>
							{data.globalApr}
						</div>
					</div>
					<div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.4", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
						Annualized 24h volume (all pools) / Market Cap (50% Holders share)
					</div>
				</div>

				{/* NEXT REVSHARE EPOCH COUNTDOWN */}
				<div
					style={{
						background: "linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(17, 14, 31, 0.9) 100%)",
						border: "1px solid rgba(234, 179, 8, 0.3)",
						borderRadius: "16px",
						padding: "20px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "8px",
							}}
						>
							<span style={{ fontSize: "12px", color: "#facc15", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
								Next RevShare Epoch
							</span>
							<FaClock color="#facc15" size={16} />
						</div>
						<div style={{ fontSize: "26px", fontWeight: "900", color: "#facc15", margin: "6px 0 4px" }}>
							{data.isProcessing ? (
								<span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "18px" }}>
									<FaSpinner className="fa-spin" /> Processing...
								</span>
							) : (
								data.timerDisplay
							)}
						</div>
					</div>
					<div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.4", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
						Real-time on-chain epoch synced with RevShare.ltd
					</div>
				</div>

				{/* ACCUMULATOR PENDING RESERVES */}
				<div
					style={{
						background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(17, 14, 31, 0.9) 100%)",
						border: "1px solid rgba(168, 85, 247, 0.3)",
						borderRadius: "16px",
						padding: "20px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "8px",
							}}
						>
							<span style={{ fontSize: "12px", color: "#c084fc", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
								Pending Reserves
							</span>
							<FaCoins color="#c084fc" size={16} />
						</div>
						<div style={{ fontSize: "24px", fontWeight: "900", color: "#f8fafc", margin: "6px 0 2px" }}>
							{data.accBnb} BNB
						</div>
						<div style={{ fontSize: "13px", color: "#c084fc" }}>
							+ {data.accTokens} ARB
						</div>
					</div>
					<div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.4", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
						Accumulating for automated batch distribution
					</div>
				</div>

				{/* HOLDING THRESHOLD */}
				<div
					style={{
						background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(17, 14, 31, 0.9) 100%)",
						border: "1px solid rgba(59, 130, 246, 0.3)",
						borderRadius: "16px",
						padding: "20px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "8px",
							}}
						>
							<span style={{ fontSize: "12px", color: "#60a5fa", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
								Holding Threshold
							</span>
							<FaWallet color="#3b82f6" size={16} />
						</div>
						<div style={{ fontSize: "24px", fontWeight: "900", color: "#f8fafc", margin: "6px 0 2px" }}>
							2,500,000 ARB
						</div>
					</div>
					<div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.4", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
						Self-custody requirement for 50% revenue share
					</div>
				</div>
			</div>

			{/* 3. INTERACTIVE WALLET ELIGIBILITY CHECKER */}
			<div
				style={{
					background: "rgba(17, 14, 31, 0.7)",
					border: "1px solid rgba(168, 85, 247, 0.25)",
					borderRadius: "20px",
					padding: "26px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
					<FaSearch color="#c084fc" size={18} />
					<h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>
						Check Your Wallet Eligibility
					</h3>
				</div>
				<p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
					Verify whether your BSC address holds at least 2,500,000 ARB INC to receive automatic native BNB distributions in the next RevShare round.
				</p>

				<form
					onSubmit={handleCheckEligibility}
					style={{
						display: "flex",
						gap: "10px",
						flexWrap: "wrap",
					}}
				>
					<input
						type="text"
						value={checkAddress}
						onChange={(e) => setCheckAddress(e.target.value)}
						placeholder="Enter BSC address (0x...)"
						style={{
							flex: "1 1 280px",
							background: "rgba(0, 0, 0, 0.5)",
							border: "1px solid rgba(255, 255, 255, 0.15)",
							borderRadius: "12px",
							padding: "12px 16px",
							color: "white",
							fontSize: "14px",
							fontFamily: "monospace",
							outline: "none",
						}}
					/>
					<button
						type="submit"
						disabled={isChecking}
						style={{
							background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
							border: "none",
							color: "white",
							padding: "12px 24px",
							borderRadius: "12px",
							fontWeight: "700",
							fontSize: "14px",
							cursor: isChecking ? "not-allowed" : "pointer",
							opacity: isChecking ? 0.7 : 1,
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						{isChecking ? (
							<>
								<FaSpinner className="fa-spin" /> Checking...
							</>
						) : (
							"Check Eligibility"
						)}
					</button>
				</form>

				{checkResult && checkResult.checked && (
					<div
						style={{
							marginTop: "16px",
							padding: "14px 18px",
							borderRadius: "12px",
							background: checkResult.error
								? "rgba(239, 68, 68, 0.15)"
								: checkResult.eligible
								? "rgba(34, 197, 94, 0.15)"
								: "rgba(234, 179, 8, 0.15)",
							border: `1px solid ${
								checkResult.error
									? "rgba(239, 68, 68, 0.4)"
									: checkResult.eligible
									? "rgba(34, 197, 94, 0.4)"
									: "rgba(234, 179, 8, 0.4)"
							}`,
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
						}}
					>
						{checkResult.error ? (
							<FaExclamationTriangle color="#ef4444" style={{ marginTop: "3px", flexShrink: 0 }} />
						) : checkResult.eligible ? (
							<FaCheckCircle color="#22c55e" style={{ marginTop: "3px", flexShrink: 0 }} />
						) : (
							<FaExclamationTriangle color="#eab308" style={{ marginTop: "3px", flexShrink: 0 }} />
						)}

						<div style={{ fontSize: "14px", lineHeight: "1.5" }}>
							{checkResult.error ? (
								<span style={{ color: "#f87171" }}>{checkResult.error}</span>
							) : checkResult.eligible ? (
								<div>
									<strong style={{ color: "#4ade80" }}>
										Wallet is Qualified!
									</strong>{" "}
									Current balance:{" "}
									<strong style={{ color: "white" }}>
										{checkResult.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ARB INC
									</strong>{" "}
									(≥ 2,500,000 ARB). You will automatically receive native BNB directly to your wallet in the next RevShare distribution.
								</div>
							) : (
								<div>
									<strong style={{ color: "#facc15" }}>
										Holding Threshold Not Yet Reached.
									</strong>{" "}
									Current balance:{" "}
									<strong style={{ color: "white" }}>
										{checkResult.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ARB INC
									</strong>.
									You need at least{" "}
									<strong>
										{(MIN_QUALIFIED_HOLDING - checkResult.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })} more ARB INC
									</strong>{" "}
									to reach the 2,500,000 threshold and qualify.{" "}
									<Link
										href={SWAP_URL}
										style={{ color: "#60a5fa", textDecoration: "underline", fontWeight: "600" }}
									>
										Acquire on DEX Aggregator
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* 4. KEY PARAMETERS SUMMARY GRID */}
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
						50% / 25% / 25%
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						50% Holders / 25/25 Devs
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
						Epoch Cadence
					</div>
					<div style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: "6px 0 2px" }}>
						~3.5 Days
					</div>
					<div style={{ fontSize: "12px", color: "#64748b" }}>
						5,003 min automated batches
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

			{/* 5. STEP BY STEP GUIDE */}
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
								Hold at Least 2,500,000 ARB INC
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
								Receive Direct BNB Payouts
							</div>
							<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
								At every RevShare epoch, the distribution engine calculates qualified holder proportions and
								dispatches native BNB straight to your wallet. You don&apos;t need to connect
								to any portal or pay gas to claim.
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 6. ON-CHAIN TRANSPARENCY BOX */}
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

			{/* 7. FAQ */}
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
							The 4% ARB INC token transfer tax is split 50% holders / 25/25 devs: 50% is distributed directly to
							qualified token holders (≥ 2,500,000 ARB) on-chain in native BNB,
							and 50% is allocated equally between the two developer wallets (25% / 25% devs) for development, operations, and protocol maintenance.
							DEX aggregator fees (0.5%) and limit-order fees (0.1%) remain separate protocol revenues.
						</div>
					</div>

					<div>
						<div style={{ fontWeight: "700", color: "#facc15", marginBottom: "4px", fontSize: "15px" }}>
							How is the Estimated Holders APR calculated?
						</div>
						<div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
							The estimated APR is computed dynamically from real-time DexScreener trading volume across all active ARB INC liquidity pools (WBNB, BORT, BREW), annualized over 365 days, divided by token market cap, and halved (/ 2) to reflect the exact 50% share allocated to holders.
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
				</div>
			</div>
		</div>
	);
}
