"use client";

import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { ChevronDown, Copy, ExternalLink, LoaderCircle, RefreshCw, Settings2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import {
	ARB_INC_ADDRESS,
	DEFAULT_SLIPPAGE_BPS,
	DEFAULT_SWAP_TOKENS,
	FEE_BPS,
	FEE_RECEIVER,
	MAX_SLIPPAGE_BPS,
	NATIVE_ADDRESS,
	TAX_TOKEN_MIN_SLIPPAGE_BPS,
	getTaxTokenInfo,
	isNativeAddress,
	type SwapToken,
} from "../../lib/swap/constants";

const ERC20_ABI = [
	"function allowance(address owner,address spender) view returns (uint256)",
	"function approve(address spender,uint256 amount) returns (bool)",
];

const GlobalStyle = createGlobalStyle`
	body { background: #071014; margin: 0; }
	* { box-sizing: border-box; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.spin { animation: spin .9s linear infinite; }
`;

const Page = styled.main`
	min-height: 100vh;
	padding: 96px 24px 24px 284px;
	background: radial-gradient(circle at 72% 10%, rgba(29, 151, 146, .16), transparent 34%), #071014;
	color: #effcf9;
	@media (max-width: 1024px) { padding: 84px 16px 24px; }
`;
const Shell = styled.div`max-width: 1120px; margin: 0 auto;`;
const Intro = styled.div`display: flex; justify-content: space-between; gap: 24px; align-items: end; margin-bottom: 28px; @media (max-width: 680px) { display: block; }`;
const Eyebrow = styled.div`color: #70e1ce; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 10px;`;
const Title = styled.h1`font-size: clamp(30px, 5vw, 54px); line-height: 1; letter-spacing: -.04em; margin: 0 0 12px; max-width: 650px;`;
const Lead = styled.p`color: #a9bfbd; margin: 0; max-width: 610px; line-height: 1.6; font-size: 15px;`;
const Status = styled.div`color: #9bb5b1; font-size: 13px; text-align: right; @media (max-width: 680px) { margin-top: 18px; text-align: left; }`;
const Layout = styled.div`display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 330px); gap: 18px; align-items: start; @media (max-width: 820px) { grid-template-columns: 1fr; }`;
const Card = styled.section`background: rgba(13, 29, 32, .88); border: 1px solid rgba(143, 219, 207, .16); border-radius: 22px; box-shadow: 0 24px 70px rgba(0,0,0,.24);`;
const SwapCard = styled(Card)`padding: 14px;`;
const Panel = styled(Card)`padding: 22px;`;
const TokenRow = styled.div`display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 17px; background: #102326; border: 1px solid rgba(153, 224, 211, .12); border-radius: 16px;`;
const RowLabel = styled.div`color: #87a6a2; font-size: 12px; margin-bottom: 8px;`;
const Amount = styled.input`display: block; min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: #f2fffc; font: 600 27px/1.1 inherit; &::placeholder { color: #45635f; }`;
const TokenButton = styled.button`display: flex; align-items: center; gap: 8px; white-space: nowrap; border: 1px solid rgba(141, 221, 207, .22); border-radius: 12px; padding: 9px 11px; color: #effcf9; background: #183538; font-weight: 750; cursor: pointer;`;
const TokenIcon = styled.img`width: 25px; height: 25px; border-radius: 50%; object-fit: cover;`;
const FlipButton = styled.button`display: grid; place-items: center; width: 38px; height: 38px; margin: -6px auto; position: relative; z-index: 1; border: 4px solid #0d1d20; border-radius: 50%; background: #70e1ce; color: #092023; cursor: pointer;`;
const Primary = styled.button`width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 14px; border: 0; border-radius: 14px; background: #70e1ce; color: #092023; font-size: 16px; font-weight: 850; cursor: pointer; &:disabled { opacity: .45; cursor: not-allowed; }`;
const Secondary = styled.button`display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(143, 219, 207, .2); border-radius: 10px; background: transparent; color: #c5dfdb; padding: 9px 12px; cursor: pointer;`;
const Notice = styled.div<{ $warning?: boolean }>`margin-top: 13px; padding: 12px 13px; border-radius: 12px; color: ${({ $warning }) => $warning ? "#f8d58b" : "#a9bfbd"}; background: ${({ $warning }) => $warning ? "rgba(194, 137, 47, .12)" : "rgba(143, 219, 207, .06)"}; border: 1px solid ${({ $warning }) => $warning ? "rgba(248, 213, 139, .2)" : "rgba(143, 219, 207, .1)"}; font-size: 12px; line-height: 1.5;`;
const Meta = styled.div`display: grid; gap: 12px; margin-top: 17px; padding-top: 16px; border-top: 1px solid rgba(143, 219, 207, .1);`;
const MetaLine = styled.div`display: flex; justify-content: space-between; gap: 12px; color: #88a4a0; font-size: 13px; span:last-child { color: #e7f7f3; text-align: right; }`;
const SelectBox = styled.div`position: relative; margin-top: 16px;`;
const Select = styled.select`appearance: none; width: 100%; background: #102326; color: #effcf9; border: 1px solid rgba(143, 219, 207, .16); border-radius: 12px; padding: 11px 36px 11px 12px; font: inherit;`;
const IconRight = styled.div`position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #86aaa4;`;
const WalletButton = styled.button`display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 11px; padding: 10px 14px; background: #70e1ce; color: #092023; font-weight: 800; cursor: pointer;`;

const formatUnits = (raw: string | undefined, decimals: number) => {
	if (!raw) return "-";
	try { return Number(ethers.utils.formatUnits(raw, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 }); } catch { return "-"; }
};

export default function BetaSwapClient() {
	const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
	const [tokenIn, setTokenIn] = useState<SwapToken>(DEFAULT_SWAP_TOKENS[0]);
	const [tokenOut, setTokenOut] = useState<SwapToken>(DEFAULT_SWAP_TOKENS[1]);
	const [amountIn, setAmountIn] = useState("");
	const [quote, setQuote] = useState<any>(null);
	const [loadingQuote, setLoadingQuote] = useState(false);
	const [sending, setSending] = useState(false);
	const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_BPS);
	const [error, setError] = useState("");
	const [txHash, setTxHash] = useState("");
	const [approvalRequired, setApprovalRequired] = useState(false);
	const [checkingApproval, setCheckingApproval] = useState(false);
	const walletAddress = wallet?.accounts?.[0]?.address || "";
	const taxInfo = getTaxTokenInfo(tokenIn.address) || getTaxTokenInfo(tokenOut.address);
	const effectiveSlippage = taxInfo ? Math.max(slippage, TAX_TOKEN_MIN_SLIPPAGE_BPS) : slippage;
	const sameToken = tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase();

	useEffect(() => {
		if (!wallet || !quote || isNativeAddress(tokenIn.address)) {
			setApprovalRequired(false);
			setCheckingApproval(false);
			return;
		}
		let cancelled = false;
		const checkAllowance = async () => {
			try {
				setCheckingApproval(true);
				const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
				const token = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
				const allowance = await token.allowance(walletAddress, quote.routerAddress);
				if (!cancelled) setApprovalRequired(allowance.lt(quote.amountIn));
			} catch {
				if (!cancelled) setApprovalRequired(true);
			} finally {
				if (!cancelled) setCheckingApproval(false);
			}
		};
		void checkAllowance();
		return () => { cancelled = true; };
	}, [quote, tokenIn.address, wallet, walletAddress]);

	useEffect(() => {
		setQuote(null);
		setError("");
		if (!walletAddress || !amountIn || sameToken) return;
		let cancelled = false;
		const timer = window.setTimeout(async () => {
			try {
				setLoadingQuote(true);
				const rawAmount = ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString();
				const params = new URLSearchParams({
					tokenIn: tokenIn.address, tokenOut: tokenOut.address, amountIn: rawAmount,
					sender: walletAddress, recipient: walletAddress, slippageTolerance: String(effectiveSlippage),
					gasInclude: "true", feeAmount: String(FEE_BPS), chargeFeeBy: "currency_out", isInBps: "true",
					feeReceiver: FEE_RECEIVER,
				});
				const response = await fetch(`/api/kyber/swap?${params}`);
				const body = await response.json();
				if (!response.ok || body.code !== 0) throw new Error(body.message || body.error || "Quote unavailable");
				if (!body.data || !ethers.utils.isAddress(body.data.routerAddress) || typeof body.data.data !== "string" || !body.data.data.startsWith("0x")) {
					throw new Error("Kyber returned an invalid transaction route");
				}
				if (!cancelled) setQuote(body.data);
			} catch (caught) {
				if (!cancelled) setError(caught instanceof Error ? caught.message : "Quote unavailable");
			} finally { if (!cancelled) setLoadingQuote(false); }
		}, 450);
		return () => { cancelled = true; window.clearTimeout(timer); };
	}, [amountIn, effectiveSlippage, sameToken, tokenIn, tokenOut, walletAddress]);

	const flip = () => { const previous = tokenIn; setTokenIn(tokenOut); setTokenOut(previous); setAmountIn(""); setQuote(null); };
	const chooseToken = (side: "in" | "out", address: string) => {
		const token = DEFAULT_SWAP_TOKENS.find((item) => item.address === address);
		if (!token) return;
		if (side === "in") setTokenIn(token); else setTokenOut(token);
		setQuote(null); setAmountIn("");
	};

	const sendSwap = async () => {
		if (!wallet || !quote || !walletAddress) return;
		setSending(true); setError(""); setTxHash("");
		try {
			const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
			const signer = provider.getSigner();
			if (!ethers.utils.isAddress(quote.routerAddress) || !/^0x[0-9a-fA-F]*$/.test(quote.data)) throw new Error("Invalid Kyber transaction data");
			if (!isNativeAddress(tokenIn.address)) {
				const token = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
				const allowance = await token.allowance(walletAddress, quote.routerAddress);
				if (allowance.lt(quote.amountIn)) {
					const approval = await token.approve(quote.routerAddress, quote.amountIn);
					await approval.wait();
					const refreshedAllowance = await token.allowance(walletAddress, quote.routerAddress);
					setApprovalRequired(refreshedAllowance.lt(quote.amountIn));
					if (refreshedAllowance.lt(quote.amountIn)) throw new Error("Approval was not confirmed by the token contract");
				}
			}
			const tx = await signer.sendTransaction({
				to: quote.routerAddress,
				data: quote.data,
				value: quote.transactionValue || "0",
			});
			setTxHash(tx.hash);
			await tx.wait();
			const referrer = window.localStorage.getItem("arb_inc_referrer") || "";
			await fetch("/api/dex-reward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userWallet: walletAddress, type: "swap", txHash: tx.hash, referrerWallet: referrer }) });
		} catch (caught) { setError(caught instanceof Error ? caught.message : "Swap failed"); }
		finally { setSending(false); }
	};

	const walletSection = wallet ? <WalletButton onClick={() => disconnect(wallet)}><Wallet size={16} />{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</WalletButton> : <WalletButton onClick={() => connect()}><Wallet size={16} />{connecting ? "Connecting..." : "Connect wallet"}</WalletButton>;
	const amountOut = formatUnits(quote?.amountOut, tokenOut.decimals);
	const minimumReceived = quote?.amountOut ? `${amountOut} ${tokenOut.symbol}` : "-";

	return <>
		<GlobalStyle />
		<Page><Header activePage="/swap-all" walletSection={walletSection} /><Shell>
			<Intro><div><Eyebrow>KyberSwap Aggregator API v1 Beta</Eyebrow><Title>Swap with clarity.</Title><Lead>Official whitelisted KyberSwap partner access now powers our Super Swap, routing native BNB and BEP-20 tokens with wallet-controlled approvals.</Lead></div><Status>{loadingQuote ? "Finding the best route..." : quote ? "Route ready" : "BSC liquidity"}</Status></Intro>
			<Layout><SwapCard>
				<TokenRow><div><RowLabel>You pay</RowLabel><Amount inputMode="decimal" placeholder="0.0" value={amountIn} onChange={(event) => setAmountIn(event.target.value.replace(/[^0-9.]/g, ""))} /></div><div><RowLabel>Asset</RowLabel><TokenButton type="button" onClick={() => document.getElementById("token-in")?.focus()}><TokenIcon src={tokenIn.logoUrl} alt="" />{tokenIn.symbol}<ChevronDown size={16} /></TokenButton></div></TokenRow>
				<FlipButton type="button" aria-label="Invert swap direction" onClick={flip}><RefreshCw size={16} /></FlipButton>
				<TokenRow><div><RowLabel>You receive</RowLabel><Amount readOnly placeholder={loadingQuote ? "..." : "0.0"} value={amountOut === "-" ? "" : amountOut} /></div><div><RowLabel>Asset</RowLabel><TokenButton type="button" onClick={() => document.getElementById("token-out")?.focus()}><TokenIcon src={tokenOut.logoUrl} alt="" />{tokenOut.symbol}<ChevronDown size={16} /></TokenButton></div></TokenRow>
				<SelectBox><Select id="token-in" aria-label="Pay token" value={tokenIn.address} onChange={(event) => chooseToken("in", event.target.value)}>{DEFAULT_SWAP_TOKENS.map((token) => <option key={token.address} value={token.address}>{token.symbol} · {token.decimals} decimals</option>)}</Select><IconRight><ChevronDown size={17} /></IconRight></SelectBox>
				<SelectBox><Select id="token-out" aria-label="Receive token" value={tokenOut.address} onChange={(event) => chooseToken("out", event.target.value)}>{DEFAULT_SWAP_TOKENS.map((token) => <option key={token.address} value={token.address}>{token.symbol} · {token.decimals} decimals</option>)}</Select><IconRight><ChevronDown size={17} /></IconRight></SelectBox>
				{taxInfo && <Notice $warning>{taxInfo.label} Slippage is protected at {effectiveSlippage / 100}% or higher so the quote has room for the token transfer.</Notice>}
				{error && <Notice $warning>{error}</Notice>}
				<Primary type="button" disabled={!wallet || !quote || loadingQuote || sending || checkingApproval || sameToken} onClick={sendSwap}>{sending ? <><LoaderCircle size={18} className="spin" />Confirming in wallet...</> : !wallet ? "Connect wallet to swap" : loadingQuote ? "Fetching route..." : checkingApproval ? "Checking approval..." : approvalRequired ? `Approve and swap ${tokenIn.symbol}` : quote ? `Swap ${tokenIn.symbol} for ${tokenOut.symbol}` : "Enter an amount"}</Primary>
				{txHash && <Notice>Swap submitted. <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">View on BscScan <ExternalLink size={12} /></a></Notice>}
			</SwapCard><div><Panel><Eyebrow><Settings2 size={13} style={{ verticalAlign: "-2px" }} /> Trade settings</Eyebrow><RowLabel>Maximum slippage</RowLabel><Select value={String(slippage)} onChange={(event) => setSlippage(Math.min(MAX_SLIPPAGE_BPS, Number(event.target.value)))}><option value="50">0.5%</option><option value="100">1%</option><option value="300">3%</option><option value="800">8%</option><option value="1200">12%</option></Select><Notice>Slippage is applied automatically. ARB INC quotes use an 8% minimum to account for its 4% transfer tax; other tokens use the selected setting.</Notice><Meta><MetaLine><span>Estimated receive</span><span>{minimumReceived}</span></MetaLine><MetaLine><span>Platform fee</span><span>{FEE_BPS / 100}%</span></MetaLine><MetaLine><span>Network</span><span>BNB Smart Chain</span></MetaLine><MetaLine><span>Router</span><span>{quote?.routerAddress ? `${quote.routerAddress.slice(0, 6)}...${quote.routerAddress.slice(-4)}` : "KyberSwap"}</span></MetaLine></Meta><Notice>Quotes are exact-input. Your wallet approves only the selected token and sends the transaction directly to KyberSwap.</Notice></Panel><Panel style={{ marginTop: 18 }}><Eyebrow>Token safety</Eyebrow><p style={{ color: "#a9bfbd", fontSize: 13, lineHeight: 1.6, margin: "10px 0 0" }}>ARB INC is handled with its verified 9-decimal metadata. Native BNB uses Kyber's native-token address and transaction value.</p><Secondary style={{ marginTop: 15 }} onClick={() => navigator.clipboard.writeText(ARB_INC_ADDRESS)}><Copy size={14} /> Copy ARB INC address</Secondary></Panel></div></Layout>
		</Shell><Footer /></Page>
	</>;
}
