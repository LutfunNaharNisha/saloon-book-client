import { createPublicKey, type JsonWebKey, type KeyObject } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { APP_URL } from "./constants";

/**
 * Server-only JWT verification for the Next.js app.
 *
 * `jsonwebtoken` lives here (instead of in a client component) because it needs
 * Node's `crypto` module. The API route in `app/api/verify-token/route.ts` calls
 * `verifyJwt` so the browser can validate the token it receives from Better
 * Auth before attaching it to requests to the Express API.
 */

const LOCAL_AUTH_BASE_URL = "http://localhost:3000";

const isLocalAuthBaseURL = (value?: string | null): boolean =>
	typeof value === "string" &&
	/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(
		value.trim().replace(/\/$/, ""),
	);

/**
 * Same origin Better Auth issues tokens for. It must stay in sync with the
 * base URL used when signing (see `lib/auth.ts`) - both sides must match the
 * origin the Express API verifies against, otherwise every token is rejected.
 */
const authUrl =
	[
		process.env.BETTER_AUTH_URL,
		process.env.NEXT_PUBLIC_APP_URL,
		APP_URL,
	]
		.map((value) => value?.trim().replace(/\/$/, ""))
		.find((value) => value && !isLocalAuthBaseURL(value)) ??
	(process.env.NODE_ENV === "production" ? APP_URL : LOCAL_AUTH_BASE_URL);

const jwksUrl = `${authUrl}/api/auth/jwks`;

/** Asymmetric algorithms supported by `jsonwebtoken` via Node's crypto. */
const SUPPORTED_ALGORITHMS = [
	"RS256",
	"RS384",
	"RS512",
	"PS256",
	"PS384",
	"PS512",
	"ES256",
	"ES384",
	"ES512",
] as const;

type Jwk = JsonWebKey & { kid?: string };

/** Keys and in-flight JWKS requests are cached for the lifetime of the process. */
const publicKeys = new Map<string, KeyObject>();
let jwksRequest: Promise<Jwk[]> | null = null;

const fetchJwks = (): Promise<Jwk[]> => {
	if (!jwksRequest) {
		jwksRequest = (async () => {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);
			try {
				const response = await fetch(jwksUrl, {
					signal: controller.signal,
					headers: { accept: "application/json" },
					cache: "no-store",
				});
				if (!response.ok) {
					throw new Error(`JWKS request failed with ${response.status}`);
				}
				const body = (await response.json()) as { keys?: Jwk[] };
				if (!Array.isArray(body.keys) || body.keys.length === 0) {
					throw new Error("JWKS response did not contain any keys");
				}
				return body.keys;
			} finally {
				clearTimeout(timeout);
			}
		})().catch((error) => {
			jwksRequest = null;
			throw error;
		});
	}
	return jwksRequest;
};

const getPublicKey = async (kid?: string): Promise<KeyObject> => {
	if (kid && publicKeys.has(kid)) return publicKeys.get(kid)!;

	const keys = await fetchJwks();
	let fallback: KeyObject | undefined;

	for (const jwk of keys) {
		let key: KeyObject;
		try {
			key = createPublicKey({ key: jwk, format: "jwk" });
		} catch {
			continue;
		}
		if (jwk.kid) publicKeys.set(jwk.kid, key);
		if (!kid || jwk.kid === kid) return key;
		fallback ??= key;
	}

	if (fallback && !kid) return fallback;
	throw new Error(`No JWKS key found for kid "${kid ?? "<none>"}"`);
};

const getSigningKey = async (token: string): Promise<KeyObject> => {
	const decoded = jwt.decode(token, { complete: true });
	if (!decoded || typeof decoded === "string") {
		throw new Error("Malformed JWT");
	}

	try {
		return await getPublicKey(decoded.header.kid);
	} catch {
		// The signing key may have rotated since the JWKS fetch.
		jwksRequest = null;
		publicKeys.clear();
		return getPublicKey(decoded.header.kid);
	}
};

/**
 * Verify a Better Auth issued JWT with the `jsonwebtoken` npm package:
 * signature, issuer, audience and expiry are all checked against this app's
 * own JWKS endpoint.
 */
export const verifyJwt = async (token: string): Promise<JwtPayload> => {
	const key = await getSigningKey(token);
	return jwt.verify(token, key, {
		algorithms: [...SUPPORTED_ALGORITHMS],
		issuer: authUrl,
		audience: authUrl,
	}) as JwtPayload;
};
