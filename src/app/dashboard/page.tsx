"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { homeForRole } from "@/lib/auth-paths";

export default function DashboardIndexPage() {
	const router = useRouter();
	const { user, isPending } = useAuth();

	useEffect(() => {
		if (!isPending && user) router.replace(homeForRole(user.role));
	}, [isPending, router, user]);

	return <LoadingScreen label="Opening your dashboard..." />;
}
