import { DEFAULT_CONFIG, type FeeConfig, type LimitOrderConfig } from "./types";

// ============================================
// Environment Configuration
// ============================================

// These values should be set in .env or .env.local
const ENV_CONFIG = {
	LIMIT_ORDER_API_DOMAIN:
		process.env.NEXT_PUBLIC_LIMIT_ORDER_API_DOMAIN || DEFAULT_CONFIG.apiDomain,
	LIMIT_ORDER_CHAIN_ID: parseInt(
		process.env.NEXT_PUBLIC_LIMIT_ORDER_CHAIN_ID ||
			DEFAULT_CONFIG.chainId.toString(),
	),
	LIMIT_ORDER_FEE_RECEIVER:
		process.env.NEXT_PUBLIC_LIMIT_ORDER_FEE_RECEIVER || "",
	LIMIT_ORDER_FEE_PERCENTAGE: parseInt(
		process.env.NEXT_PUBLIC_LIMIT_ORDER_FEE_PERCENTAGE ||
			DEFAULT_CONFIG.feeConfig.feePercentage.toString(),
	),
	LIMIT_ORDER_RPC_URL:
		process.env.NEXT_PUBLIC_LIMIT_ORDER_RPC_URL || DEFAULT_CONFIG.rpcUrl,
};

// ============================================
// BSC Configuration
// ============================================

export const BSC_CONFIG: LimitOrderConfig = {
	apiDomain: ENV_CONFIG.LIMIT_ORDER_API_DOMAIN,
	chainId: 56, // BSC
	feeConfig: {
		feePercentage: ENV_CONFIG.LIMIT_ORDER_FEE_PERCENTAGE,
		feeReceiver: ENV_CONFIG.LIMIT_ORDER_FEE_RECEIVER,
		chargeFeeBy: "currency_out",
		isInBps: true,
	},
	rpcUrl: ENV_CONFIG.LIMIT_ORDER_RPC_URL,
};

// ============================================
// Mainnet Configuration
// ============================================

export const MAINNET_CONFIG: LimitOrderConfig = {
	apiDomain: ENV_CONFIG.LIMIT_ORDER_API_DOMAIN,
	chainId: 1, // Ethereum Mainnet
	feeConfig: {
		feePercentage: ENV_CONFIG.LIMIT_ORDER_FEE_PERCENTAGE,
		feeReceiver: ENV_CONFIG.LIMIT_ORDER_FEE_RECEIVER,
		chargeFeeBy: "currency_out",
		isInBps: true,
	},
	rpcUrl: "https://eth.llamarpc.com",
};

// ============================================
// Polygon Configuration
// ============================================

export const POLYGON_CONFIG: LimitOrderConfig = {
	apiDomain: ENV_CONFIG.LIMIT_ORDER_API_DOMAIN,
	chainId: 137, // Polygon
	feeConfig: {
		feePercentage: ENV_CONFIG.LIMIT_ORDER_FEE_PERCENTAGE,
		feeReceiver: ENV_CONFIG.LIMIT_ORDER_FEE_RECEIVER,
		chargeFeeBy: "currency_out",
		isInBps: true,
	},
	rpcUrl: "https://polygon-rpc.com",
};

// ============================================
// Contract Addresses by Chain
// ============================================

export const CONTRACT_ADDRESSES: Record<number, string> = {
	56: "0xcab2FA2eeab7065B45CBcF6E3936dDE2506b4f6C", // BSC DSLO protocol
	1: "0xcab2FA2eeab7065B45CBcF6E3936dDE2506b4f6C", // Ethereum DSLO protocol
	137: "0xcab2FA2eeab7065B45CBcF6E3936dDE2506b4f6C", // Polygon DSLO protocol
};

// ============================================
// Supported Tokens by Chain
// ============================================

export const SUPPORTED_TOKENS: Record<
	number,
	Array<{
		address: string;
		symbol: string;
		decimals: number;
		name: string;
	}>
> = {
	56: [
		// BSC
		{
			address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
			symbol: "WBNB",
			decimals: 18,
			name: "Wrapped BNB",
		},
		{
			address: "0x55d398326f99059fF775485246999027B3197955",
			symbol: "USDT",
			decimals: 18,
			name: "Tether USD",
		},
		{
			address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
			symbol: "BUSD",
			decimals: 18,
			name: "Binance USD",
		},
		{
			address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
			symbol: "USDC",
			decimals: 18,
			name: "USD Coin",
		},
		{
			address: "0x5ee54869ecd5e752c31af095187326d4a4d50e1c",
			symbol: "ARB INC",
			decimals: 9,
			name: "Arbitrage Inception",
		},
	],
	1: [
		// Ethereum
		{
			address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			symbol: "WETH",
			decimals: 18,
			name: "Wrapped Ether",
		},
		{
			address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
			symbol: "USDT",
			decimals: 6,
			name: "Tether USD",
		},
	],
};

// ============================================
// Chain Configuration Mapping
// ============================================

export const CHAIN_CONFIGS: Record<number, LimitOrderConfig> = {
	56: BSC_CONFIG,
	1: MAINNET_CONFIG,
	137: POLYGON_CONFIG,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Gets configuration for a specific chain
 */
export function getChainConfig(chainId: number): LimitOrderConfig {
	return CHAIN_CONFIGS[chainId] || BSC_CONFIG;
}

/**
 * Gets contract address for a specific chain
 */
export function getContractAddress(chainId: number): string {
	return CONTRACT_ADDRESSES[chainId] || "";
}

/**
 * Gets supported tokens for a specific chain
 */
export function getSupportedTokens(chainId: number) {
	return SUPPORTED_TOKENS[chainId] || [];
}

/**
 * Gets fee configuration
 */
export function getFeeConfig(): FeeConfig {
	return BSC_CONFIG.feeConfig;
}

/**
 * Updates fee receiver address
 */
export function updateFeeReceiver(feeReceiver: string): void {
	BSC_CONFIG.feeConfig.feeReceiver = feeReceiver;
	MAINNET_CONFIG.feeConfig.feeReceiver = feeReceiver;
	POLYGON_CONFIG.feeConfig.feeReceiver = feeReceiver;
}

/**
 * Updates fee percentage (in basis points)
 */
export function updateFeePercentage(feePercentageBps: number): void {
	BSC_CONFIG.feeConfig.feePercentage = feePercentageBps;
	MAINNET_CONFIG.feeConfig.feePercentage = feePercentageBps;
	POLYGON_CONFIG.feeConfig.feePercentage = feePercentageBps;
}

// ============================================
// Default Export
// ============================================

export default BSC_CONFIG;
