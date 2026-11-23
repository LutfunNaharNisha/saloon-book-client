import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["mongodb", "better-auth", "jsonwebtoken"],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**" },
			{ protocol: "http", hostname: "localhost" },
		],
	},
};

export default nextConfig;
