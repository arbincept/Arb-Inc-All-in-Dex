import type { ethers } from "ethers";
import type { LimitOrderApiClient } from "./api-client";
import { createLimitOrderMaker, type LimitOrderMaker } from "./maker";

// ============================================
// Hard Cancel Flow
// ============================================

export class HardCancelFlow {
	private maker: LimitOrderMaker;
	private contractAddress: string;

	constructor(maker: LimitOrderMaker, contractAddress: string) {
		this.maker = maker;
		this.contractAddress = contractAddress;
	}

	/**
	 * Executes hard cancel for specified orders
	 * Requires gas - sends on-chain transaction
	 */
	async cancel(
		signer: ethers.Signer,
		orderIds: string[],
	): Promise<{
		success: boolean;
		transactionHash?: string;
		cancelledOrders: string[];
		failedOrders: string[];
		gasUsed?: string;
		error?: string;
	}> {
		try {
			// Step 1: Get encoded data for batch cancellation
			const encodedData =
				await this.maker.getCancelBatchOrdersEncodedData(orderIds);

			// Step 2: Estimate gas
			const signerAddress = await signer.getAddress();
			const gasEstimate = await signer.estimateGas({
				to: this.contractAddress,
				data: encodedData,
				from: signerAddress,
			});

			// Step 3: Send transaction
			const tx = await signer.sendTransaction({
				to: this.contractAddress,
				data: encodedData,
				gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
			});

			// Step 4: Wait for confirmation
			const receipt = await tx.wait();

			return {
				success: true,
				transactionHash: receipt.transactionHash,
				cancelledOrders: orderIds,
				failedOrders: [],
				gasUsed: receipt.gasUsed.toString(),
			};
		} catch (error) {
			console.error("Hard cancel failed:", error);
			return {
				success: false,
				cancelledOrders: [],
				failedOrders: orderIds,
				error: error instanceof Error ? error.message : "Hard cancellation failed",
			};
		}
	}

	/**
	 * Estimates gas for hard cancel
	 */
	async estimateGas(
		signer: ethers.Signer,
		orderIds: string[],
	): Promise<string> {
		try {
			const encodedData =
				await this.maker.getCancelBatchOrdersEncodedData(orderIds);
			const signerAddress = await signer.getAddress();

			const gasEstimate = await signer.estimateGas({
				to: this.contractAddress,
				data: encodedData,
				from: signerAddress,
			});

			return gasEstimate.toString();
		} catch (error) {
			console.error("Gas estimation failed:", error);
			throw error;
		}
	}

	/**
	 * Cancels orders with gas estimation and user confirmation
	 */
	async cancelWithEstimation(
		signer: ethers.Signer,
		orderIds: string[],
	): Promise<{
		success: boolean;
		transactionHash?: string;
		cancelledOrders: string[];
		failedOrders: string[];
		gasUsed?: string;
		estimatedGas?: string;
	}> {
		// Step 1: Estimate gas
		const estimatedGas = await this.estimateGas(signer, orderIds);

		// Step 2: Execute cancellation
		const result = await this.cancel(signer, orderIds);

		return {
			...result,
			estimatedGas,
		};
	}

	/**
	 * Cancels single order
	 */
	async cancelSingle(
		signer: ethers.Signer,
		orderId: string,
	): Promise<{
		success: boolean;
		transactionHash?: string;
		gasUsed?: string;
		error?: string;
	}> {
		const result = await this.cancel(signer, [orderId]);

		return {
			success: result.success,
			transactionHash: result.transactionHash,
			gasUsed: result.gasUsed,
		};
	}
}

// ============================================
// Factory Function
// ============================================

export function createHardCancelFlow(
	contractAddress: string,
	client?: LimitOrderApiClient,
): HardCancelFlow {
	const maker = createLimitOrderMaker(client);
	return new HardCancelFlow(maker, contractAddress);
}
