"use client";

import React, { useEffect, useState } from "react";
import {
	FaArrowRight,
	FaBullseye,
	FaCalendarAlt,
	FaChartLine,
	FaChartPie,
	FaCheckCircle,
	FaClock,
	FaCode,
	FaCoins,
	FaCopy,
	FaExchangeAlt,
	FaExternalLinkAlt,
	FaLock,
	FaMoneyBillWave,
	FaRocket,
	FaShieldAlt,
	FaSpinner,
	FaTasks,
	FaTrophy,
	FaWater,
} from "react-icons/fa";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useProtocolData } from "../hooks/useProtocolData";
import * as S from "./HomePageStyles";

const CONTRACT_ADDRESS = "0x5ee54869ecd5e752c31af095187326d4a4d50e1c";
const TREASURY_WALLET = "0x66BB01F14229E2179bAD84D52A69C0e4628dE63f";
const ACCUMULATOR_WALLET = "0x4c1caA917FD012b285Ba35E93535675e5B59806C";
const SWAP_LINK = `/swap-all?tokenOut=${CONTRACT_ADDRESS}`;
const TOKEN_SNIFFER_LINK = `https://tokensniffer.com/token/bsc/${CONTRACT_ADDRESS}`;
const ALL_POOLS_LINK = `https://pancakeswap.finance/info/tokens/${CONTRACT_ADDRESS}`;

