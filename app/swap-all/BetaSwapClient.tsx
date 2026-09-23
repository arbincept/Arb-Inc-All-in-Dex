"use client";

import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  TAX_TOKEN_MIN_SLIPPAGE_BPS,
  getTaxTokenInfo,
  isNativeAddress,
  type SwapToken,
} from "../../lib/swap/constants";

const ERC20_ABI = [
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
];
const GlobalStyle = createGlobalStyle`body{background:#071014;margin:0}*{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin .9s linear infinite}`;
const Page = styled.main`
  min-height: 100vh;
  padding: 96px 24px 24px 284px;
  background:
    radial-gradient(
      circle at 72% 10%,
      rgba(29, 151, 146, 0.16),
      transparent 34%
    ),
    #071014;
  color: #effcf9;
  @media (max-width: 1024px) {
    padding: 84px 16px 24px;
  }
`;
const Shell = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;
const Intro = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  margin-bottom: 28px;
  @media (max-width: 680px) {
    display: block;
  }
`;
const Eyebrow = styled.div`
  color: #70e1ce;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
`;
const Title = styled.h1`
  font-size: clamp(30px, 5vw, 54px);
  line-height: 1;
  letter-spacing: -0.04em;
  margin: 0 0 12px;
  max-width: 650px;
`;
const Lead = styled.p`
  color: #a9bfbd;
  margin: 0;
  max-width: 610px;
  line-height: 1.6;
  font-size: 15px;
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: 18px;
  align-items: start;
  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.section`
  background: rgba(13, 29, 32, 0.9);
  border: 1px solid rgba(143, 219, 207, 0.16);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
`;
const SwapCard = styled(Card)`
  padding: 14px;
`;
const Panel = styled(Card)`
  padding: 22px;
`;
const TokenRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 17px;
  background: #102326;
  border: 1px solid rgba(153, 224, 211, 0.12);
  border-radius: 16px;
`;
const RowLabel = styled.div`
  color: #87a6a2;
  font-size: 12px;
  margin-bottom: 8px;
`;
const Amount = styled.input`
  display: block;
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f2fffc;
  font: 600 27px/1.1 inherit;
  &::placeholder {
    color: #45635f;
  }
`;
const Balance = styled.div`
  color: #769591;
  font-size: 12px;
  margin-top: 8px;
  min-height: 16px;
`;
const TokenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  border: 1px solid rgba(141, 221, 207, 0.22);
  border-radius: 12px;
  padding: 9px 11px;
  color: #effcf9;
  background: #183538;
  font-weight: 750;
  cursor: pointer;
`;
const TokenIcon = styled.img`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
`;
const FlipButton = styled.button`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: -6px auto;
  position: relative;
  z-index: 1;
  border: 4px solid #0d1d20;
  border-radius: 50%;
  background: #70e1ce;
  color: #092023;
  cursor: pointer;
`;
const Primary = styled.button`
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 14px;
  border: 0;
  border-radius: 14px;
  background: #70e1ce;
  color: #092023;
  font-size: 16px;
  font-weight: 850;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
const Secondary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(143, 219, 207, 0.2);
  border-radius: 10px;
  background: transparent;
  color: #c5dfdb;
  padding: 9px 12px;
  cursor: pointer;
`;
const Notice = styled.div<{ $warning?: boolean }>`
  margin-top: 13px;
  padding: 12px 13px;
  border-radius: 12px;
  color: ${({ $warning }) => ($warning ? "#f8d58b" : "#a9bfbd")};
  background: ${({ $warning }) => ($warning ? "rgba(194,137,47,.12)" : "rgba(143,219,207,.06)")};
  border: 1px solid
    ${({ $warning }) => ($warning ? "rgba(248,213,139,.2)" : "rgba(143,219,207,.1)")};
  font-size: 12px;
  line-height: 1.5;
`;
const Meta = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 17px;
  padding-top: 16px;
  border-top: 1px solid rgba(143, 219, 207, 0.1);
