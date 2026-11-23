import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { APP_URL } from "./constants";
import { db, mongoClient } from "./db";

const LOCAL_AUTH_BASE_URL = "http://localhost:3000";

const isLocalAuthBaseURL = (value?: string | null): boolean =>
	typeof value === "string" &&
	/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(
		value.trim().replace(/\/$/, ""),
	);

/**
 * Better Auth lives only in this frontend app. The Express API verifies the
 * JWTs issued here and expects AUTH_URL to match this base URL.
 *
 * The base URL is also the JWT issuer/audience, so a deployed frontend must
 * resolve to the public client origin (for example
 * `https://saloon-book-client.vercel.app`). Falling back to a local origin in a
 * deployed build signs JWTs with `http://localhost:3000`, which the Express API
 * then rejects with `401 Invalid or expired token`.
 */
const authBaseURL =
	[
		process.env.BETTER_AUTH_URL,
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: APP_URL,
	]
		.map((value) => value?.trim().replace(/\/$/, ""))
		.find((value) => value && !isLocalAuthBaseURL(value));

const baseURL =
	authBaseURL ?? (process.env.NODE_ENV === "production" ? APP_URL : LOCAL_AUTH_BASE_URL);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
	baseURL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: mongodbAdapter(db, {
		client: mongoClient,
		// Local standalone MongoDB instances do not support transactions.
		transaction: false,
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
		maxPasswordLength: 128,
	},
	...(googleClientId && googleClientSecret
		? {
				socialProviders: {
					google: {
						clientId: googleClientId,
						clientSecret: googleClientSecret,
					},
				},
			}
		: {}),
	user: {
		modelName: "users",
		additionalFields: {
			// Customers cannot self-assign a role. Admins are promoted via the seed script.
			role: {
				type: "string",
				required: false,
				defaultValue: "customer",
				input: false,
			},
			// Only admins can block/unblock accounts through the API.
			isBlocked: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: false,
			},
			phone: {
				type: "string",
				required: false,
				defaultValue: "",
			},
		},
	},
	plugins: [
		// Exposes /api/auth/token (JWT issuance) and /api/auth/jwks (public keys).
		// RS256 keeps the JWT verifiable by the backend's `jsonwebtoken` package
		// (which has no EdDSA support). The backend validates these exact
		// issuer/audience values against this JWKS endpoint.
		jwt({
			jwt: { issuer: baseURL, audience: baseURL },
			jwks: { keyPairConfig: { alg: "RS256" } },
		}),
		// Forwards Better Auth's Set-Cookie headers to the Next.js cookie store.
		nextCookies(),
	],
	trustedOrigins: [APP_URL, baseURL],
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	advanced:
		process.env.NODE_ENV === "production"
			? {
					defaultCookieAttributes: {
						sameSite: "none",
						secure: true,
						httpOnly: true,
					},
				}
			: undefined,
});
