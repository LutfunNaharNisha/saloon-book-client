import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

// `jsonwebtoken` requires Node's crypto module, so this endpoint must run in
// the Node.js runtime (it is never bundled into the browser).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies the JWT issued by this app's Better Auth instance. The browser
 * calls this once per new token (see `src/lib/api.ts`) before sending the
 * token to the Express API.
 */
export async function GET(request: NextRequest) {
	const authorization = request.headers.get("authorization");
	if (!authorization?.startsWith("Bearer ")) {
		return NextResponse.json(
			{ success: false, message: "Missing bearer token." },
			{ status: 401 },
		);
	}

	try {
		const payload = await verifyJwt(authorization.slice(7).trim());
		return NextResponse.json({
			success: true,
			data: {
				sub: payload.sub ?? null,
				email: typeof payload.email === "string" ? payload.email : null,
				exp: typeof payload.exp === "number" ? payload.exp : null,
			},
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: "Invalid or expired token." },
			{ status: 401 },
		);
	}
}