`;
const MetaLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #88a4a0;
  font-size: 13px;
  span:last-child {
    color: #e7f7f3;
    text-align: right;
  }
`;
const Slippage = styled.select`
  width: 100%;
  background: #102326;
  color: #effcf9;
  border: 1px solid rgba(143, 219, 207, 0.16);
  border-radius: 12px;
  padding: 11px 12px;
  font: inherit;
`;
const PercentRow = styled.div`
  display: flex;
  gap: 7px;
  margin: 10px 0 2px;
`;
const Percent = styled.button`
  flex: 1;
  border: 1px solid rgba(143, 219, 207, 0.16);
  border-radius: 9px;
  background: #122b2e;
  color: #a9c9c4;
  padding: 7px 4px;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    border-color: #70e1ce;
    color: #effcf9;
  }
`;
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(1, 8, 10, 0.78);
`;
const Modal = styled.div`
  width: min(460px, 100%);
  max-height: min(680px, 90vh);
  overflow: auto;
  background: #102326;
  border: 1px solid rgba(143, 219, 207, 0.25);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.5);
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;
const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(143, 219, 207, 0.18);
  border-radius: 9px;
  background: transparent;
  color: #c5dfdb;
  cursor: pointer;
`;
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(143, 219, 207, 0.18);
  border-radius: 10px;
  padding: 0 10px;
  color: #86aaa4;
  input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #effcf9;
    padding: 11px 0;
  }
`;
const TokenOption = styled.button`
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  border: 0;
  border-bottom: 1px solid rgba(143, 219, 207, 0.08);
  background: transparent;
  color: #effcf9;
  text-align: left;
  padding: 12px 4px;
  cursor: pointer;
  &:hover {
    background: rgba(112, 225, 206, 0.08);
  }
`;
const CustomInput = styled.input`
  width: 100%;
  border: 1px solid rgba(143, 219, 207, 0.18);
  border-radius: 10px;
  background: #0b1a1d;
  color: #effcf9;
  padding: 11px;
  margin-top: 9px;
  outline: 0;
`;
const WalletButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 11px;
  padding: 10px 14px;
  background: #70e1ce;
  color: #092023;
  font-weight: 800;
  cursor: pointer;