const HomePageClient = () => {
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const data = useProtocolData(
		CONTRACT_ADDRESS,
		TREASURY_WALLET,
		ACCUMULATOR_WALLET,
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(CONTRACT_ADDRESS);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const debtNum = parseFloat(data.protocolDebt);
	const treasuryNum = parseFloat(data.treasuryBnb);
	let ratioStr = "...",
		statusStr = "Analyzing...",
		statusColor = "#94a3b8";

	if (!isNaN(debtNum) && !isNaN(treasuryNum) && treasuryNum > 0) {
		const ratio = (debtNum / treasuryNum) * 100;
		ratioStr = ratio.toFixed(2) + "%";
		if (ratio <= 80) {
			statusStr = "✅ SECURE";
			statusColor = "#22c55e";
		} else if (ratio <= 95) {
			statusStr = "⚠️ WARNING";
			statusColor = "#facc15";
		} else {
			statusStr = "🚨 DANGER";
			statusColor = "#ef4444";
		}
	}

	if (!mounted) return null;

	return (
		<S.PageWrapper>
			<Header activePage="/" />
			<S.Container>
				<S.Hero>
					<S.Badge>Official Token: ARB Inc</S.Badge>
					<S.Title>
						Open DeFi Tools
						<br />
						for BNB Chain
					</S.Title>
					<S.Subtitle>
						A non-custodial interface for swaps, bridges, limit orders and
						optional community points. Trading is wallet-signed; hosted services
						are separate and may be unavailable.
					</S.Subtitle>
					<S.ButtonGroup>
						<S.PrimaryButton href={SWAP_LINK}>
							Swap Now <FaArrowRight />
						</S.PrimaryButton>
						<S.SecondaryButton href="#protocol-specs">
							Technical Specs
						</S.SecondaryButton>
					</S.ButtonGroup>

					{/* NEW PROMINENT REVENUE STREAMS BADGES */}
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "center",
							gap: "15px",
							marginTop: "25px",
							marginBottom: "10px",
						}}
					>
						<div
							style={{
								background: "rgba(59, 130, 246, 0.1)",
								border: "1px solid rgba(59, 130, 246, 0.4)",
								padding: "8px 16px",
								borderRadius: "20px",
								fontSize: "0.9rem",
								color: "#93c5fd",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontWeight: "bold",
							}}
						>
							<FaCoins /> 4% Token Tax
						</div>
						<div
							style={{
								background: "rgba(168, 85, 247, 0.1)",
								border: "1px solid rgba(168, 85, 247, 0.4)",
								padding: "8px 16px",
								borderRadius: "20px",
								fontSize: "0.9rem",
								color: "#d8b4fe",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontWeight: "bold",
							}}
						>
							<FaExchangeAlt /> 0.5% DEX Fee
						</div>
						<div
							style={{
								background: "rgba(34, 197, 94, 0.1)",
								border: "1px solid rgba(34, 197, 94, 0.4)",
								padding: "8px 16px",
								borderRadius: "20px",
								fontSize: "0.9rem",
								color: "#86efac",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontWeight: "bold",
							}}
						>
							<FaTasks /> Free Task Partner Fees
						</div>
					</div>

					<S.ContractContainer>
						<S.ContractBox>
							<span className="addr">{CONTRACT_ADDRESS}</span>
							<div className="actions">
								<button
									aria-label="Copy contract address"
									onClick={copyToClipboard}
								>
									{copied ? (
										<FaCheckCircle style={{ color: "#22c55e" }} />
									) : (
										<FaCopy />
									)}
								</button>
								<a
									href={`https://bscscan.com/token/${CONTRACT_ADDRESS}`}
									target="_blank"
									rel="noreferrer"
								>
									<FaExternalLinkAlt size={14} />
								</a>
							</div>
						</S.ContractBox>
						<S.AuditBadgeLink
							href={TOKEN_SNIFFER_LINK}
							target="_blank"
							rel="noreferrer"
						>
							<FaShieldAlt /> Audit on TokenSniffer
						</S.AuditBadgeLink>
					</S.ContractContainer>
				</S.Hero>

				<S.LivePulseSection>
					<div
						style={{ display: "flex", flexDirection: "column", gap: "12px" }}
					>
						<S.PulseCard $isProcessing={data.isProcessing}>
							<span className="label">Next Rewards Epoch</span>
							<span className="value">
								{data.isProcessing && <FaSpinner className="fa-spin" />}
								{data.timerDisplay}
							</span>
							<span className="sub" style={{ marginBottom: "15px" }}>
								Points and accounting only; no payout is scheduled
							</span>

							<div
								className="data-panel epoch-panel"
								style={{
									background: "rgba(250, 204, 21, 0.1)",
									border: "1px solid rgba(250, 204, 21, 0.3)",
									borderRadius: "12px",
									padding: "12px",
									marginBottom: "15px",
								}}
							>
								<div
									style={{
										fontSize: "0.7rem",
										color: "#facc15",
										textTransform: "uppercase",
										marginBottom: "5px",
										display: "flex",
										alignItems: "center",
										gap: "5px",
									}}
								>
										<FaCalendarAlt /> Epoch schedule
								</div>
								<div style={{ fontSize: "0.85rem", color: "white" }}>
										This reset applies to points and accounting only. It does not
										trigger or guarantee a BNB payout.
								</div>
							</div>

							<div
								className="data-panel accumulator-panel"
								style={{
									background: "rgba(168, 85, 247, 0.05)",
									border: "1px solid rgba(168, 85, 247, 0.2)",
									borderRadius: "12px",
									padding: "15px",
									marginTop: "auto",
								}}
							>
								<div
									style={{
										fontSize: "0.75rem",
										color: "#a855f7",
										textTransform: "uppercase",
										marginBottom: "10px",
										letterSpacing: "1px",
									}}
								>
									Accumulator (Pending)
								</div>
								<div
									style={{
										display: "flex",
										flexWrap: "wrap",
										justifyContent: "space-between",
										gap: "4px",
										fontSize: "0.85rem",
										marginBottom: "6px",
									}}
								>
									<span style={{ color: "#94a3b8" }}>Pending BNB</span>
									<span style={{ color: "white" }}>{data.accBnb} BNB</span>
								</div>
								<div
									style={{
										display: "flex",
										flexWrap: "wrap",
										justifyContent: "space-between",
										gap: "4px",
										fontSize: "0.85rem",
									}}
								>
									<span style={{ color: "#94a3b8" }}>Pending ARB</span>
									<span style={{ color: "white" }}>{data.accTokens} ARB</span>
								</div>
							</div>
							<a
								href={`https://bscscan.com/address/${ACCUMULATOR_WALLET}`}
								target="_blank"
								rel="noreferrer"
								className="verify-link"
								style={{ marginTop: "10px", alignSelf: "center" }}
							>
								<FaExternalLinkAlt size={10} /> View Accumulator Wallet
							</a>
						</S.PulseCard>
						<S.ActionButton
							href="/rewards"
							style={{
								display: "block",
								width: "100%",
								boxSizing: "border-box",
								padding: "14px",
								borderRadius: "16px",
								fontSize: "1rem",
							}}
						>
							Go to Rewards
						</S.ActionButton>
					</div>

					<S.PulseCard>
						<div className="header-row">
							<span className="label">Trading Volume (24h)</span>
							<S.LiveIndicator>
								<div className="dot"></div>Live
							</S.LiveIndicator>
						</div>
						<div
							className="data-panel volume-panel"
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "10px",
								margin: "15px 0",
							}}
						>
							<div>
								<span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
									Aggregated Token Volume
								</span>
								<span
									style={{
										color: "#3b82f6",
										fontWeight: "bold",
										fontSize: "1.8rem",
										display: "block",
									}}
								>
									{data.tokenVolume24h !== null ? (
										`$${data.tokenVolume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
									) : (
										<FaSpinner className="fa-spin" size={20} />
									)}
								</span>
							</div>
							<div
								style={{
									borderTop: "1px solid rgba(255,255,255,0.05)",
									paddingTop: "10px",
								}}
							>
								<span
									style={{
										fontSize: "0.75rem",
										color: "#94a3b8",
										display: "flex",
										alignItems: "center",
										gap: "5px",
									}}
								>
									<FaWater size={10} /> Total Token Liquidity
								</span>
								<span
									style={{
										color: "white",
										fontWeight: "bold",
										fontSize: "1.2rem",
									}}
								>
									{data.tokenLiquidity !== null ? (
										`$${data.tokenLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
									) : (
										<FaSpinner className="fa-spin" size={14} />
									)}
								</span>
							</div>
							<div
								style={{
									borderTop: "1px solid rgba(255,255,255,0.05)",
									paddingTop: "10px",
								}}
							>
								<span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
									Estimated Community Rewards APR
									{data.aprPeriodDays ? ` (${data.aprPeriodDays}d)` : ""}
								</span>
								<span
									style={{
										color: "#c4b5fd",
										fontWeight: "bold",
										fontSize: "1.2rem",
										display: "block",
									}}
								>
									{data.globalApr}
								</span>
								<span style={{ fontSize: "0.68rem", color: "#64748b" }}>
									{data.aprPeriodDays
										? "Best observed historical fee window"
										: data.aprSource || "Historical fee estimate"}; not guaranteed.
								</span>
							</div>
						</div>
						<a
							href={ALL_POOLS_LINK}
							target="_blank"
							rel="noreferrer"
							className="verify-link"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "5px",
								marginTop: "10px",
							}}
						>
							<FaChartLine /> View All Pools on PancakeSwap{" "}
							<FaExternalLinkAlt size={10} />
						</a>

						<div
							className="data-panel secondary-panel"
							style={{
								background: "rgba(0,0,0,0.3)",
								border: "1px solid rgba(255,255,255,0.05)",
								borderRadius: "12px",
								padding: "12px",
								marginTop: "auto",
								marginBottom: "10px",
							}}
						>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									gap: "4px",
									fontSize: "0.8rem",
									marginBottom: "4px",
								}}
							>
									<span style={{ color: "#64748b", textTransform: "uppercase" }}>
										DeFiLlama Fee Data
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									gap: "4px",
									fontSize: "0.8rem",
								}}
							>
										<span style={{ color: "#94a3b8" }}>
											{data.aprPeriodDays
												? `${data.aprPeriodDays}d Calibrated APR Basis`
												: "Calibrated APR Basis"}
										</span>
								<span style={{ color: "white", fontWeight: "bold" }}>
											{data.aprCalibratedFeesUsd !== null
												? `$${data.aprCalibratedFeesUsd.toLocaleString(undefined, {
														maximumFractionDigits: 2,
													})}`
												: "..."}
								</span>
							</div>
						</div>

						<a
							href="https://defillama.com/protocol/arbitrage-inc"
							target="_blank"
							rel="noreferrer"
							className="defillama-btn"
						>
							🦙 Open DefiLlama
						</a>
					</S.PulseCard>

					<S.PulseCard>
						<div className="header-row">
							<span className="label">Treasury Wallet</span>
							<FaShieldAlt style={{ color: "#22c55e" }} />
						</div>
						<div
							className="data-panel balance-panel"
							style={{
								background: "rgba(0,0,0,0.3)",
								border: "1px solid rgba(255,255,255,0.05)",
								borderRadius: "12px",
								padding: "20px",
								margin: "15px 0",
							}}
						>
							<div
								style={{ display: "flex", flexDirection: "column", gap: "8px" }}
							>
								<span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
									Live Balance
								</span>
								<span
									style={{
										color: "#facc15",
										fontWeight: "bold",
										fontSize: "1.8rem",
									}}
								>
									{data.treasuryBnb} BNB
								</span>
							</div>
						</div>
						<div
							className="data-panel health-panel"
							style={{
								background: "rgba(34, 197, 94, 0.05)",
								border: "1px solid rgba(34, 197, 94, 0.2)",
								borderRadius: "12px",
								padding: "15px",
								marginTop: "auto",
							}}
						>
							<div
								style={{
									fontSize: "0.75rem",
									color: "#22c55e",
									textTransform: "uppercase",
									marginBottom: "10px",
									letterSpacing: "1px",
								}}
							>
								Protocol Health
							</div>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									gap: "4px",
									fontSize: "0.85rem",
									marginBottom: "6px",
								}}
							>
								<span style={{ color: "#94a3b8" }}>Total User Debt</span>
								<span style={{ color: "#ef4444", fontWeight: "bold" }}>
									{data.protocolDebt} BNB
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									gap: "4px",
									fontSize: "0.85rem",
									marginBottom: "6px",
								}}
							>
								<span style={{ color: "#94a3b8" }}>Utilization Ratio</span>
								<span style={{ color: "white", fontWeight: "bold" }}>
									{ratioStr}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									gap: "4px",
									fontSize: "0.85rem",
								}}
							>
								<span style={{ color: "#94a3b8" }}>System Status</span>
								<span style={{ color: statusColor, fontWeight: "bold" }}>
									{statusStr}
								</span>
							</div>
						</div>
						<div
							className="notice-panel"
							style={{
								background: "rgba(250, 204, 21, 0.15)",
								border: "1px solid rgba(250, 204, 21, 0.4)",
								borderRadius: "12px",
								padding: "15px",
								marginTop: "10px",
								textAlign: "center",
							}}
						>
							<div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>
								Protocol activity figures and the displayed APR are informational
								estimates, not guaranteed returns, payout rates or claim quotes.
							</div>
						</div>

						{/* NEW TREASURY LINK */}
						<a
							href={`https://bscscan.com/address/${TREASURY_WALLET}`}
							target="_blank"
							rel="noreferrer"
							className="verify-link"
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								gap: "5px",
								marginTop: "15px",
							}}
						>
							<FaExternalLinkAlt size={10} /> View Treasury Wallet
						</a>
					</S.PulseCard>
				</S.LivePulseSection>

				<S.YieldEngineSection>
					<h2>Community Points Service</h2>
					<div className="grid-3">
						<div className="yield-card">
							<div className="icon-head">
								<FaRocket className="icon" />
								<h3>Trade & Farm</h3>
							</div>
							<p>
								Stack points with every action (<strong>0.5% DEX fee</strong>):{" "}
								<strong>Swap (100), Zap (150)</strong> or{" "}
								<strong>Limit Orders (200)</strong>. Every trade fuels the
								treasury.
							</p>
						</div>
						<div className="yield-card">
							<div className="icon-head">
								<FaCoins className="icon" />
																<h3>BNB Chain Community Rewards</h3>
							</div>
							<p>
																Community points may be generated by eligible activity and balances.
																Qualifying participants may request a BNB claim through the hosted service;
																claims depend on available reserves, accounting state and service
																availability.
							</p>
						</div>
						<div className="yield-card">
							<div className="icon-head">
								<FaTasks className="icon" style={{ color: "#3b82f6" }} />
								<h3>Free Point Tasks</h3>
							</div>
							<p>
									Complete eligible <strong>Free Tasks</strong> and invite friends to
									participate. Referral attribution may affect points; no income or
									payout is guaranteed.
							</p>
						</div>
					</div>
				</S.YieldEngineSection>

				<S.ProtocolSpecsSection id="protocol-specs">
					<h2>Protocol Transparency</h2>
					<div className="supply-box">
						<span className="label">Total Supply</span>
						<span className="value">1 Billion</span>
						<span className="sub">4% Buy/Sell Tax for Rewards</span>
					</div>
					<div className="spec-grid">
						<S.SpecCard>
							<FaChartPie className="icon" />
							<span className="label">Revenue Routing</span>
														<span className="value">Mixed Execution</span>
							<span className="desc">
																On-chain funds, hosted accounting
							</span>
						</S.SpecCard>
						<S.SpecCard>
							<FaClock className="icon" />
							<span className="label">Reward Frequency</span>
														<span className="value">On Claim</span>
														<span className="desc">Optional BNB payout</span>
						</S.SpecCard>
						<S.SpecCard>
							<FaBullseye className="icon" />
							<span className="label">Ranking Precision</span>
							<span className="value">9 Decimals</span>
							<span className="desc">Fair & Precise math</span>
						</S.SpecCard>
					</div>
				</S.ProtocolSpecsSection>

				<S.FeatureGrid>
					<S.FeatureCard>
						<div className="icon-box">
							<FaMoneyBillWave />
						</div>
						<h3>Diversified Revenue</h3>
						<p>
							The Treasury is fueled by 3 distinct streams: a{" "}
							<strong>4% Token Tax</strong> (Buy/Sell), a highly competitive{" "}
							<strong>0.5% DEX Fee</strong>, and{" "}
									<strong>Free Task partner fees</strong> where enabled.
						</p>
					</S.FeatureCard>
					<S.FeatureCard>
						<div className="icon-box">
							<FaTrophy />
						</div>
						<h3>9-Decimal Justice</h3>
						<p>
							Our proprietary ranking system ensures rewards are distributed
							with mathematical precision to the last decimal.
						</p>
					</S.FeatureCard>
					<S.FeatureCard>
						<div className="icon-box">
							<FaShieldAlt />
						</div>
						<h3>Season Reset</h3>
						<p>
							To keep the competition fresh, the leaderboard and points reset on
							the <strong>1st and 15th</strong> of every month.
						</p>
					</S.FeatureCard>
				</S.FeatureGrid>

				<S.AuditSection>
					<h2>Security & Audit</h2>
					<p className="audit-sub">
						Arbitrage Inception prioritizes safety through strategic
						simplification.
					</p>
					<div className="audit-grid">
						<S.AuditCard>
							<FaCheckCircle className="icon" />
							<h4>KyberSwap Integration</h4>
							<p>
								We leverage KyberSwap widgets for trading logic, audited by
								ChainSecurity.
							</p>
						</S.AuditCard>
						<S.AuditCard>
							<FaLock className="icon" />
							<h4>Minimal Attack Surface</h4>
							<p>
								By routing via battle-tested aggregators, we eliminate custom
								custodial vulnerabilities.
							</p>
						</S.AuditCard>
						<S.AuditCard>
							<FaCode className="icon" />
							<h4>Frontend Rewards Logic</h4>
							<p>
								Rankings are processed by a transparent frontend engine with
								9-decimal precision.
							</p>
						</S.AuditCard>
					</div>
				</S.AuditSection>
			</S.Container>
			<Footer />
		</S.PageWrapper>
	);
};

export default HomePageClient;
