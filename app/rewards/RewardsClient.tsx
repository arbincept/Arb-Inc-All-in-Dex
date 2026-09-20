"use client";

import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Offer {
	title: string;
	link: string;
}
interface Leader {
	address: string;
	points: number;
}

export default function RewardsClient() {
	const [{ wallet, connecting }, connect] = useConnectWallet();
	const connectedWallets = useWallets();
	const searchParams = useSearchParams();

	const [offers, setOffers] = useState<Offer[]>([]);
	const [leaderboard, setLeaderboard] = useState<Leader[]>([]);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);

	const [claimableBnb, setClaimableBnb] = useState(0);
	const [userPoints, setUserPoints] = useState(0);
	const [referralCount, setReferralCount] = useState(0);
	const [referralEarnings, setReferralEarnings] = useState(0);

	const [claimLoading, setClaimLoading] = useState(false);
	const [claimStatus, setClaimStatus] = useState("");

	const address =
		wallet?.accounts?.[0]?.address ||
		connectedWallets?.[0]?.accounts?.[0]?.address;

	const fetchRewardsData = async () => {
		if (!address) return;
		try {
			const urlRef = searchParams?.get("ref");
			const storedRef =
				typeof window !== "undefined"
					? localStorage.getItem("arb_inc_referrer")
					: null;
			const ref = urlRef || storedRef;

			if (urlRef && typeof window !== "undefined") {
				const existing = localStorage.getItem("arb_inc_referrer");
				if (!existing && /^0x[a-fA-F0-9]{40}$/i.test(urlRef)) {
					localStorage.setItem("arb_inc_referrer", urlRef.toLowerCase());
				}
			}

			let url = `/api/rewards/stats?wallet=${address.toLowerCase()}`;
			if (ref && /^0x[a-fA-F0-9]{40}$/i.test(ref)) {
				url += `&ref=${ref.toLowerCase()}`;
			}

			const res = await fetch(url);
			const data = await res.json();

			if (data.claimable !== undefined) setClaimableBnb(data.claimable);
			if (data.points !== undefined) setUserPoints(data.points);
			if (data.referralCount !== undefined)
				setReferralCount(data.referralCount);
			if (data.referralEarnings !== undefined)
				setReferralEarnings(data.referralEarnings);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		if (address) fetchRewardsData();

		const fetchStats = async () => {
			setLoading(true);
			const fetchWallet =
				address || "0x0000000000000000000000000000000000000000";

			try {
				const resOffers = await fetch(`/api/offers?wallet=${fetchWallet}`);
				const dataOffers = await resOffers.json();
				if (dataOffers.offers) setOffers(dataOffers.offers);

				const resLeader = await fetch(`/api/leaderboard`);
				const dataLeader = await resLeader.json();
				if (dataLeader.leaderboard) setLeaderboard(dataLeader.leaderboard);
			} catch (err) {
				console.error("Error fetching generic data:", err);
			}

			setLoading(false);
		};
		fetchStats();
	}, [address, searchParams]);

	const handleClaim = async () => {
		if (!address) return;
		setClaimLoading(true);
		setClaimStatus("Processing...");
		try {
			const res = await fetch("/api/rewards/claim", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: AbortSignal.timeout(28000),
				body: JSON.stringify({ wallet: address, walletAddress: address }),
			});
			const resData = await res.json().catch(() => ({}));
			if (res.ok && resData.success) {
				const txIdentifier = resData.txHash || resData.hash || "";
				setClaimStatus(`✅ Confirmed: ${txIdentifier.substring(0, 10)}...`);
				fetchRewardsData();
			} else if (res.status === 429) {
				setClaimStatus("⏳ In elaborazione. Riprova tra 30s.");
			} else {
				setClaimStatus(`❌ ${resData.error || "Claim failed"}`);
			}
		} catch (e: any) {
			if (e?.name === "TimeoutError") {
				setClaimStatus("⏳ Attesa blocco... verifica su BscScan tra poco");
			} else {
				setClaimStatus("❌ Errore di connessione");
			}
		}
		setClaimLoading(false);
	};

	const referralLink = address
		? `${typeof window !== "undefined" ? window.location.origin : "https://arbitrage-inc.exchange"}/rewards?ref=${address}`
		: "";

	const telegramShareUrl = referralLink
		? `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Explore non-custodial swaps and optional community points on Arbitrage Inception:")}`
		: "";

	const twitterShareUrl = referralLink
		? `https://twitter.com/intent/tweet?text=${encodeURIComponent("Explore non-custodial swaps and optional community points on @Arbitrageincept:")}&url=${encodeURIComponent(referralLink)}`
		: "";

	return (
		<div
			style={{
				color: "white",
				fontFamily: "sans-serif",
				padding: "20px",
				maxWidth: "1000px",
				width: "100%",
				boxSizing: "border-box",
				margin: "0 auto",
				overflowX: "hidden",
				overflowWrap: "break-word",
			}}
		>
			{/* 1. AFFILIATE & PROMOTER DASHBOARD */}
			<div
				style={{
					background: "linear-gradient(135deg, #1e1b4b 0%, #0f0a2a 100%)",
					border: "1px solid #4338ca",
					padding: "32px 24px",
					boxSizing: "border-box",
					borderRadius: "16px",
					textAlign: "center",
					marginBottom: "30px",
					boxShadow: "0 8px 32px rgba(67, 56, 202, 0.15)",
				}}
			>
				<div
					style={{
						display: "inline-block",
						background: "rgba(129, 140, 248, 0.15)",
						border: "1px solid rgba(129, 140, 248, 0.3)",
						borderRadius: "20px",
						padding: "4px 14px",
						fontSize: "12px",
						color: "#a5b4fc",
						fontWeight: "600",
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						marginBottom: "12px",
					}}
				>
					10% Peer Referral Bonus
				</div>
				<h2
					style={{
						margin: "0 0 10px 0",
						fontSize: "26px",
						fontWeight: "800",
						color: "#ffffff",
					}}
				>
					Community Referral & Promoter Hub 🚀
				</h2>

				<p
					style={{
						color: "#94a3b8",
						fontSize: "14px",
						maxWidth: "680px",
						margin: "0 auto 24px auto",
						lineHeight: "1.6",
					}}
				>
					Share the open-source interface with your community. Referral attribution
					may affect hosted community points generated by eligible activity, but it
					does not promise income, commission or a payout.
				</p>

				<div
					style={{
						display: "flex",
						justifyContent: "center",
						flexWrap: "wrap",
						gap: "16px",
						marginBottom: "24px",
					}}
				>
					<div
						style={{
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							padding: "14px 24px",
							borderRadius: "12px",
							minWidth: "140px",
						}}
					>
						<div
							style={{ fontSize: "22px", fontWeight: "800", color: "#818cf8" }}
						>
							{referralCount}
						</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94a3b8",
								textTransform: "uppercase",
								marginTop: "4px",
								fontWeight: "600",
								letterSpacing: "0.5px",
							}}
						>
							Active Referrals
						</div>
					</div>
					<div
						style={{
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							padding: "14px 24px",
							borderRadius: "12px",
							minWidth: "140px",
						}}
					>
						<div
							style={{ fontSize: "22px", fontWeight: "800", color: "#10b981" }}
						>
							{referralEarnings.toFixed(2)}
						</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94a3b8",
								textTransform: "uppercase",
								marginTop: "4px",
								fontWeight: "600",
								letterSpacing: "0.5px",
							}}
						>
							Referral Bonus Points
						</div>
					</div>
					<div
						style={{
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							padding: "14px 24px",
							borderRadius: "12px",
							minWidth: "140px",
						}}
					>
						<div
							style={{ fontSize: "22px", fontWeight: "800", color: "#facc15" }}
						>
							10%
						</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94a3b8",
								textTransform: "uppercase",
								marginTop: "4px",
								fontWeight: "600",
								letterSpacing: "0.5px",
							}}
						>
							Bonus Tier (10%)
						</div>
					</div>
				</div>

				{!address ? (
					<button
						onClick={() => connect()}
						style={{
							background: "#4f46e5",
							color: "white",
							border: "none",
							padding: "12px 28px",
							borderRadius: "10px",
							fontSize: "15px",
							fontWeight: "700",
							cursor: "pointer",
							boxShadow: "0 4px 16px rgba(79, 70, 229, 0.4)",
							transition: "all 0.2s ease",
						}}
					>
						Connect Wallet to Access Link
					</button>
				) : (
					<div
						style={{
							display: "flex",
							gap: "16px",
							flexDirection: "column",
							alignItems: "center",
							width: "100%",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: "10px",
								width: "100%",
								maxWidth: "650px",
								justifyContent: "center",
								flexWrap: "wrap",
							}}
						>
							<input
								readOnly
								value={referralLink}
								style={{
									background: "#08071a",
									color: "#818cf8",
									padding: "12px 14px",
									borderRadius: "8px",
									flex: "1 1 280px",
									border: "1px solid #312e81",
									fontSize: "13px",
									outline: "none",
								}}
							/>
							<button
								onClick={() => {
									navigator.clipboard.writeText(referralLink);
									setCopied(true);
									setTimeout(() => setCopied(false), 2000);
								}}
								style={{
									background: copied ? "#059669" : "#4f46e5",
									border: "none",
									color: "white",
									padding: "12px 22px",
									borderRadius: "8px",
									fontWeight: "700",
									fontSize: "13px",
									cursor: "pointer",
									minWidth: "90px",
									transition: "background 0.2s ease",
								}}
							>
								{copied ? "Copied! ✓" : "Copy Link"}
							</button>
						</div>

						{/* Quick Share Buttons */}
						<div
							style={{
								display: "flex",
								gap: "12px",
								justifyContent: "center",
								flexWrap: "wrap",
								marginTop: "4px",
							}}
						>
							<a
								href={telegramShareUrl}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									background: "#229ed9",
									color: "#ffffff",
									textDecoration: "none",
									padding: "8px 18px",
									borderRadius: "8px",
									fontSize: "13px",
									fontWeight: "600",
									transition: "opacity 0.2s",
								}}
							>
								✈️ Share on Telegram
							</a>
							<a
								href={twitterShareUrl}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									background: "#000000",
									border: "1px solid #334155",
									color: "#ffffff",
									textDecoration: "none",
									padding: "8px 18px",
									borderRadius: "8px",
									fontSize: "13px",
									fontWeight: "600",
									transition: "opacity 0.2s",
								}}
							>
								𝕏 Share on X
							</a>
						</div>

						{/* Trust Features */}
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								gap: "24px",
								flexWrap: "wrap",
								marginTop: "16px",
								borderTop: "1px solid rgba(255,255,255,0.06)",
								paddingTop: "16px",
								width: "100%",
								maxWidth: "700px",
							}}
						>
							<span style={{ color: "#94a3b8", fontSize: "12px" }}>
								🔒 <b>Permanent Sticky Sync:</b> Attributed upon first connection
							</span>
							<span style={{ color: "#94a3b8", fontSize: "12px" }}>
								⚡ <b>Optional claims:</b> Eligible points may support a BNB claim
							</span>
							<span style={{ color: "#94a3b8", fontSize: "12px" }}>
								⛽ <b>Zero Gas To Refer:</b> 100% off-chain attribution tracking
							</span>
						</div>

														{/* Regulatory notice */}
						<div
							style={{
								marginTop: "16px",
								padding: "12px 18px",
								background: "rgba(0,0,0,0.35)",
								borderRadius: "10px",
								border: "1px solid rgba(255,255,255,0.06)",
								textAlign: "center",
								fontSize: "11px",
								color: "#94a3b8",
								lineHeight: "1.5",
								maxWidth: "700px",
							}}
														>
														⚖️ <b>Project Notice:</b> This referral mechanism is a non-custodial software gamification and community incentive program. Community points are non-monetary, non-transferable protocol metrics used by the hosted rewards service to track eligible activity and calculate possible proportional claims. The program is not a promise of income, dividend, investment return or guaranteed payout. Trading remains wallet-signed, while points and pending balances are maintained through hosted infrastructure.
						</div>
					</div>
				)}
			</div>

			{/* 2. rewardS BOX */}
			<div
				style={{
					background: "linear-gradient(135deg, #2e1065, #000)",
					border: "1px solid #a78bfa",
					padding: "30px",
					boxSizing: "border-box",
					borderRadius: "16px",
					textAlign: "center",
					marginBottom: "30px",
				}}
			>
				<h2 style={{ color: "#a78bfa", margin: "0 0 15px 0" }}>
						💎 Community Points and Optional Claims
				</h2>
				<p
					style={{
						color: "#cbd5e1",
						fontSize: "14px",
						marginBottom: "25px",
						lineHeight: "1.6",
					}}
				>
					The project reports three documented revenue sources:{" "}
					<b>4% Token Tax (Buy/Sell)</b>, <b>0.5% DEX Fees</b>, and{" "}
					<b>Free Task partner revenue</b> where enabled.<br />
																Points and BNB reward accounting are maintained by hosted infrastructure. Eligible users may request a BNB claim through the BNB Chain tools; availability, amount and timing are not guaranteed.
					<br />
					<br />
					<b>
						🟣 Active DEX Rewards{" "}
						<span
							style={{
								color: "#a78bfa",
								fontSize: "13px",
								fontWeight: "normal",
							}}
						>
							(0.5% Fee)
						</span>
						:
					</b>
					<br />🔄 Swap: <b>+100 Pts</b> | ⚡ Zap: <b>+150 Pts</b> | 🎯 Limit:{" "}
					<b>+200 Pts</b>
				</p>

				<div
					style={{
						background: "rgba(250, 204, 21, 0.1)",
						border: "1px solid #facc15",
						padding: "15px 30px",
						borderRadius: "12px",
						display: "inline-block",
						marginBottom: "25px",
					}}
				>
					<div
						style={{
							fontSize: "13px",
							color: "#facc15",
							textTransform: "uppercase",
							fontWeight: "bold",
						}}
					>
						Service information
					</div>
					<div style={{ fontSize: "38px", color: "#fff", fontWeight: "900" }}>
						Hosted rewards accounting
					<p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "6px", fontStyle: "italic" }}>Claimable BNB is not an APR, return or payout rate. Claims depend on eligibility, recorded balances, reserves, gas and service availability.</p>
					</div>
				</div>

				<div
					style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "5px" }}
				>
					{address ? claimableBnb.toFixed(6) : "0.000000"} BNB
				</div>
				<p style={{ color: "#a78bfa", fontSize: "14px", marginBottom: "25px" }}>
					Your Points:{" "}
					{address ? Math.round(userPoints).toLocaleString("en-US") : "0"}
				</p>

				{!address ? (
					<button
						onClick={() => connect()}
						style={{
							background: "#a78bfa",
							color: "white",
							border: "none",
							padding: "15px 20px",
							width: "100%",
							borderRadius: "8px",
							cursor: "pointer",
							fontWeight: "bold",
						}}
					>
						CONNECT WALLET TO START
					</button>
				) : (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "12px",
						}}
					>
						<button
							onClick={handleClaim}
							disabled={claimLoading || claimableBnb < 0.001}
							style={{
								background: claimableBnb < 0.001 ? "#222" : "#a78bfa",
								color: "white",
								padding: "15px 20px",
								width: "100%",
								borderRadius: "8px",
								cursor: claimableBnb < 0.001 ? "not-allowed" : "pointer",
								fontWeight: "bold",
							}}
						>
							{claimLoading
								? "Processing..."
								: claimableBnb < 0.001
									? "MIN. 0.001 BNB TO CLAIM"
									: "CLAIM BNB NOW"}
						</button>
					</div>
				)}
			</div>

			{/* 3. DIAMOND VS PAPER HANDS */}
			<div
				style={{
					background: "#000",
					border: "1px solid #333",
					padding: "25px",
					boxSizing: "border-box",
					borderRadius: "16px",
					marginBottom: "30px",
				}}
			>
				<h3 style={{ textAlign: "center", color: "#10b981", marginTop: 0 }}>
					🛡️ Diamond Hands Protection
				</h3>
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
						gap: "20px",
						marginTop: "20px",
					}}
				>
					<div
						style={{
							background: "rgba(16, 185, 129, 0.05)",
							border: "1px solid #10b981",
							padding: "15px",
							borderRadius: "12px",
						}}
					>
						<h4 style={{ color: "#10b981", margin: "0 0 10px 0" }}>
							✅ Diamond Status
						</h4>
						<p style={{ fontSize: "13px", color: "#a7f3d0" }}>
							No minimum holding. Every token generates points every 15 minutes.
							High holding = High Points.
						</p>
					</div>
					<div
						style={{
							background: "rgba(239, 68, 68, 0.05)",
							border: "1px solid #ef4444",
							padding: "15px",
							borderRadius: "12px",
						}}
					>
						<h4 style={{ color: "#ef4444", margin: "0 0 10px 0" }}>
							🩸 Paper Hands Penalty
						</h4>
						<p style={{ fontSize: "13px", color: "#fca5a5" }}>
							If you sell: lose 5% of your points every 15 mins. Protect your
							rank!
						</p>
					</div>
				</div>
			</div>

			{/* 4. NATIVE TASKS (RIpristinate!) */}
			<h3 style={{ color: "#f472b6", marginBottom: "5px" }}>
				🪂 Earn Extra Points
			</h3>
			<div
				style={{
					display: "grid",
					gridTemplateColumns:
						"repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
					gap: "20px",
					marginBottom: "40px",
				}}
			>
				{offers.map((off, i) => (
					<div
						key={i}
						style={{
							background: "#111",
							border: "1px solid #333",
							padding: "20px",
							borderRadius: "12px",
						}}
					>
						<div style={{ fontWeight: "bold", marginBottom: "10px" }}>
							{off.title}
						</div>
						<a
							href={off.link}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								background: "#f472b6",
								color: "#111",
								padding: "8px 16px",
								borderRadius: "8px",
								textDecoration: "none",
								fontSize: "14px",
								fontWeight: "bold",
								display: "inline-block",
							}}
						>
							Complete Task (+250 Pts) →
						</a>
					</div>
				))}
			</div>

			{/* 5. LEADERBOARD */}
			<div
				style={{
					background: "#111",
					border: "1px solid #333",
					padding: "25px",
					boxSizing: "border-box",
					borderRadius: "16px",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "15px",
					}}
				>
					<h3 style={{ color: "#facc15", margin: 0 }}>🏆 Top 100 Farmers</h3>
					<span
						style={{
							fontSize: "11px",
							color: "#94a3b8",
							background: "rgba(255,255,255,0.05)",
							padding: "5px 10px",
							borderRadius: "20px",
							border: "1px solid #333",
						}}
					>
						Reset: 1st & 15th of month
					</span>
				</div>
				<div style={{ maxHeight: "400px", overflowY: "auto" }}>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr
								style={{
									color: "#666",
									textAlign: "left",
									fontSize: "12px",
									borderBottom: "1px solid #222",
								}}
							>
								<th style={{ padding: "10px" }}>RANK</th>
								<th style={{ padding: "10px" }}>WALLET</th>
								<th style={{ padding: "10px", textAlign: "right" }}>POINTS</th>
							</tr>
						</thead>
						<tbody>
							{leaderboard.map((u, i) => {
								const isMe = address?.toLowerCase() === u.address.toLowerCase();
								return (
									<tr
										key={i}
										style={{
											borderBottom: "1px solid #222",
											background: isMe
												? "rgba(250, 204, 21, 0.2)"
												: "transparent",
											borderLeft: isMe ? "4px solid #facc15" : "none",
										}}
									>
										<td
											style={{
												padding: "10px",
												color: i < 3 ? "#facc15" : "#fff",
											}}
										>
											#{i + 1}
										</td>
										<td
											style={{
												padding: "10px",
												fontSize: "12px",
												fontFamily: "monospace",
											}}
										>
											{u.address.slice(0, 6)}...{u.address.slice(-4)}
											{u.address.toLowerCase().startsWith("0xaff5") &&
												u.address.toLowerCase().endsWith("04e7") && (
													<span
														style={{
															marginLeft: "6px",
															fontSize: "10px",
															background: "rgba(168,85,247,0.15)",
															color: "#a855f7",
															padding: "2px 6px",
															borderRadius: "4px",
															border: "1px solid rgba(168,85,247,0.35)",
														}}
													>
														Treasury
													</span>
												)}
										</td>
										<td
											style={{
												padding: "10px",
												textAlign: "right",
												fontWeight: "bold",
											}}
										>
											{Math.round(u.points).toLocaleString("en-US")}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
