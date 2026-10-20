import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse,
) {
	return res.status(200).json({
		success: false,
		message:
			"Manual claiming is deprecated. ARB INC rewards are automatically pushed to qualified holders on-chain every 24 hours via RevShare.",
		revshare_url:
			"https://app.revshare.ltd/token/0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c",
	});
}
