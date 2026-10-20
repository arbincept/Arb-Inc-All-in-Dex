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
const ACCUMULATOR_WALLET = "0x4c1caA917FD012b285Ba35E93535675e5B59806C";
const REVSHARE_LINK = "https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c";
const SWAP_LINK = `/swap-all?tokenOut=${CONTRACT_ADDRESS}`;
const TOKEN_SNIFFER_LINK = `https://tokensniffer.com/token/bsc/${CONTRACT_ADDRESS}`;
const ALL_POOLS_LINK = `https://pancakeswap.finance/info/tokens/${CONTRACT_ADDRESS}`;

const HomePageClient = () => {
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const data = useProtocolData(CONTRACT_ADDRESS, ACCUMULATOR_WALLET);

	useEffect(() => {
		setMounted(true);
	}, []);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(CONTRACT_ADDRESS);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

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
						A non-custodial interface for swaps, bridges, and limit orders.
						Trading is wallet-signed with automated on-chain rewards for ARB INC token holders.
					</S.Subtitle>
					<S.ButtonGroup>
						<S.PrimaryButton href={SWAP_LINK}>
							Swap Now <FaArrowRight />
						</S.PrimaryButton>
						<S.SecondaryButton href="#protocol-specs">
							Protocol Specs
						</S.SecondaryButton>
					</S.ButtonGroup>

					{/* PROMINENT REVENUE STREAMS BADGES */}
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
							<FaCoins /> 4% Tax (50% Holders / 50% Team)
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
							<FaShieldAlt /> 100% Non-Custodial
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
						<div
							style={{
								display: "flex",
								gap: "10px",
								flexWrap: "wrap",
								justifyContent: "center",
							}}
						>
							<S.AuditBadgeLink
								href={REVSHARE_LINK}
								target="_blank"
								rel="noreferrer"
								style={{
									background: "rgba(168, 85, 247, 0.12)",
									borderColor: "rgba(168, 85, 247, 0.35)",
									color: "#c084fc",
								}}
							>
								<FaCoins /> Verified on RevShare.ltd
							</S.AuditBadgeLink>
							<S.AuditBadgeLink
								href={TOKEN_SNIFFER_LINK}
								target="_blank"
								rel="noreferrer"
							>
								<FaShieldAlt /> Audit on TokenSniffer
							</S.AuditBadgeLink>
						</div>
					</S.ContractContainer>
				</S.Hero>

				<S.LivePulseSection>
					<div
						style={{ display: "flex", flexDirection: "column", gap: "12px" }}
					>
						<S.PulseCard $isProcessing={data.isProcessing}>
							<div className="header-row">
								<span className="label">Automated RevShare Epoch</span>
								<S.LiveIndicator>
									<div className="dot"></div>Live
								</S.LiveIndicator>
							</div>
							<span className="value">
								{data.isProcessing && <FaSpinner className="fa-spin" />}
								{data.timerDisplay}
							</span>
							<span className="sub" style={{ marginBottom: "15px" }}>
								24h automated BNB push (50% to qualified holders)
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
									<FaCalendarAlt /> 100% Automated Distribution (50/50 Split)
								</div>
								<div style={{ fontSize: "0.85rem", color: "white" }}>
									Every 24 hours, the 4% token tax is distributed: 50% is pushed
									directly to qualified token holders' wallets on-chain via
									RevShare (min. 1,000,000 ARB INC), and 50% supports team operations.
									No manual claim, no locking, zero gas required from holders.
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
									Accumulator Reserves (Pending Payout)
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

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
									marginTop: "12px",
								}}
							>
								<a
									href={REVSHARE_LINK}
									target="_blank"
									rel="noreferrer"
									className="defillama-btn"
									style={{
										borderColor: "rgba(168, 85, 247, 0.4)",
										color: "#c084fc",
										background: "rgba(168, 85, 247, 0.1)",
									}}
								>
									<FaCoins /> View on RevShare.ltd
								</a>
								<a
									href={`https://bscscan.com/address/${ACCUMULATOR_WALLET}`}
									target="_blank"
									rel="noreferrer"
									className="verify-link"
									style={{ alignSelf: "center" }}
								>
									<FaExternalLinkAlt size={10} /> View Accumulator on BscScan
								</a>
							</div>
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
							How Rewards Work & FAQ
						</S.ActionButton>
					</div>

					<div
						style={{ display: "flex", flexDirection: "column", gap: "12px" }}
					>
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
										Estimated Holder Rewards APR
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
						<S.ActionButton
							href={SWAP_LINK}
							style={{
								display: "block",
								width: "100%",
								boxSizing: "border-box",
								padding: "14px",
								borderRadius: "16px",
								fontSize: "1rem",
								background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
							}}
						>
							Swap on Aggregator
						</S.ActionButton>
					</div>
				</S.LivePulseSection>

				<S.YieldEngineSection>
					<h2>DeFi Architecture & Revenue Engine</h2>
					<div className="grid-3">
						<div className="yield-card">
							<div className="icon-head">
								<FaCoins className="icon" />
								<h3>Automated Holder RevShare</h3>
							</div>
							<p>
								The <strong>4% token tax</strong> is split 50% directly
								to qualified ARB INC holders on-chain via RevShare every 24 hours,
								and 50% to the team for protocol maintenance and operations.
							</p>
						</div>
						<div className="yield-card">
							<div className="icon-head">
								<FaRocket className="icon" />
								<h3>DEX Aggregator (0.5% Fee)</h3>
							</div>
							<p>
								Deep on-chain liquidity routed through KyberSwap aggregator widgets.
								Enjoy optimal prices, minimal slippage across all BSC DEX pools,
								and transparent execution.
							</p>
						</div>
						<div className="yield-card">
							<div className="icon-head">
								<FaTasks className="icon" style={{ color: "#3b82f6" }} />
								<h3>Limit Orders & Bridges</h3>
							</div>
							<p>
								Decentralized limit orders powered by KyberSwap (0.1% fee) and fast
								cross-chain transfers powered by Mayan Finance and Wormhole.
							</p>
						</div>
					</div>
				</S.YieldEngineSection>

				<S.ProtocolSpecsSection id="protocol-specs">
					<h2>Protocol Transparency</h2>
					<div className="supply-box">
						<span className="label">Total Supply</span>
						<span className="value">1 Billion</span>
						<span className="sub">4% Tax: 50% Holders / 50% Team</span>
					</div>
					<div className="spec-grid">
						<S.SpecCard>
							<FaChartPie className="icon" />
							<span className="label">Revenue Routing</span>
							<span className="value">Direct On-Chain</span>
							<span className="desc">
								Accumulator pushes direct to holders
							</span>
						</S.SpecCard>
						<S.SpecCard>
							<FaClock className="icon" />
							<span className="label">Reward Frequency</span>
							<span className="value">Every 24 Hours</span>
							<span className="desc">Automated direct push</span>
						</S.SpecCard>
						<S.SpecCard>
							<FaBullseye className="icon" />
							<span className="label">Min. Holding</span>
							<span className="value">1M ARB INC</span>
							<span className="desc">RevShare qualified threshold</span>
						</S.SpecCard>
					</div>
				</S.ProtocolSpecsSection>

				<S.FeatureGrid>
					<S.FeatureCard>
						<div className="icon-box">
							<FaMoneyBillWave />
						</div>
						<h3>Direct RevShare</h3>
						<p>
							The 4% token tax is collected by the Accumulator wallet: 50% is pushed directly
							to qualified token holders every 24 hours via RevShare, and 50% supports team
							operations. Completely non-custodial with no intermediary.
						</p>
					</S.FeatureCard>
					<S.FeatureCard>
						<div className="icon-box">
							<FaShieldAlt />
						</div>
						<h3>100% Non-Custodial</h3>
						<p>
							Your assets remain in your wallet at all times. Swaps, limit orders, and cross-chain
							bridges interact directly with audited decentralized contracts.
						</p>
					</S.FeatureCard>
					<S.FeatureCard>
						<div className="icon-box">
							<FaChartLine />
						</div>
						<h3>Aggregator Routing</h3>
						<p>
							KyberSwap integration provides deep liquidity routing across BSC, finding the best
							execution prices with minimal slippage.
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
