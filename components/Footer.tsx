"use client";
import React from "react";
import { FaGithub, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  padding: 3rem 2rem 1.5rem;
  background: #030014;
  border-top: 1px solid rgba(139, 92, 246, 0.1);
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 1000px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const SocialIcon = styled.a`
  color: #94a3b8;
  font-size: 1.5rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  &:hover {
    color: #a855f7;
    background: rgba(168, 85, 247, 0.1);
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
  }
`;

const CommunityLink = styled.a`
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  &:hover {
    color: #a855f7;
    background: rgba(255, 255, 255, 0.03);
  }
`;

const DisclaimerBox = styled.div`
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  text-align: justify;
  font-size: 0.85rem;
  strong { color: #a855f7; font-weight: 600; }
  @media (max-width: 768px) { padding: 1rem; font-size: 0.75rem; }
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.2rem;
  font-size: 0.8rem;
  a {
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: #a855f7; }
  }
`;

const Copyright = styled.div`
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.7;
`;

export default function Footer() {
	return (
		<FooterContainer>
			<TopSection>
				<SocialLinks>
					<SocialIcon
						href="https://t.me/ArbitrageInception"
						aria-label="Telegram Community"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaTelegramPlane />
					</SocialIcon>
					<SocialIcon
						href="https://x.com/Arbitrageincept"
						aria-label="Follow on X"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaTwitter />
					</SocialIcon>
					<SocialIcon
						href="https://github.com/arbincept/Arb-Inc-All-in-Dex"
						aria-label="Open Source on GitHub (MIT)"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaGithub />
					</SocialIcon>
				</SocialLinks>

				<CommunityLink
					href="https://t.me/ArbitrageInception"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaTelegramPlane /> Community Support
				</CommunityLink>
			</TopSection>

			<DisclaimerBox>
				<strong>Risk Disclaimer &amp; Terms of Use:</strong> Arbitrage Inception
				is a permissionless, open-source decentralized application (dApp) that
				acts as an interface to interact with third-party smart contracts
				(KyberSwap, Mayan Finance, PancakeSwap, Limit Orders protocols). No
				individual or entity custodies funds or manages underlying liquidity
				pools. Trading digital assets involves significant risk, including
				possible loss of all invested funds. Smart contracts may contain
				vulnerabilities. By using this interface you acknowledge doing so
				entirely at your own risk. No liability is assumed for losses, hacks,
				slippage, or network failures.
				<br />
				<br />
				<strong>Tax Token Notice:</strong> When trading $ARB INC or other tax
				tokens, set slippage correctly (e.g. <strong>8%</strong>) to account for
				tokenomics and prevent transaction failures. Always DYOR before
				interacting with any decentralized protocol.
				<br />
				<br />
				<strong>MiCA Notice (Reg. EU 2023/1114 & D.Lgs. 129/2024):</strong> This interface is not
				a Crypto-Asset Service Provider (CASP), broker, or regulated financial
				entity. It is permissionless open-source software. Use is at the
				user&apos;s sole risk and responsibility.
			</DisclaimerBox>

			<LegalLinks>
				<a href="/terms-of-service">Terms of Service</a>
          <a href="/privacy-policy">
            Privacy Policy</a>
				<a href="/cookie-policy">Cookie Policy</a>
				<a
					href="https://github.com/arbincept/Arb-Inc-All-in-Dex/blob/main/LICENSE"
					target="_blank"
					rel="noopener noreferrer"
				>
					MIT License
				</a>
			</LegalLinks>

			<Copyright>
				© {new Date().getFullYear()} Arbitrage Inception Contributors —{" "}
				<a
					href="https://github.com/arbincept/Arb-Inc-All-in-Dex/blob/main/LICENSE"
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: "#a855f7" }}
				>
					MIT License
				</a>
			</Copyright>
			<p
				style={{
					fontSize: "0.7rem",
					opacity: 0.6,
					marginTop: "1rem",
					textAlign: "center",
				}}
			>
				Protocol metrics are informational and are not guaranteed returns. This
				interface uses no analytics or behavioral profiling; hosting providers may
				process technical request logs for security and delivery.
			</p>
		</FooterContainer>
	);
}
