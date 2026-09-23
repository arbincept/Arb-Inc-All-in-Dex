import { BigNumber, type ethers } from "ethers";
import { LimitOrderApiClient } from "./api-client";
import {
	createLimitOrderDomain,
	createOrderType,
	generateSalt,
	signTypedData,
} from "./signing";
import {
	type CreateOrderSignedBody,
	type CreateOrderUnsignedBody,
	DEFAULT_CONFIG,
	type FeeConfig,
	type Order,
} from "./types";

// ============================================
// Maker API Integration
// ============================================

export class LimitOrderMaker {
	private client: LimitOrderApiClient;
	private feeConfig: FeeConfig;

	constructor(client: LimitOrderApiClient, feeConfig?: FeeConfig) {
		this.client = client;
		this.feeConfig = feeConfig || DEFAULT_CONFIG.feeConfig;
	}

	// ============================================
	// Dev Fee Calculation
	// ============================================

	/**
	 * Applies dev fee to making amount (reduces by fee percentage)
	 * Example: 1 BNB with 0.1% fee → 0.999 BNB
	 */
	applyDevFeeToMakingAmount(makingAmount: string): string {
		const amount = BigNumber.from(makingAmount);
		const feeBps = this.feeConfig.feePercentage;
		if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10000) {
			throw new Error("Invalid limit order fee percentage");
		}
		return amount.mul(10000 - feeBps).div(10000).toString();
	}

	/**
	 * Applies dev fee to taking amount (increases by fee percentage)
	 * Example: 1000 USDC with 0.1% fee → 1001 USDC
	 */
	applyDevFeeToTakingAmount(takingAmount: string): string {
		const amount = BigNumber.from(takingAmount);
		const feeBps = this.feeConfig.feePercentage;
		if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10000) {
			throw new Error("Invalid limit order fee percentage");
		}
		return amount.mul(10000 + feeBps).add(9999).div(10000).toString();
	}

	// ============================================
	// Core Maker Functions
	// ============================================

	/**
	 * Gets unsigned create order message from KyberSwap API
	 */
	async getUnsignedCreateOrder(params: {
		chainId: string;
		makerAsset: string;
		takerAsset: string;
		maker: string;
		makingAmount: string;
		takingAmount: string;
		expiredAt: number;
		receiver?: string;
		allowedSenders?: string[];
	}): Promise<{
		requestBody: CreateOrderUnsignedBody;
		returnedData: any;
	}> {
		// Apply dev fee to amounts
		const adjustedMakingAmount = this.applyDevFeeToMakingAmount(
			params.makingAmount,
		);
		const adjustedTakingAmount = this.applyDevFeeToTakingAmount(
			params.takingAmount,
		);

		const requestBody: CreateOrderUnsignedBody = {
			chainId: params.chainId,
			makerAsset: params.makerAsset,
			takerAsset: params.takerAsset,
			maker: params.maker,
			receiver: params.receiver,
			allowedSenders: params.allowedSenders,
			makingAmount: adjustedMakingAmount,
			takingAmount: adjustedTakingAmount,
			feeRecipient: this.feeConfig.feeReceiver,
			makerTokenFeePercent: this.feeConfig.feePercentage.toString(),
			expiredAt: params.expiredAt,
		};

		try {
			const response = await this.client.getUnsignedCreateOrder(requestBody);
			return {
				requestBody,
				returnedData: response.data,
			};
		} catch (error) {
			console.error("Failed to get unsigned create order:", error);
			throw error;
		}
	}

	/**
	 * Signs EIP-712 create order message
	 */
	async signCreateOrder(
		signer: ethers.Signer,
		domain: any,
		types: any,
		message: any,
	): Promise<string> {
		try {
			return await signTypedData(signer, domain, types, message);
		} catch (error) {
			console.error("Failed to sign create order:", error);
			throw error;
		}
	}

	/**
	 * Creates and signs a limit order
	 */
	async createOrder(
		signer: ethers.Signer,
		params: {
			chainId: string;
			makerAsset: string;
			takerAsset: string;
			makingAmount: string;
			takingAmount: string;
			expiredAt: number;
			receiver?: string;
			allowedSenders?: string[];
		},
	): Promise<Order> {
		const signerAddress = await signer.getAddress();

		// Step 1: Get unsigned create order message
		const { requestBody, returnedData } = await this.getUnsignedCreateOrder({
			...params,
			maker: signerAddress,
			allowedSenders: params.allowedSenders || [signerAddress],
		});

		// Step 2: Sign the EIP-712 message
		const signature = await this.signCreateOrder(
			signer,
			returnedData.domain,
			{ Order: returnedData.types.Order },
			returnedData.message,
		);

		// Step 3: Create signed order body
		const signedBody: CreateOrderSignedBody = {
			...requestBody,
			salt: returnedData.message.salt,
			signature,
		};

		// Step 4: Submit to KyberSwap API
		try {
			const response = await this.client.createOrder(signedBody);
			return response.data.order;
		} catch (error) {
			console.error("Failed to create order:", error);
			throw error;
		}
	}

	// ============================================
	// Cancellation Functions
	// ============================================

	/**
	 * Gets unsigned cancel order message
	 */
	async getUnsignedCancelOrder(
		signer: ethers.Signer,
		orderIds: Array<string | number>,
	): Promise<{
		requestBody: any;
		returnedData: any;
	}> {
		const signerAddress = await signer.getAddress();

		const requestBody = {
			chainId: this.client.getChainId().toString(),
			orderIds: orderIds.map((orderId) => {
				const numericOrderId = Number(orderId);
				if (!Number.isSafeInteger(numericOrderId) || numericOrderId < 0) {
					throw new Error(`Invalid Kyber order ID: ${orderId}`);
				}
				return numericOrderId;
			}),
			maker: signerAddress,
		};

		try {
			const response = await this.client.getUnsignedCancelOrder(requestBody);
			return {
				requestBody,
				returnedData: response.data,
			};
		} catch (error) {
			console.error("Failed to get unsigned cancel order:", error);
			throw error;
		}
	}

	/**
	 * Cancels orders (gasless)
	 */
	async cancelOrders(
		signer: ethers.Signer,
		orderIds: string[],
	): Promise<boolean> {
		const normalizedOrderIds = orderIds.map((orderId) => {
			const numericOrderId = Number(orderId);
			if (!Number.isSafeInteger(numericOrderId) || numericOrderId < 0) {
				throw new Error(`Invalid Kyber order ID: ${orderId}`);
			}
			return numericOrderId;
		});

		// Step 1: Get unsigned cancel message
		const { requestBody, returnedData } = await this.getUnsignedCancelOrder(
			signer,
			normalizedOrderIds,
		);

		// Step 2: Sign the cancel message
		const signature = await this.signCreateOrder(
			signer,
			returnedData.domain,
			{ CancelOrder: returnedData.types.CancelOrder },
			returnedData.message,
		);

		// Step 3: Create signed cancel body
		const signedBody = {
			...requestBody,
			salt: returnedData.message.salt,
			signature,
		};

		// Step 4: Submit cancel
		try {
			const response = await this.client.cancelOrder(signedBody);
			if (!response.data?.success) {
				throw new Error(response.message || "Kyber rejected the cancellation");
			}
			return response.data.success;
		} catch (error) {
			console.error("Failed to cancel orders:", error);
			throw error;
		}
	}

	/**
	 * Gets encoded data for batch cancellation (for on-chain hard cancel)
	 */
	async getCancelBatchOrdersEncodedData(orderIds: string[]): Promise<string> {
		const body = {
			orderIds: orderIds.map((orderId) => {
				const numericOrderId = Number(orderId);
				if (!Number.isSafeInteger(numericOrderId) || numericOrderId < 0) {
					throw new Error(`Invalid Kyber order ID: ${orderId}`);
				}
				return numericOrderId;
			}),
		};

		try {
			const response = await this.client.getCancelBatchOrdersEncodedData(body);
			return response.data.encodedData;
		} catch (error) {
			console.error("Failed to get cancel batch orders encoded data:", error);
			throw error;
		}
	}

	// ============================================
	// Query Functions
	// ============================================

	/**
	 * Gets maker's active orders
	 */
	async getMakerOrders(
		makerAddress: string,
		options?: {
			makerAsset?: string;
			takerAsset?: string;
			statuses?: string[];
			page?: number;
			size?: number;
		},
	): Promise<{
		orders: Order[];
		pagination: any;
	}> {
		const params: any = {
			chainId: this.client.getChainId().toString(),
			maker: makerAddress,
			status: "active",
		};

		if (options?.makerAsset) params.makerAsset = options.makerAsset;
		if (options?.takerAsset) params.takerAsset = options.takerAsset;
		if (options?.statuses && options.statuses.length > 0)
			params.status = options.statuses[0];
		if (options?.page) params.page = options.page;
		if (options?.size) params.size = options.size;

		try {
			const response = await this.client.getMakerOrders(params);
			return {
				orders: response.data.orders,
				pagination: response.data.pagination,
			};
		} catch (error) {
			console.error("Failed to get maker orders:", error);
			throw error;
		}
	}

	/**
	 * Gets maker's active making amount for a token
	 */
	async getMakerActiveAmount(
		makerAddress: string,
		makerAsset: string,
	): Promise<string> {
		const params = {
			chainId: this.client.getChainId().toString(),
			makerAsset,
			maker: makerAddress,
		};

		try {
			const response = await this.client.getMakerActiveAmount(params);
			return response.data.activeMakingAmount;
		} catch (error) {
			console.error("Failed to get maker active amount:", error);
			throw error;
		}
	}
}

// ============================================
// Factory Function
// ============================================

export function createLimitOrderMaker(
	client?: LimitOrderApiClient,
	feeConfig?: FeeConfig,
): LimitOrderMaker {
	const apiClient = client || new LimitOrderApiClient();
	return new LimitOrderMaker(apiClient, feeConfig);
}
