import { ethers } from "ethers";
import { LimitOrderApiClient } from "./api-client";
import { DEFAULT_CONFIG, type OperatorSignature, type Order } from "./types";

// ============================================
// Taker API Integration
// ============================================

export class LimitOrderTaker {
	private client: LimitOrderApiClient;

	constructor(client: LimitOrderApiClient) {
		this.client = client;
	}

	// ============================================
	// Query Functions
	// ============================================

	/**
	 * Gets available orders for a token pair
	 */
	async getOrders(
		makerAsset: string,
		takerAsset: string,
		options?: {
			page?: number;
			size?: number;
		},
	): Promise<{
		orders: Order[];
		pagination: any;
	}> {
		const params: any = {
			chainId: this.client.getChainId().toString(),
			makerAsset,
			takerAsset,
		};

		if (options?.page) params.page = options.page;
		if (options?.size) params.size = options.size;

		try {
			const response = await this.client.getOrders(params);
			return {
				orders: response.data.orders,
				pagination: response.data.pagination,
			};
		} catch (error) {
			console.error("Failed to get orders:", error);
			throw error;
		}
	}

	/**
	 * Gets operator signature for filling orders
	 */
	async getOperatorSignature(
		orderIds: string[],
		takerAddress: string,
	): Promise<OperatorSignature[]> {
		const params = {
			chainId: this.client.getChainId().toString(),
			orderIds: orderIds.join(","),
			taker: takerAddress,
		};

		try {
			const response = await this.client.getOperatorSignature(params);
			return response.data.operatorSignatures;
		} catch (error) {
			console.error("Failed to get operator signature:", error);
			throw error;
		}
	}

	// ============================================
	// Fill Functions
	// ============================================

	/**
	 * Gets encoded data for filling a single order
	 */
	async getFillOrderEncodedData(
		orderId: number,
		takingAmount: string,
		thresholdAmount: string,
		target: string,
		operatorSignature: string,
	): Promise<string> {
		const body = {
			orderId,
			takingAmount,
			thresholdAmount,
			target,
			operatorSignature,
		};

		try {
			const response = await this.client.getFillOrderEncodedData(body);
			return response.data.encodedData;
		} catch (error) {
			console.error("Failed to get fill order encoded data:", error);
			throw error;
		}
	}

	/**
	 * Gets encoded data for filling multiple orders
	 */
	async getFillBatchOrdersEncodedData(
		orderIds: number[],
		takingAmounts: string[],
		thresholdAmounts: string[],
		target: string,
		operatorSignatures: string[],
	): Promise<string> {
		const body = {
			orderIds,
			takingAmounts,
			thresholdAmounts,
			target,
			operatorSignatures,
		};

		try {
			const response = await this.client.getFillBatchOrdersEncodedData(body);
			return response.data.encodedData;
		} catch (error) {
			console.error("Failed to get fill batch orders encoded data:", error);
			throw error;
		}
	}

	// ============================================
	// Helper Functions
	// ============================================

	/**
	 * Gets the best order (lowest takingAmount) for a token pair
	 */
	async getBestOrder(
		makerAsset: string,
		takerAsset: string,
	): Promise<Order | null> {
		try {
			const { orders } = await this.getOrders(makerAsset, takerAsset, {
				size: 10,
			});

			if (orders.length === 0) return null;

			// Sort by takingAmount (ascending) - lower is better for taker
			const sortedOrders = orders.sort((a, b) => {
				const aAmount = ethers.BigNumber.from(a.takingAmount);
				const bAmount = ethers.BigNumber.from(b.takingAmount);
				if (aAmount.lt(bAmount)) return -1;
				if (aAmount.gt(bAmount)) return 1;
				return 0;
			});

			return sortedOrders[0];
		} catch (error) {
			console.error("Failed to get best order:", error);
			throw error;
		}
	}

	/**
	 * Calculates the optimal taking amount based on order size
	 */
	calculateTakingAmount(order: Order, fillPercentage: number = 100): string {
		if (!Number.isFinite(fillPercentage) || fillPercentage <= 0 || fillPercentage > 100) {
			throw new Error("Fill percentage must be greater than 0 and at most 100");
		}

		const totalTakingAmount = ethers.BigNumber.from(order.takingAmount);
		const filledTakingAmount = ethers.BigNumber.from(order.filledTakingAmount);
		const remainingTakingAmount = totalTakingAmount.sub(filledTakingAmount);

		if (remainingTakingAmount.lte(0)) {
			throw new Error("Order already fully filled");
		}

		return remainingTakingAmount.mul(Math.floor(fillPercentage * 100)).div(10000).toString();
	}

	/**
	 * Checks if order is fillable
	 */
	isOrderFillable(order: Order): boolean {
		const now = Math.floor(Date.now() / 1000);

		if (order.status !== "active") return false;
		if (order.expiredAt < now) return false;

		const totalMakingAmount = ethers.BigNumber.from(order.makingAmount);
		const filledMakingAmount = ethers.BigNumber.from(order.filledMakingAmount);
		const remainingMakingAmount = totalMakingAmount.sub(filledMakingAmount);

		return remainingMakingAmount.gt(0);
	}
}

// ============================================
// Factory Function
// ============================================

export function createLimitOrderTaker(
	client?: LimitOrderApiClient,
): LimitOrderTaker {
	const apiClient = client || new LimitOrderApiClient();
	return new LimitOrderTaker(apiClient);
}
