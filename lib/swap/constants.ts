// ============================================
// KyberSwap Aggregator API v1 — Shared Swap Constants
// ============================================

// Pseudo-address KyberSwap uses to represent the chain's native token (BNB on BSC).
export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// ARB INC official BSC contract — verified on-chain: 9 decimals, 4% buy/sell transfer tax.
export const ARB_INC_ADDRESS = "0x5ee54869ecd5e752c31af095187326d4a4d50e1c";
export const ARB_INC_DECIMALS = 9;
export const ARB_INC_TAX_BPS = 400; // 4%

export const BSC_CHAIN_ID = 56;
export const FEE_RECEIVER = "0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7";
export const FEE_BPS = 50; // 0.5% platform fee, matches existing widget config

export interface SwapToken {
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoUrl: string;
	isNative?: boolean;
}

export const DEFAULT_SWAP_TOKENS: SwapToken[] = [
	{
		address: NATIVE_ADDRESS,
		symbol: "BNB",
		name: "BNB",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
		isNative: true,
	},
	{
		address: ARB_INC_ADDRESS,
		symbol: "ARB INC",
		name: "Arbitrage Inception",
		decimals: ARB_INC_DECIMALS,
		logoUrl: "/logo.jpg",
	},
	{
		address: USDT_ADDRESS,
		symbol: "USDT",
		name: "Tether USD",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
	},
	{
		address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
		symbol: "USDC",
		name: "USD Coin",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
	},
	{
		address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
		symbol: "BUSD",
		name: "Binance USD",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/9576/small/busd_3.png",
	},
	{
		address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
		symbol: "CAKE",
		name: "PancakeSwap Token",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png",
	},
	{
		address: WBNB_ADDRESS,
		symbol: "WBNB",
		name: "Wrapped BNB",
		decimals: 18,
		logoUrl: "https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png",
	},
];

// Tokens known to charge an on-transfer tax/fee. The quoted amountOut will not account for
// this, so we force a higher minimum slippage tolerance and surface a warning in the UI.
export const TAX_TOKENS: Record<string, { taxBps: number; label: string }> = {
	[ARB_INC_ADDRESS.toLowerCase()]: {
		taxBps: ARB_INC_TAX_BPS,
		label: "ARB INC applies a 4% transfer tax on buys and sells.",
	},
};

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const TAX_TOKEN_MIN_SLIPPAGE_BPS = 800; // 8%
export const MAX_SLIPPAGE_BPS = 2000; // Kyber API hard cap (20%)

export function isNativeAddress(address: string): boolean {
	return address.toLowerCase() === NATIVE_ADDRESS.toLowerCase();
}

export function getTaxTokenInfo(address: string) {
	return TAX_TOKENS[address.toLowerCase()];
}
