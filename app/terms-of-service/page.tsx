"use client";

import styled, { createGlobalStyle } from "styled-components";
import theme from "../styles/theme";

const GlobalStyle = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${theme.typography.fontFamily}; background: ${theme.colors.background.primary}; color: #FFFFFF; min-height: 100vh; }
`;
const Container = styled.div`min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px 15px;@media(min-width:769px){padding:40px 20px;}`;
const PageHeader = styled.header`width:100%;max-width:1200px;display:flex;justify-content:space-between;align-items:center;padding:15px 0;flex-wrap:wrap;gap:10px;border-bottom:1px solid ${theme.colors.border.DEFAULT};`;
const LogoSection = styled.div`display:flex;align-items:center;gap:12px;`;
const Logo = styled.img`width:40px;height:40px;border-radius:${theme.borderRadius.full};box-shadow:${theme.shadows.glow};`;
const SiteTitle = styled.h1`font-size:18px;font-weight:700;background:${theme.colors.primary.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;`;
const Nav = styled.nav`display:flex;gap:12px;background:${theme.colors.glass.medium};padding:10px 20px;border-radius:50px;border:1px solid ${theme.colors.border.DEFAULT};@media(max-width:768px){gap:8px;padding:8px 16px;}`;
const NavLink = styled.a`color:${theme.colors.text.secondary};text-decoration:none;font-weight:500;font-size:14px;padding:8px 16px;border-radius:20px;transition:${theme.transitions.fast};&:hover{color:${theme.colors.text.primary};background:${theme.colors.glass.heavy};}`;
const MainContent = styled.main`
  flex:1;width:100%;max-width:800px;padding:40px 20px;color:#ffffff;line-height:1.8;font-family:sans-serif;
  h1{color:#f3ba2f;font-size:2rem;margin-bottom:10px;}
  h2{color:#f3ba2f;font-size:1.4rem;margin-top:30px;margin-bottom:15px;}
  p{margin-bottom:15px;color:#e0e0e0;}
  ul{padding-left:20px;margin-bottom:15px;}
  li{margin-bottom:8px;color:#e0e0e0;}
  .last-updated{color:#888;font-size:0.9rem;margin-bottom:30px;}
  a{color:#28E0B9;}
`;
const PageFooter = styled.footer`width:100%;max-width:1200px;padding:40px 0;text-align:center;color:${theme.colors.text.muted};font-size:14px;`;
const FooterLinks = styled.div`display:flex;justify-content:center;gap:20px;margin-bottom:15px;flex-wrap:wrap;a{color:${theme.colors.accent.DEFAULT};text-decoration:none;&:hover{text-decoration:underline;}}`;
const Disclaimer = styled.div`max-width:600px;margin:0 auto 20px;padding:15px;background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.3);border-radius:8px;color:#FF9901;font-size:12px;line-height:1.5;`;

export default function TermsOfServicePage() {
	return (
		<>
			<GlobalStyle />
			<Container>
				<PageHeader>
					<LogoSection>
						<Logo src="/logo.jpg" alt="Arbitrage Inception" />
						<SiteTitle>Arbitrage Inception</SiteTitle>
					</LogoSection>
					<Nav>
						<NavLink href="/">Home</NavLink>
						<NavLink href="/swap-all">Swap</NavLink>

						<NavLink href="/bridge">Bridge</NavLink>
						<NavLink href="/limit-orders">Limit Orders</NavLink>
						<NavLink href="/rewards">Rewards</NavLink>
						<NavLink href="/contact">Contact</NavLink>
					</Nav>
				</PageHeader>

				<MainContent>
					<h1>Terms of Service</h1>
					<p className="last-updated">Last Updated: July 1, 2026</p>

					<h2>1. Acceptance of Terms</h2>
					<p>
						By accessing or using the Arbitrage Inception Interface
						(https://arbitrage-inc.exchange), you agree to be bound by these
						Terms of Service. If you do not agree, do not access or use the
						Interface. This interface is provided as an open-source software client
						under the MIT License for self-custodial, peer-to-peer interaction with
						public decentralized blockchain protocols.
					</p>

					<h2>2. Nature of the Service</h2>
					<p>
						Arbitrage Inception is a{" "}
						<strong>permissionless, open-source frontend interface</strong> (MIT
						License) that enables users to interact with decentralized liquidity
						protocols on BNB Smart Chain, including KyberSwap, Mayan Finance,
						and PancakeSwap. The full source code is publicly available at{" "}
						<a
							href="https://github.com/arbincept/Arb-Inc-All-in-Dex"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</a>
						.
					</p>
					<p>
						<strong>This project is NOT:</strong>
					</p>
					<ul>
						<li>
							A Crypto-Asset Service Provider (CASP) under Regulation (EU) 2023/1114 (MiCA) or Italian D.Lgs. 129/2024
						</li>
						<li>A cryptocurrency exchange, custodian, broker, or financial institution</li>
						<li>
							An investment service under D.Lgs. 58/1998 (TUF — Italian
							Financial Act)
						</li>
						<li>
							An entity registered with Banca d&apos;Italia, CONSOB, or any
							financial regulator
						</li>
						<li>A payment service provider under D.Lgs. 11/2010 (PSD2)</li>
					</ul>
					<p>
						No individual or entity behind this project custodies, holds, or
						controls user trading funds. Trading transactions are signed by the
						user&apos;s wallet and sent to third-party on-chain protocols. The hosted
						rewards service is a separate operational component and may process
						points, balances and optional claim requests.
					</p>

					<h2>3. Decentralized Architecture & Open-Source Contributors</h2>
					<p>
						Arbitrage Inception is an open-source interface combining on-chain
						third-party protocols with hosted operational services. The ARB INC
						contract disclosures state that ownership is renounced and that no mint,
						blacklist, pause or tax-parameter administration is available after
						deployment; users should verify the deployed contract independently.
					</p>
					<p>
						The frontend client interface is developed, maintained, and published as free, open-source
						software (MIT License) by independent software engineers and researchers. No contributor or
						developer operates a centralized custodial exchange, provides investment advice, or acts as a financial counterparty.
					</p>

					<h2>3.1 Community Rewards, Referral Points & Regulatory Exclusion</h2>
					<p>
						The Platform features an optional community-points and referral mechanism.
						Points and leaderboard scores are non-monetary software metrics maintained
						through hosted infrastructure. Where eligibility and reserves permit, a
						user may request a native BNB claim. Claims may be signed and broadcast by
						an operational rewards service and are not automatic, guaranteed or held
						in custody for users.
					</p>
					<p>
						Users sharing referral links act solely as participants sharing an
						open-source web-interface hyperlink. Referral attribution may affect
						internal points under the published rules; it is not a commission,
						dividend, security, guaranteed income or commercial representation.
					</p>
					<p>
						MiCA and other financial-services rules may apply differently depending on
						jurisdiction, service and facts. This project does not provide a legal
						classification or claim an exemption. Users must determine whether the
						interface and token are available and lawful for them and must not use the
						interface where authorization or other legal requirements are not met.
					</p>

					<h2>4. Eligibility</h2>
					<p>To use the Platform, you must:</p>
					<ul>
						<li>Be at least 18 years of age</li>
						<li>Not reside in or be a national of any sanctioned country</li>
						<li>Not appear on any government sanctions list</li>
						<li>Have the legal capacity to accept these Terms</li>
						<li>
							Comply with applicable laws in your country of residence,
							including cryptocurrency regulations
						</li>
					</ul>

					<h2>5. Financial Risk Disclaimer</h2>
					<p>
						<strong>
							CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS AND IS
							NOT SUITABLE FOR EVERY USER.
						</strong>
					</p>
					<ul>
						<li>
							Cryptocurrency markets are highly volatile and unpredictable
						</li>
						<li>You may lose all of your invested capital</li>
						<li>Past performance is not indicative of future results</li>
						<li>Smart contracts may contain bugs or vulnerabilities</li>
						<li>
							Any displayed protocol metric is informational and is not a user
							return, APR, payout rate or claim quote
						</li>
						<li>
							No party associated with this project is liable for any financial
							losses
						</li>
						<li>
							Consult a qualified financial advisor before making investment
							decisions
						</li>
					</ul>

					<h2>6. User Responsibilities</h2>
					<p>You are solely responsible for:</p>
					<ul>
						<li>The security of your wallet and private keys</li>
						<li>Verifying all transaction details before confirmation</li>
						<li>
							Complying with applicable tax laws, including cryptocurrency
							taxation in your jurisdiction (e.g., Italian L. 197/2022 for
							Italian users)
						</li>
						<li>Understanding the risks of decentralized finance (DeFi)</li>
						<li>Any losses resulting from your use of the Platform</li>
					</ul>

					<h2>7. Prohibited Activities</h2>
					<p>You agree not to:</p>
					<ul>
						<li>
							Use the Platform for illegal purposes, including money laundering
							(D.Lgs. 231/2007 for Italian users)
						</li>
						<li>Attempt to manipulate or exploit the Platform</li>
						<li>Interfere with the proper functioning of the Platform</li>
						<li>
							Attempt to gain unauthorized access to any part of the Platform
						</li>
						<li>Use automated systems or bots without explicit permission</li>
					</ul>

					<h2>8. Third-Party Services</h2>
					<p>
						The Platform integrates with third-party services including
						KyberSwap Protocol, Mayan Finance, wallet providers, and blockchain
						networks. No responsibility is assumed for the availability,
						accuracy, or practices of these third-party services.
					</p>

					<h2>9. Open Source License</h2>
					<p>
						The source code of this interface is released under the{" "}
						<a
							href="https://github.com/arbincept/Arb-Inc-All-in-Dex/blob/main/LICENSE"
							target="_blank"
							rel="noopener noreferrer"
						>
							MIT License
						</a>
						. Anyone may view, copy, modify, and distribute the code in
						compliance with the MIT License terms.
					</p>

					<h2>10. Limitation of Liability</h2>
					<p>
						TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE ARBITRAGE
						INCEPTION CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
						INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
						LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM USE OF THE
						PLATFORM. Italian consumer protections under D.Lgs. 206/2005 remain
						applicable and unaffected where mandated.
					</p>

					<h2>11. Changes to Terms</h2>
					<p>
						These Terms may be modified at any time. Significant changes will be
						announced via the GitHub repository with at least 30 days notice.
						Continued use of the Platform after changes constitutes acceptance
						of the updated Terms.
					</p>

					<h2>12. Governing Law and Jurisdiction</h2>
					<p>
						These Terms are governed by <strong>Italian law</strong>. For
						consumers residing in Italy, the competent court is the court of the
						consumer&apos;s place of residence or elected domicile, pursuant to
						art. 33 of D.Lgs. 206/2005 (Codice del Consumo) and art. 18 of Reg.
						EU 1215/2012. For non-consumer disputes, the exclusive forum is
						Milan, Italy.
					</p>
					<p>
						EU residents may access the European Commission ODR platform:{" "}
						<a
							href="https://ec.europa.eu/consumers/odr"
							target="_blank"
							rel="noopener noreferrer"
						>
							https://ec.europa.eu/consumers/odr
						</a>
					</p>

					<h2>13. Contact</h2>
					<p>
						For questions about these Terms, visit our{" "}
						<a href="/contact">Contact page</a> or join the{" "}
						<a
							href="https://t.me/ArbitrageInception"
							target="_blank"
							rel="noopener noreferrer"
						>
							Telegram community
						</a>
						.
					</p>
				</MainContent>

				<PageFooter>
					<FooterLinks>
						<a href="/privacy-policy">Privacy Policy</a>
						<a href="/terms-of-service">Terms of Service</a>
						<a href="/cookie-policy">Cookie Policy</a>
						<a href="/contact">Contact</a>
					</FooterLinks>
					<Disclaimer>
						<strong>⚠️ Risk Disclaimer:</strong> Cryptocurrency trading involves
						high risk. Arbitrage Inception is an open-source frontend interface
						(MIT License). No party is responsible for financial losses. Trade
						responsibly.
					</Disclaimer>
					<p>
						© {new Date().getFullYear()} Arbitrage Inception Contributors — MIT
						License
					</p>
				</PageFooter>
			</Container>
		</>
	);
}
