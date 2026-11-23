import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function CustomerDashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <RoleGuard allow={["customer"]}>{children}</RoleGuard>;
}
