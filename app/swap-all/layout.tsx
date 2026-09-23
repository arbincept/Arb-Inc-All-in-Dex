import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap All Tokens | DEX Aggregator | Arbitrage Inception",
  description:
    "Non-custodial exact-input token swaps on BNB Smart Chain using KyberSwap aggregated liquidity. Quotes are indicative, ARB INC may require higher slippage, and completed swaps can earn 100 community points after confirmation.",
  keywords: [
    "swap all tokens",
    "BSC swap",
    "DEX aggregator",
    "KyberSwap",
    "PancakeSwap",
    "Uniswap V3",
    "non-custodial token swap",
    "ARB INC swap",
    "100 points per swap",
    "token exchange",
  ],
  alternates: {
    canonical: "https://arbitrage-inc.exchange/swap-all",
  },
  openGraph: {
    title: "Swap All Tokens | DEX Aggregator | Arbitrage Inception",
    description:
      "Non-custodial BSC swaps with indicative KyberSwap quotes, token-specific slippage, ARB INC transfer-tax considerations, and 100 community points after a confirmed swap.",
    url: "https://arbitrage-inc.exchange/swap-all",
    siteName: "Arbitrage Inception",
    images: [
      {
        url: "https://arbitrage-inc.exchange/logo.jpg",
        width: 800,
        height: 800,
        alt: "Arbitrage Inception Swap All",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swap All Tokens | DEX Aggregator | Arbitrage Inception",
    description:
      "Non-custodial BSC swaps with indicative quotes, token-specific risks, and community reward points after confirmation.",
    images: ["https://arbitrage-inc.exchange/logo.jpg"],
  },
};

export default function SwapAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
