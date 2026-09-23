import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";
import {
	type ApiResponse,
	DEFAULT_CONFIG,
	type LimitOrderConfig,
} from "./types";

// ============================================
// API Client Configuration
// ============================================

interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	baseDelay: 1000, // 1 second
	maxDelay: 10000, // 10 seconds
};

// ============================================
// API Client Class
// ============================================

export class LimitOrderApiClient {
	private client: AxiosInstance;
	private config: LimitOrderConfig;
	private retryConfig: RetryConfig;

	constructor(
		config?: Partial<LimitOrderConfig>,
		retryConfig?: Partial<RetryConfig>,
	) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

		this.client = axios.create({
			baseURL: this.config.apiDomain,
			timeout: 30000, // 30 seconds
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"x-client-id": "arb-inc",
			},
		});

		// Add response interceptor for error handling
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => this.handleApiError(error),
		);
	}

	// ============================================
	// Retry Logic
	// ============================================

	private async retryRequest<T>(
		requestFn: () => Promise<AxiosResponse<T>>,
		retryCount: number = 0,
	): Promise<AxiosResponse<T>> {
		try {
			return await requestFn();
		} catch (error) {
			// Only retry on network errors or 5xx status codes
			const axiosError = error as AxiosError;
			const shouldRetry =
				retryCount < this.retryConfig.maxRetries &&
				(!axiosError.response || axiosError.response.status >= 500);

			if (!shouldRetry) {
				throw error;
			}

			// Calculate delay with exponential backoff and jitter
			const delay = Math.min(
				this.retryConfig.baseDelay * 2 ** retryCount + Math.random() * 1000,
				this.retryConfig.maxDelay,
			);

			console.warn(
				`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
			);

			await new Promise((resolve) => setTimeout(resolve, delay));

			return this.retryRequest(requestFn, retryCount + 1);
		}
	}

	// ============================================
	// Error Handling
	// ============================================

	private handleApiError(error: AxiosError): never {
		if (error.response) {
			// Server responded with error status
			const data = error.response.data as any;
			const message = data?.message || error.message;
			const code = data?.code || error.response.status;

			throw new Error(`API Error ${code}: ${message}`);
		} else if (error.request) {
			// Request was made but no response received
			throw new Error("Network error: No response received from server");
		} else {
			// Something happened in setting up the request
			throw new Error(`Request setup error: ${error.message}`);
		}
	}

	// ============================================
	// Generic Request Methods
	// ============================================

	async get<T>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<ApiResponse<T>> {
		const response = await this.retryRequest(() =>
			this.client.get<ApiResponse<T>>(url, config),
		);
		return response.data;
	}

	async post<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<ApiResponse<T>> {
		const response = await this.retryRequest(() =>
			this.client.post<ApiResponse<T>>(url, data, config),
		);
		return response.data;
	}

	// ============================================
	// Specific API Methods
	// ============================================

	// General APIs
	async getSupportedPairs(chainId: string) {
		return this.get<{
			pairs: Array<{ makerAsset: string; takerAsset: string }>;
		}>(`/read-partner/api/v1/orders/pairs`, { params: { chainId } });
	}

	async getContractAddresses(chainId: string) {
		return this.get<{ latest: string; legacy: string[] }>(
			`/read-ks/api/v1/configs/contract-address`,
			{ params: { chainId } },
		);
	}

	// Maker APIs
	async getUnsignedCreateOrder(body: any) {
		return this.post<any>(`/write/api/v1/orders/sign-message`, body);
	}

	async createOrder(body: any) {
		return this.post<{ id: string; order: any }>(`/write/api/v1/orders`, body);
	}

	async getMakerOrders(params: any) {
		return this.get<{ orders: any[]; pagination: any }>(
			`/read-ks/api/v1/orders`,
			{ params },
		);
	}

	async getMakerActiveAmount(params: any) {
		return this.get<{ activeMakingAmount: string }>(
			`/read-ks/api/v1/orders/active-making-amount`,
			{ params },
		);
	}

	async getUnsignedCancelOrder(body: any) {
		return this.post<any>(`/write/api/v1/orders/cancel-sign`, body);
	}

	async cancelOrder(body: any) {
		return this.post<{ success: boolean }>(`/write/api/v1/orders/cancel`, body);
	}

	async getCancelBatchOrdersEncodedData(body: any) {
		return this.post<{ encodedData: string }>(
			`/read-ks/api/v1/encode/cancel-batch-orders`,
			body,
		);
	}

	async getCancelAllOrdersEncodedData(body: any) {
		return this.post<{ encodedData: string }>(
			`/read-ks/api/v1/encode/cancel-all-orders`,
			body,
		);
	}

	// Taker APIs
	async getOrders(params: any) {
		return this.get<{ orders: any[]; pagination: any }>(
			`/read-partner/api/v1/orders`,
			{ params },
		);
	}

	async getOperatorSignature(params: any) {
		return this.get<{ operatorSignatures: any[] }>(
			`/read-partner/api/v1/orders/operator-signature`,
			{ params },
		);
	}

	async getFillOrderEncodedData(body: any) {
		return this.post<{ encodedData: string }>(
			`/read-ks/api/v1/encode/fill-order-to`,
			body,
		);
	}

	async getFillBatchOrdersEncodedData(body: any) {
		return this.post<{ encodedData: string }>(
			`/read-ks/api/v1/encode/fill-batch-orders-to`,
			body,
		);
	}

	// ============================================
	// Configuration Helpers
	// ============================================

	getApiDomain(): string {
		return this.config.apiDomain;
	}

	getChainId(): number {
		return this.config.chainId;
	}

	updateConfig(newConfig: Partial<LimitOrderConfig>): void {
		this.config = { ...this.config, ...newConfig };

		if (newConfig.apiDomain) {
			this.client.defaults.baseURL = newConfig.apiDomain;
		}
	}
}

// ============================================
// Factory Function
// ============================================

export function createLimitOrderClient(
	config?: Partial<LimitOrderConfig>,
	retryConfig?: Partial<RetryConfig>,
): LimitOrderApiClient {
	return new LimitOrderApiClient(config, retryConfig);
}

// ============================================
// Singleton Instance (optional)
// ============================================

let defaultClientInstance: LimitOrderApiClient | null = null;

export function getDefaultClient(): LimitOrderApiClient {
	if (!defaultClientInstance) {
		defaultClientInstance = createLimitOrderClient();
	}
	return defaultClientInstance;
}

export function setDefaultClient(client: LimitOrderApiClient): void {
	defaultClientInstance = client;
}
