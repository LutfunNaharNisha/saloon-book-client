"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { APP_URL } from "./constants";

// Better Auth is hosted by this Next.js app, so auth requests stay same-origin.
export const authClient = createAuthClient({
	baseURL: APP_URL,
	plugins: [jwtClient()],
	fetchOptions: {
		credentials: "include",
	},
});

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role?: string;
	isBlocked?: boolean;
	phone?: string;
};
