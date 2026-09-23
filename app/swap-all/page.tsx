"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ClientSwapAllPage = dynamic(() => import("./BetaSwapClient"), {
	ssr: false,
});

export default function SwapAllPage() {
	return (
		<Suspense
			fallback={
				<div style={{ color: "#fff", textAlign: "center", padding: "100px" }}>
					Loading...
				</div>
			}
		>
			<ClientSwapAllPage />
		</Suspense>
	);
}
