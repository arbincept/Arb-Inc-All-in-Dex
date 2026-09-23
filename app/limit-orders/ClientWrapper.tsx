"use client";

import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { getDefaultClient } from "../../lib/limit-order/api-client";
import { createLimitOrderMaker } from "../../lib/limit-order/maker";

const BSC_CHAIN_ID = 56;
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const LIMIT_ORDER_CONTRACT = "0xcab2FA2eeab7065B45CBcF6E3936dDE2506b4f6C";

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
}

const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const BSC_TOKENS: Token[] = [
  { address: WBNB_ADDRESS, symbol: "WBNB", decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { address: USDT_ADDRESS, symbol: "USDT", decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", symbol: "BUSD", decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/9576/small/busd_3.png" },
  { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" },
  { address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", symbol: "CAKE", decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png" },
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const DEFAULT_RPC = "https://bsc-rpc.publicnode.com";

const normalizeDecimal = (value: string) => value.replace(',', '.');

// Ottiene il prezzo in USDT per 1 unità del token (rispettando i decimali)
async function fetchTokenPriceInUSDT(token: Token): Promise<number> {
  try {
    const amountIn = ethers.utils.parseUnits("1", token.decimals);
    const res = await fetch(
      `/api/kyber/route?tokenIn=${token.address}&tokenOut=${USDT_ADDRESS}&amountIn=${amountIn}`
    );
    const data = await res.json();
    if (data.data?.routeSummary?.amountOutUsd) {
      return parseFloat(data.data.routeSummary.amountOutUsd);
    } else if (data.data?.routeSummary?.amountOut) {
      return parseFloat(data.data.routeSummary.amountOut) / 1e18;
    }
    // Fallback via WBNB
    const wbnbPrice = await fetchTokenPriceInUSDT(BSC_TOKENS[0]);
    const wbnbRes = await fetch(
      `/api/kyber/route?tokenIn=${token.address}&tokenOut=${WBNB_ADDRESS}&amountIn=${amountIn}`
    );
    const wbnbData = await wbnbRes.json();
    if (wbnbData.data?.routeSummary?.amountOut) {
      const wbnbAmount = parseFloat(wbnbData.data.routeSummary.amountOut) / 1e18;
      return wbnbAmount * wbnbPrice;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function fetchTokenPrices(customTokens: Token[] = []): Promise<Record<string, number>> {
  const allTokens = [...BSC_TOKENS, ...customTokens];
  const prices: Record<string, number> = {};
  for (const token of allTokens) {
    if (token.address.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
      prices[token.address] = 1;
    } else {
      const price = await fetchTokenPriceInUSDT(token);
      prices[token.address] = price;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  return prices;
}

async function fetchBalance(tokenAddr: string, decimals: number, wallet: string, provider: any): Promise<string> {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    if (tokenAddr === "0x0000000000000000000000000000000000000000") {
      const balance = await ethersProvider.getBalance(wallet);
      return ethers.utils.formatUnits(balance, decimals);
    }
    const contract = new ethers.Contract(tokenAddr, ERC20_ABI, ethersProvider);
    const balance = await contract.balanceOf(wallet);
    return ethers.utils.formatUnits(balance, decimals);
  } catch { return "0"; }
}

// Stili
const Container = styled.div`min-height: 100vh; max-width: 100vw; overflow-x: hidden; background: #000; padding: 12px; @media (min-width: 640px) { padding: 16px 24px; }`;
const PageHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;`;
const Title = styled.h1`font-size: 20px; font-weight: 700; color: #fff;`;
const DescriptionCard = styled.div`background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; color: #a1a1aa; font-size: 13px;`;
const HeaderRight = styled.div`display: flex; gap: 12px; align-items: center; flex-wrap: wrap;`;
const ChainBadge = styled.div`display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #18181b; border: 1px solid #27272a; border-radius: 20px; color: #a1a1aa; font-size: 13px;`;
const WalletBadge = styled.div`padding: 6px 12px; background: #27272a; border-radius: 8px; color: #a1a1aa; font-size: 13px; cursor: pointer;`;
const MainGrid = styled.div`display: grid; gap: 16px; @media (min-width: 900px) { grid-template-columns: 420px 1fr; gap: 24px; }`;
const Card = styled.div`background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 16px; overflow-x: hidden;`;
const CardTitle = styled.h2`font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 16px;`;
const InputGroup = styled.div`margin-bottom: 12px;`;
const InputLabel = styled.div`font-size: 12px; color: #a1a1aa; margin-bottom: 6px; display: flex; justify-content: space-between;`;
const InputRow = styled.div`display: flex; background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 10px 12px; align-items: center; gap: 8px;`;
const AmountInput = styled.input`flex: 1; background: transparent; border: none; color: #fff; font-size: 18px; font-weight: 600; outline: none; min-width: 0;`;
const TokenIcon = styled.img`width: 20px; height: 20px; border-radius: 50%;`;
const TokenButton = styled.button`display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #18181b; border: 1px solid #3f3f46; border-radius: 10px; color: #fff; font-size: 13px; cursor: pointer;`;
const SwapIcon = styled.button`display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #27272a; border: 1px solid #3f3f46; border-radius: 50%; color: #20B8CD; margin: -8px auto; cursor: pointer;`;
const RateBox = styled.div`background: #27272a; border-radius: 12px; padding: 12px; margin: 12px 0;`;
const RateLabel = styled.div`display: flex; justify-content: space-between; font-size: 12px; color: #a1a1aa; margin-bottom: 10px;`;
const RateInput = styled.input`width: 100%; background: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 10px; color: #fff; font-size: 14px; outline: none;`;
const MarketBtn = styled.button`padding: 10px 14px; background: #20B8CD; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; margin-left: 8px;`;
const ExpirySelect = styled.select`width: 100%; padding: 12px; background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; color: #fff; font-size: 14px; cursor: pointer; margin-top: 12px;`;
const SubmitBtn = styled.button`width: 100%; padding: 14px; background: #20B8CD; border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; &:disabled { opacity: 0.5; }`;
const TabsRow = styled.div`display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px;`;
const Tab = styled.button<{ $active: boolean }>`padding: 8px 16px; background: ${(p) => (p.$active ? "#27272a" : "transparent")}; border: none; border-radius: 8px; color: ${(p) => (p.$active ? "#fff" : "#a1a1aa")}; font-size: 13px; cursor: pointer;`;
const EmptyState = styled.div`text-align: center; padding: 40px; color: #71717a;`;
const Modal = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;`;
const ModalInner = styled.div`background: #18181b; border: 1px solid #27272a; border-radius: 16px; width: 90%; max-width: 360px; max-height: 70vh; overflow: auto;`;
const ModalTitle = styled.div`display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid #27272a; font-weight: 600; color: #fff;`;
const TokenItem = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; cursor: pointer; &:hover { background: #27272a; }`;
const TokenName = styled.div`font-weight: 500; color: #fff;`;
const TokenBal = styled.div`color: #a1a1aa; font-size: 13px;`;

const formatNumber = (num: string | number) => {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(4);
};

export default function ClientWrapper() {
  const [{ wallet }, connect] = useConnectWallet();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"open" | "my">("open");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [showTokenModal, setShowTokenModal] = useState<"sell" | "buy" | null>(null);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [priceLoading, setPriceLoading] = useState(false);

  const walletAddress = wallet?.accounts?.[0]?.address;
  const provider = wallet?.provider;
  const [maker, setMaker] = useState<any>(null);

  const [sellToken, setSellToken] = useState<Token>(BSC_TOKENS[0]);
  const [buyToken, setBuyToken] = useState<Token>(BSC_TOKENS[1]);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [rate, setRate] = useState("");
  const [expiry, setExpiry] = useState(0);
  const [useMarketRate, setUseMarketRate] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeMakingAmount, setActiveMakingAmount] = useState<string>("0");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [importAddress, setImportAddress] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");

  // Aggiorna prezzi
  useEffect(() => {
    const updatePrices = async () => {
      setPriceLoading(true);
      const prices = await fetchTokenPrices(customTokens);
      setTokenPrices(prices);
      setPriceLoading(false);
    };
    updatePrices();
  }, [customTokens]);

  useEffect(() => {
    if (provider && walletAddress) setMaker(createLimitOrderMaker(getDefaultClient()));
    else setMaker(null);
  }, [provider, walletAddress]);

  const loadBalances = useCallback(async () => {
    if (!walletAddress || !provider) return;
    const bals: Record<string, string> = {};
    const tokensToFetch = [...BSC_TOKENS, ...customTokens];
    for (const t of tokensToFetch) {
      bals[t.address] = await fetchBalance(t.address, t.decimals, walletAddress, provider);
    }
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const nativeBalance = await ethersProvider.getBalance(walletAddress);
    bals["0x0000000000000000000000000000000000000000"] = ethers.utils.formatEther(nativeBalance);
    setBalances(bals);
  }, [walletAddress, provider, customTokens]);

  useEffect(() => { if (walletAddress && provider) loadBalances(); }, [walletAddress, provider, loadBalances]);

  const loadOrders = useCallback(async () => {
    if (!maker || !walletAddress) return;
    try {
      const res = await maker.getMakerOrders(walletAddress, { page: 1, size: 50 });
      const fetchedOrders = (res.orders || []).map((o: any) => ({
        id: o.id,
        makerAsset: o.makerAsset,
        takerAsset: o.takerAsset,
        makingAmount: ethers.utils.formatEther(o.makingAmount),
        takingAmount: ethers.utils.formatEther(o.takingAmount),
        status: o.status || "active",
      }));
      setOrders(fetchedOrders);
      const referrer = localStorage.getItem("arb_inc_referrer") || "";
      fetchedOrders.forEach((o: any) => {
        if (o.status.toLowerCase() === "filled") {
          const key = `claimed_limit_${o.id}`;
          if (!localStorage.getItem(key)) {
            fetch("/api/dex-reward", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userWallet: walletAddress, type: "limit", txHash: o.id, referrerWallet: referrer }),
            }).then(() => { localStorage.setItem(key, "true"); alert("🏆 Reward Claimed! 200 points added!"); });
          }
        }
      });
    } catch (e) { console.error(e); setOrders([]); }
  }, [maker, walletAddress]);

  useEffect(() => { if (walletAddress && maker) loadOrders(); }, [walletAddress, maker, loadOrders]);

  const handleCancel = async (orderId: string) => {
    if (!provider || !walletAddress || !maker) return;
    if (!confirm("Cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const prov = new ethers.providers.Web3Provider(provider);
      const signer = await prov.getSigner();
      await maker.cancelOrders(signer, [orderId]);
      alert("Order cancelled!");
      loadOrders();
    } catch (e: any) { alert(e.message || "Failed to cancel order"); }
    setCancellingId(null);
  };

  const checkApproval = useCallback(async () => {
    if (!walletAddress || !provider || !maker) return;
    try {
      const tokenAddr = sellToken.address;
      const res = await maker.getMakerActiveAmount(walletAddress, tokenAddr);
      const currentAmount = ethers.BigNumber.from(res.activeMakingAmount || "0");
      const newAmount = ethers.utils.parseUnits(sellAmount || "0", sellToken.decimals);
      const prov = new ethers.providers.Web3Provider(provider);
      const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, prov);
      const allowance = await tokenContract.allowance(walletAddress, LIMIT_ORDER_CONTRACT);
      setActiveMakingAmount(res.activeMakingAmount || "0");
      setApprovalNeeded(allowance.lt(currentAmount.add(newAmount)));
    } catch (e) { setApprovalNeeded(true); }
  }, [walletAddress, provider, maker, sellToken, sellAmount]);

  const handleApprove = async () => {
    if (!provider || !walletAddress || !sellAmount) return;
    setApproving(true);
    try {
      const prov = new ethers.providers.Web3Provider(provider);
      const tokenAddr = sellToken.address;
      const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, await prov.getSigner());
      const amount = ethers.utils.parseUnits(sellAmount, sellToken.decimals).add(ethers.utils.parseUnits(activeMakingAmount || "0", 18));
      const tx = await tokenContract.approve(LIMIT_ORDER_CONTRACT, amount);
      await tx.wait();
      setApprovalNeeded(false);
      alert("Approval successful!");
    } catch (e: any) { alert(e.message || "Approval failed"); }
    setApproving(false);
  };

  const getMarketRate = useCallback((): number | null => {
    const sellPrice = tokenPrices[sellToken.address];
    const buyPrice = tokenPrices[buyToken.address];
    if (sellPrice === undefined || buyPrice === undefined) return null;
    if (sellPrice === 0 || buyPrice === 0) return null;
    const rateValue = sellPrice / buyPrice;
    // Esclude valori assurdi
    if (rateValue > 1_000_000 || (rateValue < 1e-12 && rateValue > 0)) return null;
    return rateValue;
  }, [tokenPrices, sellToken, buyToken]);

  const getEstimatedUsdRate = () => {
    const rateNum = parseFloat(normalizeDecimal(rate));
    if (isNaN(rateNum)) return null;
    const buyPrice = tokenPrices[buyToken.address];
    if (!buyPrice) return null;
    return rateNum * buyPrice;
  };

  const handleSell = (v: string) => {
    const norm = normalizeDecimal(v);
    setSellAmount(norm);
    if (norm && rate) {
      const sellNum = parseFloat(norm);
      const rateNum = parseFloat(normalizeDecimal(rate));
      if (!isNaN(sellNum) && !isNaN(rateNum)) {
        const buy = sellNum * rateNum;
        setBuyAmount(buy.toFixed(Math.min(buyToken.decimals, 8)));
      }
    } else if (norm && useMarketRate) {
      const market = getMarketRate();
      if (market) {
        const buy = parseFloat(norm) * market;
        setBuyAmount(buy.toFixed(Math.min(buyToken.decimals, 8)));
      } else setBuyAmount("");
    } else setBuyAmount("");
  };

  const handleRate = (v: string) => {
    const norm = normalizeDecimal(v);
    setRate(norm);
    setUseMarketRate(false);
    if (sellAmount && norm) {
      const sellNum = parseFloat(sellAmount);
      const rateNum = parseFloat(norm);
      if (!isNaN(sellNum) && !isNaN(rateNum)) {
        const buy = sellNum * rateNum;
        setBuyAmount(buy.toFixed(Math.min(buyToken.decimals, 8)));
      }
    }
  };

  const handleMarket = () => {
    if (priceLoading) {
      alert("Loading prices, please wait...");
      return;
    }
    const market = getMarketRate();
    if (market === null) {
      alert("Market rate not available for one of the selected tokens. Ensure the token has liquidity on KyberSwap and prices are loaded.");
      return;
    }
    const rateStr = market.toFixed(12);
    setRate(rateStr);
    setUseMarketRate(true);
    if (sellAmount) {
      const buy = parseFloat(sellAmount) * market;
      setBuyAmount(buy.toFixed(Math.min(buyToken.decimals, 8)));
    }
  };

  const handleFlip = () => {
    const t = sellToken;
    setSellToken(buyToken);
    setBuyToken(t);
    setSellAmount("");
    setBuyAmount("");
    setRate("");
    setUseMarketRate(false);
  };

  useEffect(() => {
    if (walletAddress && provider && sellAmount) checkApproval();
  }, [walletAddress, provider, sellAmount, checkApproval]);

  const handleCreate = async () => {
    if (!wallet || !provider || !sellAmount || !rate) {
      alert("Please enter amount and rate");
      return;
    }
    const sellFloat = parseFloat(normalizeDecimal(sellAmount));
    const rateFloat = parseFloat(normalizeDecimal(rate));
    if (isNaN(sellFloat) || isNaN(rateFloat) || sellFloat <= 0 || rateFloat <= 0) {
      alert("Invalid amount or rate");
      return;
    }

    if (rateFloat > 1_000_000) {
      if (!confirm(`⚠️ Rate molto alto (${rateFloat.toExponential(2)}). Sei sicuro?`)) return;
    }
    if (rateFloat < 1e-12 && rateFloat > 0) {
      if (!confirm(`⚠️ Rate molto basso (${rateFloat.toExponential(2)}). Sei sicuro?`)) return;
    }

    const buyVal = sellFloat * rateFloat;
    if (buyVal > 1_000_000_000) {
      if (!confirm(`L'importo in ${buyToken.symbol} è ${buyVal.toExponential(2)}. Questo è irrealistico. Continuare?`)) return;
    }

    await checkApproval();
    if (approvalNeeded) {
      alert("Please approve the token first");
      return;
    }

    const makingAmount = ethers.utils.parseUnits(sellFloat.toString(), sellToken.decimals);
    const takingAmount = ethers.utils.parseUnits(buyVal.toString(), buyToken.decimals);

    try {
      const prov = new ethers.providers.Web3Provider(provider);
      const mk = createLimitOrderMaker(getDefaultClient());
      const exp = expiry > 0 ? Math.floor(Date.now() / 1000) + expiry : Math.floor(Date.now() / 1000) + 86400 * 365;
      await mk.createOrder(await prov.getSigner(), {
        chainId: BSC_CHAIN_ID.toString(),
        makerAsset: sellToken.address,
        takerAsset: buyToken.address,
        makingAmount: makingAmount.toString(),
        takingAmount: takingAmount.toString(),
        expiredAt: exp,
      });
      alert("Order created! Points will be awarded when filled.\nNote: Execution depends on KyberSwap liquidity.");
      loadOrders();
      setSellAmount("");
      setBuyAmount("");
      setRate("");
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Error creating order");
    }
  };

  const allTokens = [...BSC_TOKENS, ...customTokens];
  const selectToken = (t: Token) => {
    if (showTokenModal === "sell") setSellToken(t);
    else setBuyToken(t);
    setShowTokenModal(null);
    setImportAddress("");
    setImportError("");
  };
  const getSym = (a: string) => allTokens.find(t => t.address.toLowerCase() === a.toLowerCase())?.symbol || a.slice(0,6);

  const handleImportToken = async () => {
    if (!importAddress || !/^0x[0-9a-fA-F]{40}$/.test(importAddress)) { setImportError("Indirizzo valido (0x...)"); return; }
    let checksummed: string;
    try { checksummed = ethers.utils.getAddress(importAddress); } catch { setImportError("Indirizzo non valido"); return; }
    if (allTokens.find(t => t.address.toLowerCase() === checksummed.toLowerCase())) {
      selectToken(allTokens.find(t => t.address.toLowerCase() === checksummed.toLowerCase())!);
      return;
    }
    setImportLoading(true);
    setImportError("");
    let ethersProvider: ethers.providers.Provider = provider ? new ethers.providers.Web3Provider(provider) : new ethers.providers.JsonRpcProvider(DEFAULT_RPC);
    try {
      const contract = new ethers.Contract(checksummed, ["function symbol() view returns (string)", "function decimals() view returns (uint8)"], ethersProvider);
      const [symbol, decimals] = await Promise.all([contract.symbol(), contract.decimals()]);
      const newToken: Token = { address: checksummed, symbol, decimals, logoUrl: "" };
      setCustomTokens(prev => [...prev, newToken]);
      selectToken(newToken);
      loadBalances();
      setPriceLoading(true);
      const price = await fetchTokenPriceInUSDT(newToken);
      setTokenPrices(prev => ({ ...prev, [checksummed]: price }));
      setPriceLoading(false);
    } catch (e) {
      setImportError("Impossibile leggere il token. Verifica che sia un ERC20 valido su BSC.");
    } finally { setImportLoading(false); }
  };

  return (
    <Container>
      <Header activePage="/limit-orders" />
      <PageHeader>
        <Title>Limit Order</Title>
        <HeaderRight>
          <ChainBadge><span style={{ color: "#20B8CD" }}>●</span> BNB Chain</ChainBadge>
          <WalletBadge onClick={() => !walletAddress && connect()}>{walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}</WalletBadge>
        </HeaderRight>
      </PageHeader>
      <DescriptionCard>Place limit orders on BSC with the best rates. Powered by <strong>KyberSwap</strong>.</DescriptionCard>
      <MainGrid>
        <Card>
          <CardTitle>Place Limit Order</CardTitle>
          <div style={{ background: "rgba(244,114,182,0.1)", color: "#F472B6", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>🏆 Earn 200 Points Upon Execution</div>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "15px", textAlign: "center" }}>⚠️ <strong>NOTA:</strong> KyberSwap supporta solo <strong>WBNB</strong> (non BNB nativo). Il tuo token deve avere liquidità sulla pool.</div>
          <InputGroup>
            <InputLabel><span>You Sell</span><span>{walletAddress ? (balances[sellToken.address] ? parseFloat(balances[sellToken.address]).toFixed(4) : "...") : "Connect wallet"}</span></InputLabel>
            <InputRow><AmountInput type="number" step="any" inputMode="decimal" placeholder="0.0" value={sellAmount} onChange={(e) => handleSell(e.target.value)} /><TokenButton onClick={() => setShowTokenModal("sell")}>{sellToken.logoUrl && <TokenIcon src={sellToken.logoUrl} />} {sellToken.symbol} ▼</TokenButton></InputRow>
          </InputGroup>
          <SwapIcon onClick={handleFlip}>⇅</SwapIcon>
          <InputGroup>
            <InputLabel><span>You Buy</span></InputLabel>
            <InputRow><AmountInput type="text" placeholder="0.0" value={buyAmount} readOnly /><TokenButton onClick={() => setShowTokenModal("buy")}>{buyToken.logoUrl && <TokenIcon src={buyToken.logoUrl} />} {buyToken.symbol} ▼</TokenButton></InputRow>
          </InputGroup>
          <RateBox>
            <RateLabel>
              <span>Sell {sellToken.symbol} at rate (1 {sellToken.symbol} = ? {buyToken.symbol})</span>
              <span>{getEstimatedUsdRate() !== null && `≈ $${getEstimatedUsdRate()!.toFixed(8)}`}</span>
            </RateLabel>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <RateInput type="number" step="any" placeholder="es. 0.000000025" value={rate} onChange={(e) => handleRate(e.target.value)} />
              <MarketBtn onClick={handleMarket} disabled={priceLoading}>{priceLoading ? "Loading..." : "Market"}</MarketBtn>
            </div>
            {priceLoading && <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 6 }}>Fetching current market prices...</div>}
          </RateBox>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 13, color: "#a1a1aa" }}>Expires in</span>
            <ExpirySelect value={expiry} onChange={(e) => setExpiry(Number(e.target.value))}>
              <option value={0}>Forever</option><option value={3600}>1 hour</option><option value={86400}>1 day</option>
            </ExpirySelect>
          </div>
          {approvalNeeded && sellAmount && (
            <SubmitBtn onClick={handleApprove} disabled={approving} style={{ background: "#f59e0b", marginBottom: 8 }}>
              {approving ? "Approving..." : `Approve ${sellToken.symbol}`}
            </SubmitBtn>
          )}
          <SubmitBtn onClick={handleCreate}>Create Order</SubmitBtn>
        </Card>

        <Card>
          <CardTitle>Open Orders</CardTitle>
          <TabsRow>
            <Tab $active={activeTab === "open"} onClick={() => setActiveTab("open")}>Open Limit Orders</Tab>
            <Tab $active={activeTab === "my"} onClick={() => setActiveTab("my")}>My Orders</Tab>
          </TabsRow>
          {orders.length === 0 ? <EmptyState>No orders found</EmptyState> : (
            <div>
              {orders.map((o) => (
                <div key={o.id} style={{ padding: "12px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div><div style={{ color: "#fff", fontWeight: 500 }}>{getSym(o.makerAsset)} → {getSym(o.takerAsset)}</div><div style={{ color: "#a1a1aa", fontSize: 13 }}>{formatNumber(o.makingAmount)} {getSym(o.makerAsset)}</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#F472B6", fontWeight: 500 }}>{(parseFloat(o.takingAmount) / parseFloat(o.makingAmount)).toFixed(8)} {getSym(o.takerAsset)}</div><div style={{ color: o.status.toLowerCase() === "filled" ? "#22c55e" : "#20B8CD", fontSize: 12 }}>{o.status}</div></div>
                    {o.status.toLowerCase() !== "filled" && <button onClick={() => handleCancel(o.id)} disabled={cancellingId === o.id} style={{ padding: "6px 12px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer" }}>{cancellingId === o.id ? "..." : "Cancel"}</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </MainGrid>

      {showTokenModal && (
        <Modal onClick={() => { setShowTokenModal(null); setImportAddress(""); setImportError(""); }}>
          <ModalInner onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Select Token <button onClick={() => { setShowTokenModal(null); setImportAddress(""); setImportError(""); }} style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: 20, cursor: "pointer" }}>×</button></ModalTitle>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #27272a" }}>
              <div style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 6 }}>Import custom token (paste contract address)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="0x..." value={importAddress} onChange={(e) => { setImportAddress(e.target.value); setImportError(""); }} style={{ flex: 1, padding: "8px 10px", background: "#27272a", border: `1px solid ${importError ? "#ef4444" : "#3f3f46"}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
                <button onClick={handleImportToken} disabled={importLoading} style={{ padding: "8px 14px", background: "#20B8CD", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", opacity: importLoading ? 0.6 : 1 }}>{importLoading ? "..." : "Import"}</button>
              </div>
              {importError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{importError}</div>}
            </div>
            {allTokens.map((t) => (
              <TokenItem key={t.address} onClick={() => selectToken(t)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{t.logoUrl && <img src={t.logoUrl} alt={t.symbol} style={{ width: 24, height: 24, borderRadius: "50%" }} />}<div><TokenName>{t.symbol}</TokenName>{customTokens.includes(t) && <div style={{ fontSize: 11, color: "#20B8CD" }}>Custom</div>}</div></div>
                <TokenBal>{balances[t.address] ? parseFloat(balances[t.address]).toFixed(4) : ""}</TokenBal>
              </TokenItem>
            ))}
          </ModalInner>
        </Modal>
      )}
      <Footer />
    </Container>
  );
}