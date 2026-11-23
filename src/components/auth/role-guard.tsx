"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { homeForRole } from "@/lib/auth-paths";
import type { Role } from "@/lib/types";

export function RoleGuard({
	children,
	allow,
}: {
	children: ReactNode;
	allow?: Role[];
}) {
	const { user, isPending, isBlocked } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	const roleAllowed =
		!allow || Boolean(user && allow.includes(user.role as Role));

	useEffect(() => {
		if (isPending) return;

		if (!user) {
			router.replace(
				`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`,
			);
			return;
		}

		if (isBlocked) {
			router.replace("/blocked");
			return;
		}

		if (!roleAllowed) {
			router.replace(homeForRole(user.role));
		}
	}, [isPending, isBlocked, pathname, roleAllowed, router, user]);

	if (isPending) {
		return <LoadingScreen label="Checking your session..." />;
	}

	if (!user || isBlocked || !roleAllowed) {
		return <LoadingScreen label="Redirecting..." />;
	}

	return <>{children}</>;
}
