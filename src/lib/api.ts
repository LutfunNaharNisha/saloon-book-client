"use client";

import { authClient } from "./auth-client";
import { API_URL } from "./constants";

export class ApiError extends Error {
	status: number;

	constructor(message: string, status = 500) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

/** Express endpoints use an envelope; some legacy endpoints return raw data. */
export function unwrapPayload<T>(payload: unknown): T {
	if (
		payload &&
		typeof payload === "object" &&
		"success" in payload &&
		"data" in payload
	) {
		return (payload as { data: T }).data;
	}
	return payload as T;
}

type TokenCache = { token: string; expiresAt: number } | null;
let tokenCache: TokenCache = null;

export const clearTokenCache = () => {
	tokenCache = null;
};

/**
 * The browser cannot run `jsonwebtoken` (it needs Node's crypto module), so it
 * delegates verification to the Next.js route handler that uses the package.
 * Once a token is verified it is cached until shortly before it expires.
 */
const verifyJwt = async (
	token: string,
): Promise<{ exp?: number | null } | null> => {
	try {
		const response = await fetch("/api/verify-token", {
			headers: { Authorization: `Bearer ${token}` },
			cache: "no-store",
		});
		if (!response.ok) return null;
		const payload = await response.json().catch(() => null);
		return payload?.success ? (payload.data ?? {}) : null;
	} catch {
		return null;
	}
};

const getJwt = async (): Promise<string | null> => {
	if (tokenCache && tokenCache.expiresAt > Date.now()) {
		return tokenCache.token;
	}

	try {
		const client = authClient as unknown as {
			token: () => Promise<{
				data?: { token?: string } | null;
				error?: unknown;
			}>;
		};
		const result = await client.token();
		const token = result?.data?.token;
		if (token) {
			const verified = await verifyJwt(token);
			if (verified) {
				const expiresAt =
					typeof verified.exp === "number"
						? verified.exp * 1000 - 30_000
						: Date.now() + 5 * 60 * 1000;
				tokenCache = { token, expiresAt };
				return token;
			}
		}
	} catch {
		// The request will still be sent (without a token) so the API can
		// respond with its normal 401 when no Better Auth session exists.
	}
	return null;
};

const doFetch = async (
	path: string,
	options: RequestInit,
	token: string | null,
) => {
	const headers = new Headers(options.headers);
	if (options.body && !(options.body instanceof FormData)) {
		headers.set("Content-Type", "application/json");
	}
	if (token) headers.set("Authorization", `Bearer ${token}`);

	return fetch(`${API_URL}${path}`, {
		...options,
		headers,
		credentials: "include",
	});
};

export async function apiFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const token = await getJwt();
	let response = await doFetch(path, options, token);

	// A cached JWT may have expired - retry once with a fresh token/cookie.
	if (response.status === 401 && token) {
		clearTokenCache();
		const freshToken = await getJwt();
		response = await doFetch(path, options, freshToken);
	}

	const contentType = response.headers.get("content-type") || "";
	const payload = contentType.includes("application/json")
		? await response.json().catch(() => null)
		: null;

	if (!response.ok) {
		throw new ApiError(
			payload?.message || `Request failed with status ${response.status}.`,
			response.status,
		);
	}

	return unwrapPayload<T>(payload);
}

export const api = {
	get: <T>(path: string) => apiFetch<T>(path),
	post: <T>(path: string, body?: unknown) =>
		apiFetch<T>(path, {
			method: "POST",
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	patch: <T>(path: string, body?: unknown) =>
		apiFetch<T>(path, {
			method: "PATCH",
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