`;
const formatUnits = (raw: string | undefined, decimals: number) => {
  if (!raw) return "-";
  try {
    return Number(ethers.utils.formatUnits(raw, decimals)).toLocaleString(
      undefined,
      { maximumFractionDigits: 6 },
    );
  } catch {
    return "-";
  }
};
const formatInputUnits = (raw: ethers.BigNumber, decimals: number) =>
  ethers.utils.formatUnits(raw, decimals).replace(/\.0+$|(?<=[.\d])0+$/, "");
const formatUsd = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === "") return "-";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `$${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
    : "-";
};
const formatLivePrice = (
  usdValue: string | number | undefined,
  rawAmount: string | undefined,
  decimals: number,
) => {
  if (usdValue === undefined || !rawAmount) return "-";
  try {
    const usd = Number(usdValue);
    const amount = Number(ethers.utils.formatUnits(rawAmount, decimals));
    if (!Number.isFinite(usd) || !Number.isFinite(amount) || amount <= 0)
      return "-";
    return formatUsd(usd / amount);
  } catch {
    return "-";
  }
};
const shortAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function BetaSwapClient() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [tokenIn, setTokenIn] = useState<SwapToken>(DEFAULT_SWAP_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<SwapToken>(DEFAULT_SWAP_TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [sending, setSending] = useState(false);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_BPS);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [rewardMessage, setRewardMessage] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [picker, setPicker] = useState<"in" | "out" | null>(null);
  const [search, setSearch] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const walletAddress = wallet?.accounts?.[0]?.address || "";
  const taxInfo =
    getTaxTokenInfo(tokenIn.address) || getTaxTokenInfo(tokenOut.address);
  const effectiveSlippage = taxInfo
    ? Math.max(slippage, TAX_TOKEN_MIN_SLIPPAGE_BPS)
    : slippage;
  const sameToken =
    tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase();
  useEffect(() => {
    if (!wallet || !walletAddress) {
      setBalances({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingBalances(true);
      try {
        const provider = new ethers.providers.Web3Provider(
          wallet.provider,
          "any",
        );
        const tokens = [tokenIn, tokenOut].filter(
          (token, index, list) =>
            list.findIndex(
              (item) =>
                item.address.toLowerCase() === token.address.toLowerCase(),
            ) === index,
        );
        const entries = await Promise.all(
          tokens.map(
            async (token) =>
              [
                token.address.toLowerCase(),
                isNativeAddress(token.address)
                  ? (await provider.getBalance(walletAddress)).toString()
                  : (
                      await new ethers.Contract(
                        token.address,
                        ERC20_ABI,
                        provider,
                      ).balanceOf(walletAddress)
                    ).toString(),
              ] as const,
          ),
        );
        if (!cancelled) setBalances(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setBalances({});
      } finally {
        if (!cancelled) setLoadingBalances(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tokenIn, tokenOut, wallet, walletAddress, txHash]);
  useEffect(() => {
    if (!wallet || !quote || isNativeAddress(tokenIn.address)) {
      setApprovalRequired(false);
      setCheckingApproval(false);
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        setCheckingApproval(true);
        const provider = new ethers.providers.Web3Provider(
          wallet.provider,
          "any",
        );
        const allowance = await new ethers.Contract(
          tokenIn.address,
          ERC20_ABI,
          provider,
        ).allowance(walletAddress, quote.routerAddress);
        if (!cancelled) setApprovalRequired(allowance.lt(quote.amountIn));
      } catch {
        if (!cancelled) setApprovalRequired(true);
      } finally {
        if (!cancelled) setCheckingApproval(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [quote, tokenIn.address, wallet, walletAddress]);
  useEffect(() => {
    setQuote(null);
    setError("");
    if (!walletAddress || !amountIn || sameToken) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setLoadingQuote(true);
        const rawAmount = ethers.utils
          .parseUnits(amountIn, tokenIn.decimals)
          .toString();
        const params = new URLSearchParams({
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn: rawAmount,
          sender: walletAddress,
          recipient: walletAddress,
          slippageTolerance: String(effectiveSlippage),
          gasInclude: "true",
          feeAmount: String(FEE_BPS),
          chargeFeeBy: "currency_out",
          isInBps: "true",
          feeReceiver: FEE_RECEIVER,
        });
        const response = await fetch(`/api/kyber/swap?${params}`);
        const body = await response.json();
        if (!response.ok || body.code !== 0)
          throw new Error(body.message || body.error || "Quote unavailable");
        if (
          !body.data ||
          !ethers.utils.isAddress(body.data.routerAddress) ||
          typeof body.data.data !== "string" ||
          !body.data.data.startsWith("0x")
        )
          throw new Error("Kyber returned an invalid transaction route");
        if (!cancelled) setQuote(body.data);
      } catch (caught) {
        if (!cancelled)
          setError(
            caught instanceof Error ? caught.message : "Quote unavailable",
          );
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    amountIn,
    effectiveSlippage,
    sameToken,
    tokenIn,
    tokenOut,
    walletAddress,
  ]);
  const filteredTokens = useMemo(
    () =>
      DEFAULT_SWAP_TOKENS.filter((token) =>
        `${token.symbol} ${token.name} ${token.address}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  const balanceRaw = balances[tokenIn.address.toLowerCase()] || "0";
  const setPercentage = (percentage: number) => {
    try {
      const raw = ethers.BigNumber.from(balanceRaw);
      const amount = raw.mul(Math.round(percentage * 10)).div(1000);
      setAmountIn(
        formatInputUnits(amount, tokenIn.decimals),
      );
    } catch {
      setAmountIn("");
    }
  };
  const chooseToken = (side: "in" | "out", token: SwapToken) => {
    if (side === "in") setTokenIn(token);
    else setTokenOut(token);
    setAmountIn("");
    setQuote(null);
    setPicker(null);
    setSearch("");
  };
  const addCustomToken = async () => {
    try {
      if (!wallet || !ethers.utils.isAddress(customAddress))
        throw new Error("Inserisci un contract address valido");
      const provider = new ethers.providers.Web3Provider(
        wallet.provider,
        "any",
      );
      const contract = new ethers.Contract(customAddress, ERC20_ABI, provider);
      const [symbol, name, decimals] = await Promise.all([
        contract.symbol(),
        contract.name(),
        contract.decimals(),
      ]);
      chooseToken(picker || "in", {
        address: customAddress,
        symbol,
        name,
        decimals: Number(decimals),
        logoUrl: "/logo.jpg",
      });
      setCustomAddress("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Token custom non valido",
      );
    }
  };
  const flip = () => {
    const previous = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(previous);
    setAmountIn("");
    setQuote(null);
  };
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ARB_INC_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Impossibile copiare l'indirizzo");
    }
  };
  const sendSwap = async () => {
    if (!wallet || !quote || !walletAddress) return;
    setSending(true);
    setError("");
    setTxHash("");
    setRewardMessage("");
    setRewardMessage("");
    try {
      const provider = new ethers.providers.Web3Provider(
        wallet.provider,
        "any",
      );
      const signer = provider.getSigner();
      if (
        !ethers.utils.isAddress(quote.routerAddress) ||
        !/^0x[0-9a-fA-F]*$/.test(quote.data)
      )
        throw new Error("Invalid Kyber transaction data");
      if (!isNativeAddress(tokenIn.address)) {
        const token = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
        const allowance = await token.allowance(
          walletAddress,
          quote.routerAddress,
        );
        if (allowance.lt(quote.amountIn)) {
          const approval = await token.approve(
            quote.routerAddress,
            quote.amountIn,
          );
          await approval.wait();
          const refreshed = await token.allowance(
            walletAddress,
            quote.routerAddress,
          );
          setApprovalRequired(refreshed.lt(quote.amountIn));
          if (refreshed.lt(quote.amountIn))
            throw new Error("Approval was not confirmed by the token contract");
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
      const rewardResponse = await fetch("/api/dex-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: walletAddress,
          type: "swap",
          txHash: tx.hash,
          referrerWallet: referrer,
        }),
      });
      const rewardBody = await rewardResponse.json();
      if (!rewardResponse.ok || !rewardBody.success) {
        throw new Error(
          rewardBody.error || "Swap confirmed, but points could not be assigned",
        );
      }
      setRewardMessage("100 points added for this completed swap.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Swap failed");
    } finally {
      setSending(false);
    }
  };
  const walletSection = wallet ? (
    <WalletButton onClick={() => disconnect(wallet)}>
      <Wallet size={16} />
      {shortAddress(walletAddress)}
    </WalletButton>
  ) : (
    <WalletButton onClick={() => connect()}>
      <Wallet size={16} />
      {connecting ? "Connecting..." : "Connect wallet"}
    </WalletButton>
  );
  const amountOut = formatUnits(quote?.amountOut, tokenOut.decimals);
  const routeSummary = quote?.routeSummary;
  const inputUsd = formatUsd(routeSummary?.amountInUsd);
  const outputUsd = formatUsd(routeSummary?.amountOutUsd);
  const inputPrice = formatLivePrice(
    routeSummary?.amountInUsd,
    quote?.amountIn,
    tokenIn.decimals,
  );
  const outputPrice = formatLivePrice(
    routeSummary?.amountOutUsd,
    quote?.amountOut,
    tokenOut.decimals,
  );
  return (
    <>
      <GlobalStyle />
      <Page>
        <Header activePage="/swap-all" walletSection={walletSection} />
        <Shell>
          <Intro>
            <div>
              <Eyebrow>KyberSwap Aggregator API v1 Beta</Eyebrow>
              <Title>Swap with clarity.</Title>
              <Lead>
                Whitelisted routing across BSC liquidity, with wallet balances,
                exact-input quotes and approvals you control.
              </Lead>
            </div>
            <div style={{ color: "#9bb5b1", fontSize: 13 }}>
              {loadingQuote
                ? "Finding the best route..."
                : quote
                  ? "Route ready"
                  : "BSC liquidity"}
            </div>
          </Intro>
          <Layout>
            <SwapCard>
              <TokenRow>
                <div>
                  <RowLabel>You pay</RowLabel>
                  <Amount
                    inputMode="decimal"
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(event) =>
                      setAmountIn(event.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                  <Balance>
                    {loadingBalances
                      ? "Reading wallet balance..."
                      : `Balance: ${formatUnits(balanceRaw, tokenIn.decimals)} ${tokenIn.symbol}`}
                  </Balance>
                </div>
                <div>
                  <RowLabel>Asset</RowLabel>
                  <TokenButton type="button" onClick={() => setPicker("in")}>
                    <TokenIcon src={tokenIn.logoUrl} alt="" />
                    {tokenIn.symbol}
                    <ChevronDown size={16} />
                  </TokenButton>
                </div>
              </TokenRow>
              <PercentRow>
                {[25, 50, 75].map((value) => (
                  <Percent
                    key={value}
                    type="button"
                    onClick={() => setPercentage(value)}
                  >
                    {value}%
                  </Percent>
                ))}
                <Percent type="button" onClick={() => setPercentage(99.9)}>
                  MAX
                </Percent>
              </PercentRow>
              <FlipButton
                type="button"
                aria-label="Invert swap direction"
                onClick={flip}
              >
                <RefreshCw size={16} />
              </FlipButton>
              <TokenRow>
                <div>
                  <RowLabel>You receive</RowLabel>
                  <Amount
                    readOnly
                    placeholder={loadingQuote ? "..." : "0.0"}
                    value={amountOut === "-" ? "" : amountOut}
                  />
                  <Balance>
                    {loadingBalances
                      ? "Reading wallet balance..."
                      : `Balance: ${formatUnits(balances[tokenOut.address.toLowerCase()], tokenOut.decimals)} ${tokenOut.symbol}`}
                  </Balance>
                </div>
                <div>
                  <RowLabel>Asset</RowLabel>
                  <TokenButton type="button" onClick={() => setPicker("out")}>
                    <TokenIcon src={tokenOut.logoUrl} alt="" />
                    {tokenOut.symbol}
                    <ChevronDown size={16} />
                  </TokenButton>
                </div>
              </TokenRow>
              {taxInfo && (
                <Notice $warning>
                  {taxInfo.label} Slippage is protected at{" "}
                  {effectiveSlippage / 100}% or higher to leave room for the
                  token transfer.
                </Notice>
              )}
              {error && <Notice $warning>{error}</Notice>}
              <Primary
                type="button"
                disabled={
                  !wallet ||
                  !quote ||
                  loadingQuote ||
                  sending ||
                  checkingApproval ||
                  sameToken
                }
                onClick={sendSwap}
              >
                {sending ? (
                  <>
                    <LoaderCircle size={18} className="spin" />
                    Confirming in wallet...
                  </>
                ) : !wallet ? (
                  "Connect wallet to swap"
                ) : loadingQuote ? (
                  "Fetching route..."
                ) : checkingApproval ? (
                  "Checking approval..."
                ) : approvalRequired ? (
                  `Approve ${tokenIn.symbol}`
                ) : quote ? (
                  `Swap ${tokenIn.symbol} for ${tokenOut.symbol}`
                ) : (
                  "Enter an amount"
                )}
              </Primary>
              {txHash && (
                <Notice>
                  Swap confirmed.{" "}
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on BscScan <ExternalLink size={12} />
                  </a>
                </Notice>
              )}
              {rewardMessage && <Notice>{rewardMessage}</Notice>}
              <Notice>
                Completed swaps earn 100 points per swap after on-chain
                confirmation. Points are community rewards and have no
                guaranteed monetary value.
              </Notice>
            </SwapCard>
            <div>
              <Panel>
                <Eyebrow>
                  <Settings2 size={13} style={{ verticalAlign: "-2px" }} />{" "}
                  Trade settings
                </Eyebrow>
                <RowLabel>Maximum slippage</RowLabel>
                <Slippage
                  value={String(slippage)}
                  onChange={(event) =>
                    setSlippage(
                      Math.min(MAX_SLIPPAGE_BPS, Number(event.target.value)),
                    )
                  }
                >
                  <option value="50">0.5%</option>
                  <option value="100">1%</option>
                  <option value="300">3%</option>
                  <option value="800">8%</option>
                  <option value="1200">12%</option>
                </Slippage>
                <Notice>
                  ARB INC quotes automatically use an 8% minimum. Other tokens
                  use the selected setting.
                </Notice>
                <Meta>
                  <MetaLine>
                    <span>Live {tokenIn.symbol} price</span>
                    <span>{inputPrice}</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Live {tokenOut.symbol} price</span>
                    <span>{outputPrice}</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Quoted input value</span>
                    <span>{inputUsd}</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Quoted output value</span>
                    <span>{outputUsd}</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Estimated receive</span>
                    <span>
                      {quote?.amountOut
                        ? `${amountOut} ${tokenOut.symbol}`
                        : "-"}
                    </span>
                  </MetaLine>
                  <MetaLine>
                    <span>Platform fee</span>
                    <span>{FEE_BPS / 100}%</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Network</span>
                    <span>BNB Smart Chain</span>
                  </MetaLine>
                  <MetaLine>
                    <span>Router</span>
                    <span>
                      {quote?.routerAddress
                        ? shortAddress(quote.routerAddress)
                        : "KyberSwap"}
                    </span>
                  </MetaLine>
                </Meta>
                <Notice>
                  Exact-input quote. Only the selected token is approved and the
                  transaction is sent directly to KyberSwap.
                </Notice>
              </Panel>
              <Panel style={{ marginTop: 18 }}>
                <Eyebrow>Token safety</Eyebrow>
                <p
                  style={{
                    color: "#a9bfbd",
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: "10px 0 0",
                  }}
                >
                  ARB INC uses verified 9-decimal metadata. Native BNB uses
                  Kyber's native-token address and transaction value.
                </p>
                <Secondary
                  type="button"
                  style={{ marginTop: 15 }}
                  onClick={copyAddress}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                  {copied ? "Copied" : "Copy ARB INC address"}
                </Secondary>
              </Panel>
            </div>
          </Layout>
        </Shell>
        <Footer />
      </Page>
      {picker && (
        <ModalBackdrop
          role="dialog"
          aria-modal="true"
          onClick={() => setPicker(null)}
        >
          <Modal onClick={(event) => event.stopPropagation()}>
            <ModalHeader>
              <div>
                <Eyebrow>Select token</Eyebrow>
                <strong>{picker === "in" ? "You pay" : "You receive"}</strong>
              </div>
              <IconButton
                type="button"
                aria-label="Close token picker"
                onClick={() => setPicker(null)}
              >
                <X size={17} />
              </IconButton>
            </ModalHeader>
            <SearchBox>
              <Search size={16} />
              <input
                autoFocus
                value={search}
                placeholder="Search symbol or address"
                onChange={(event) => setSearch(event.target.value)}
              />
            </SearchBox>
            {filteredTokens.map((token) => (
              <TokenOption
                key={token.address}
                type="button"
                onClick={() => chooseToken(picker, token)}
              >
                <TokenIcon src={token.logoUrl} alt="" />
                <span>
                  <strong>{token.symbol}</strong>
                  <br />
                  <small style={{ color: "#86aaa4" }}>{token.name}</small>
                </span>
                {token.address.toLowerCase() ===
                  (picker === "in"
                    ? tokenIn.address
                    : tokenOut.address
                  ).toLowerCase() && (
                  <Check
                    size={16}
                    style={{ marginLeft: "auto", color: "#70e1ce" }}
                  />
                )}
              </TokenOption>
            ))}
            <div style={{ marginTop: 18, color: "#a9bfbd", fontSize: 13 }}>
              Add custom BEP-20 token
            </div>
            <CustomInput
              value={customAddress}
              placeholder="0x contract address"
              onChange={(event) => setCustomAddress(event.target.value)}
            />
            <Secondary
              type="button"
              style={{ marginTop: 9 }}
              onClick={addCustomToken}
            >
              <Plus size={15} /> Load token
            </Secondary>
          </Modal>
        </ModalBackdrop>
      )}
    </>
  );
}
