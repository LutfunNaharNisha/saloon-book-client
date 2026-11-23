"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { clearTokenCache } from "@/lib/api";

type AuthContextValue = {
	user: SessionUser | null;
	isPending: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isCustomer: boolean;
	isBlocked: boolean;
	refreshSession: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type RawSessionUser = {
	id?: string;
	name?: string;
	email?: string;
	image?: string | null;
	role?: string;
	blocked?: boolean;
	isBlocked?: boolean;
	phone?: string;
	appMetadata?: { role?: string };
};

type SessionData = { user?: RawSessionUser } | null;

export function AuthProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	// `useSession()` is a Better Auth React hook. During App Router SSR it can be
	// invoked without an active React dispatcher (Better Auth resolves a second
	// React copy), throwing `Cannot read properties of null (reading 'useRef')`.
	// `getSession()` is the same data without the hook, so it is safe to call
	// from an effect on the client only.
	const [sessionData, setSessionData] = useState<SessionData>(null);
	const [isPending, setIsPending] = useState(true);

	const loadSession = useCallback(async () => {
		try {
			const result = await authClient.getSession();
			setSessionData((result?.data as SessionData) ?? null);
		} catch {
			setSessionData(null);
		} finally {
			setIsPending(false);
		}
	}, []);

	useEffect(() => {
		void loadSession();
	}, [loadSession]);

	const user = useMemo<SessionUser | null>(() => {
		const raw = sessionData?.user;
		if (!raw?.id) return null;

		const detectedRole =
			typeof raw.role === "string"
				? raw.role.toLowerCase()
				: typeof raw.appMetadata?.role === "string"
					? raw.appMetadata.role.toLowerCase()
					: "customer";

		return {
			id: raw.id,
			name: raw.name || raw.email || "SalonBook user",
			email: raw.email || "",
			image: raw.image ?? null,
			role: detectedRole,
			isBlocked: raw.isBlocked === true || raw.blocked === true,
			phone: raw.phone,
		};
	}, [sessionData]);

	const refreshSession = useCallback(async () => {
		clearTokenCache();
		await loadSession();
	}, [loadSession]);

	const signOut = useCallback(async () => {
		try {
			await authClient.signOut();
			clearTokenCache();
			await loadSession();
			toast.success("You have been signed out.");
			router.replace("/sign-in");
			router.refresh();
		} catch {
			toast.error("Unable to sign out. Please try again.");
		}
	}, [router, loadSession]);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			isPending,
			isAuthenticated: Boolean(user),
			isAdmin: user?.role === "admin",
			isCustomer: Boolean(user && user.role !== "admin"),
			isBlocked: user?.isBlocked === true,
			refreshSession,
			signOut,
		}),
		[user, isPending, refreshSession, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider.");
	}
	return context;
}
