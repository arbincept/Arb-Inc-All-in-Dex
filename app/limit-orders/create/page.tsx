"use client";

import injectedModule from "@web3-onboard/injected-wallets";
import { init, useConnectWallet, useSetChain } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import { ethers, providers } from "ethers";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import LimitOrderForm, {
	type OrderFormData,
} from "../../../components/limit-orders/LimitOrderForm";
import { getDefaultClient } from "../../../lib/limit-order/api-client";
import { createLimitOrderMaker } from "../../../lib/limit-order/maker";
import { theme } from "../../styles/theme";

// ============================================
// Web3-Onboard Initialization
// ============================================

const injected = injectedModule();
const walletConnect = walletConnectModule({
	projectId: "b03ed6d8451c1e05022897815db0ad0b",
	requiredChains: [56],
	optionalChains: [1, 137, 42161, 8453, 10],
	dappUrl: "https://arbitrage-inc.exchange",
});

init({
	wallets: [injected, walletConnect],
	chains: [
		{
			id: "0x38",
			token: "BNB",
			label: "BNB Smart Chain",
			rpcUrl: "https://bsc.publicnode.com",
		},
	],
});

const BSC_CHAIN_ID = 56;

// ============================================
// Styled Components
// ============================================

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing[8]};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const Title = styled.h1`
  font-family: ${theme.typography.displayFont};
  font-size: ${theme.typography.sizes["3xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const SuccessMessage = styled.div`
  background: ${theme.colors.status.success};
  color: white;
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing[4]};
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.status.error};
  color: white;
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing[4]};
  text-align: center;
`;

// ============================================
// Page Component
// ============================================

export default function CreateLimitOrderPage() {
	const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
	const [chain, setChain] = useSetChain();

	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createdOrder, setCreatedOrder] = useState<any>(null);

	const walletAddress = wallet?.accounts?.[0]?.address;
	const provider = wallet?.provider;

	const availableTokens = [
		{
			address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
			symbol: "WBNB",
			decimals: 18,
		},
		{
			address: "0x5ee54869ecd5e752c31af095187326d4a4d50e1c",
			symbol: "ARB INC",
			decimals: 9,
		},
		{
			address: "0x55d398326f99059fF775485246999027B3197955",
			symbol: "USDT",
			decimals: 18,
		},
	];

	const handleCreateOrder = async (orderData: OrderFormData) => {
		if (!wallet || !provider) {
			setError("Please connect your wallet first");
			return;
		}

		setIsLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const ethersProvider = new ethers.providers.Web3Provider(provider);
			const signer = await ethersProvider.getSigner();

			const client = getDefaultClient();
			const maker = createLimitOrderMaker(client);

			const selectedMakerToken = availableTokens.find(
				(t) => t.address === orderData.makerAsset,
			);
			const selectedTakerToken = availableTokens.find(
				(t) => t.address === orderData.takerAsset,
			);

			const order = await maker.createOrder(signer, {
				chainId: BSC_CHAIN_ID.toString(),
				makerAsset: orderData.makerAsset,
				takerAsset: orderData.takerAsset,
				makingAmount: ethers.utils
					.parseUnits(
						orderData.makingAmount,
						selectedMakerToken?.decimals || 18,
					)
					.toString(),
				takingAmount: ethers.utils
					.parseUnits(
						orderData.takingAmount,
						selectedTakerToken?.decimals || 18,
					)
					.toString(),
				expiredAt: orderData.expiredAt,
			});

			setCreatedOrder(order);
			setSuccess(true);
		} catch (err: any) {
			console.error("Failed to create order:", err);
			setError(err.message || "Failed to create order");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setSuccess(false);
		setError(null);
		setCreatedOrder(null);
	};

	if (!wallet) {
		return (
			<Container>
				<Header>
					<Title>Create Limit Order</Title>
					<Subtitle>
						Set your desired price and let the market come to you. Your order
						will be filled when the market price reaches your limit.
					</Subtitle>
				</Header>

				<div
					style={{
						textAlign: "center",
						padding: "40px",
						background: theme.colors.background.secondary,
						borderRadius: theme.borderRadius.lg,
						maxWidth: "480px",
						margin: "0 auto",
					}}
				>
					<p
						style={{ color: theme.colors.text.secondary, marginBottom: "24px" }}
					>
						Connect your wallet to create limit orders.
					</p>
					<button
						type="button"
						onClick={() => connect()}
						disabled={connecting}
						style={{
							padding: "12px 24px",
							background: theme.colors.primary.gradient,
							border: "none",
							borderRadius: theme.borderRadius.md,
							color: "white",
							fontSize: theme.typography.sizes.md,
							fontWeight: theme.typography.weights.semibold,
							cursor: "pointer",
						}}
					>
						{connecting ? "Connecting..." : "Connect Wallet"}
					</button>
				</div>
			</Container>
		);
	}

	return (
		<Container>
			<Header>
				<Title>Create Limit Order</Title>
				<Subtitle>
					Set your desired price and let the market come to you. Your order will
					be filled when the market price reaches your limit.
				</Subtitle>
			</Header>

			{success ? (
				<div style={{ maxWidth: "480px", margin: "0 auto" }}>
					<SuccessMessage>
						Order created successfully!
						<br />
						Order ID: {createdOrder?.id}
					</SuccessMessage>
					<button
						type="button"
						onClick={handleReset}
						style={{
							width: "100%",
							marginTop: "16px",
							padding: "12px",
							background: theme.colors.primary.DEFAULT,
							border: "none",
							borderRadius: theme.borderRadius.md,
							color: "white",
							cursor: "pointer",
						}}
					>
						Create Another Order
					</button>
				</div>
			) : error ? (
				<div style={{ maxWidth: "480px", margin: "0 auto" }}>
					<ErrorMessage>Error: {error}</ErrorMessage>
					<button
						type="button"
						onClick={() => setError(null)}
						style={{
							width: "100%",
							marginTop: "16px",
							padding: "12px",
							background: theme.colors.background.tertiary,
							border: `1px solid ${theme.colors.border.DEFAULT}`,
							borderRadius: theme.borderRadius.md,
							color: theme.colors.text.primary,
							cursor: "pointer",
						}}
					>
						Try Again
					</button>
				</div>
			) : (
				<LimitOrderForm
					availableTokens={availableTokens}
					onSubmit={handleCreateOrder}
					isLoading={isLoading}
				/>
			)}
		</Container>
	);
}
