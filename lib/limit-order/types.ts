// KyberSwap Limit Order TypeScript Types
// Based on KyberSwap API Specification and demo repository

// ============================================
// Chain IDs
// ============================================

export enum ChainId {
	MAINNET = 1,
	BSC = 56,
	ARBITRUM = 42161,
	MATIC = 137,
	OPTIMISM = 10,
	AVAX = 43114,
	BASE = 8453,
	CRONOS = 25,
	ZKSYNC = 324,
	FANTOM = 250,
	LINEA = 59144,
	POLYGONZKEVM = 1101,
	AURORA = 1313161554,
	BTTC = 199,
	ZKEVM = 1101,
	SCROLL = 534352,
	// Testnets
	GOERLI = 5,
	MUMBAI = 80001,
	BSCTESTNET = 97,
	AVAXTESTNET = 43113,
}

// ============================================
// Token Types
// ============================================

export interface Token {
	address: string;
	chainId: ChainId;
	decimals: number;
	symbol?: string;
	name?: string;
}

// ============================================
// Order Status
// ============================================

export type OrderStatus = "active" | "filled" | "cancelled" | "expired";

// ============================================
// Maker API Types
// ============================================

export interface CreateOrderUnsignedBody {
	chainId: string;
	makerAsset: string;
	takerAsset: string;
	maker: string;
	receiver?: string;
	allowedSenders?: string[];
	makingAmount: string;
	takingAmount: string;
	feeRecipient?: string;
	makerTokenFeePercent?: string;
	expiredAt: number;
}

export interface CreateOrderSignedBody extends CreateOrderUnsignedBody {
	salt: string;
	signature: string;
}

export interface CreateOrderResponse {
	code: number;
	message: string;
	data: {
		id: string;
		order: Order;
	};
}

export interface MakerOrdersQuery {
	chainId: string;
	maker?: string;
	makerAsset?: string;
	takerAsset?: string;
	statuses?: OrderStatus[];
	pagination?: {
		page: number;
		size: number;
	};
}

export interface MakerOrdersResponse {
	code: number;
	message: string;
	data: {
		orders: Order[];
		pagination: {
			page: number;
			size: number;
			total: number;
		};
	};
}

export interface ActiveMakingAmountQuery {
	chainId: string;
	makerAsset: string;
	maker: string;
}

export interface ActiveMakingAmountResponse {
	code: number;
	message: string;
	data: {
		activeMakingAmount: string;
	};
}

export interface CancelOrderUnsignedBody {
	chainId: string;
	orderIds: string[];
	maker: string;
}

export interface CancelOrderSignedBody extends CancelOrderUnsignedBody {
	salt: string;
	signature: string;
}

export interface CancelOrderResponse {
	code: number;
	message: string;
	data: {
		success: boolean;
	};
}

export interface CancelBatchOrdersBody {
	chainId: string;
	orderIds: string[];
}

export interface CancelBatchOrdersResponse {
	code: number;
	message: string;
	data: {
		encodedData: string;
	};
}

// ============================================
// Taker API Types
// ============================================

export interface OrdersQuery {
	chainId: string;
	makerAsset: string;
	takerAsset: string;
	pagination?: {
		page: number;
		size: number;
	};
}

export interface OrdersResponse {
	code: number;
	message: string;
	data: {
		orders: Order[];
		pagination: {
			page: number;
			size: number;
			total: number;
		};
	};
}

export interface OperatorSignatureQuery {
	chainId: string;
	orderIds: string[];
	taker: string;
}

export interface OperatorSignatureResponse {
	code: number;
	message: string;
	data: {
		operatorSignatures: OperatorSignature[];
	};
}

export interface FillOrderBody {
	orderId: number;
	takingAmount: string;
	thresholdAmount: string;
	target: string;
	operatorSignature: string;
}

export interface FillOrderResponse {
	code: number;
	message: string;
	data: {
		encodedData: string;
	};
}

export interface FillBatchOrdersBody {
	orderIds: number[];
	takingAmounts: string[];
	thresholdAmounts: string[];
	target: string;
	operatorSignatures: string[];
}

export interface FillBatchOrdersResponse {
	code: number;
	message: string;
	data: {
		encodedData: string;
	};
}

// ============================================
// General API Types
// ============================================

export interface SupportedPairsQuery {
	chainId: string;
}

export interface SupportedPairsResponse {
	code: number;
	message: string;
	data: {
		pairs: Array<{
			makerAsset: string;
			takerAsset: string;
		}>;
	};
}

export interface ContractAddressesResponse {
	code: number;
	message: string;
	data: {
		latest: string;
		features?: Record<string, { supportDoubleSignature: boolean }>;
	};
}

// ============================================
// Core Entities
// ============================================

export interface Order {
	id: string;
	chainId: string;
	signature: string;
	salt: string;
	makerAsset: string;
	takerAsset: string;
	maker: string;
	receiver: string;
	allowedSenders: string[];
	makingAmount: string;
	takingAmount: string;
	filledMakingAmount: string;
	filledTakingAmount: string;
	feeConfig: string;
	feeRecipient: string;
	makerTokenFeePercent: string;
	makerAssetData: string;
	takerAssetData: string;
	getMakerAmount: string;
	getTakerAmount: string;
	predicate: string;
	interaction: string;
	expiredAt: number;
	createdAt: number;
	updatedAt: number;
	status: OrderStatus;
}

export interface OperatorSignature {
	id: string;
	operatorSignature: string;
	expiredAt: number;
}

// ============================================
// EIP-712 Types
// ============================================

export interface EIP712Domain {
	name: string;
	version: string;
	chainId: number;
	verifyingContract: string;
}

export interface EIP712Type {
	[key: string]: Array<{
		name: string;
		type: string;
	}>;
}

export interface EIP712TypedData {
	domain: EIP712Domain;
	types: EIP712Type;
	primaryType: string;
	message: Record<string, any>;
}

// ============================================
// Fee Configuration
// ============================================

export interface FeeConfig {
	feePercentage: number; // in basis points (0.1% = 10)
	feeReceiver: string;
	chargeFeeBy: "currency_in" | "currency_out";
	isInBps: boolean;
}

// ============================================
// Limit Order Configuration
// ============================================

export interface LimitOrderConfig {
	apiDomain: string;
	chainId: ChainId;
	feeConfig: FeeConfig;
	rpcUrl: string;
}

// Default configuration for BSC
export const DEFAULT_CONFIG: LimitOrderConfig = {
	apiDomain: "https://limit-order.kyberswap.com",
	chainId: ChainId.BSC,
	feeConfig: {
		feePercentage: 10, // 0.1%
		feeReceiver: "0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7",
		chargeFeeBy: "currency_out",
		isInBps: true,
	},
	rpcUrl: "https://bsc.publicnode.com",
};

// ============================================
// Utility Types
// ============================================

export type OrderSide = "maker" | "taker";

export interface OrderWithSide extends Order {
	side: OrderSide;
}

export interface LimitOrderError {
	code: string;
	message: string;
	details?: any;
}

// ============================================
// API Request/Response Helpers
// ============================================

export interface ApiResponse<T> {
	code: number;
	message: string;
	data: T;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		size: number;
		total: number;
	};
}
