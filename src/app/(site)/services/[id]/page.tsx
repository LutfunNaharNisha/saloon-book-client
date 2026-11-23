"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { ServiceDetail } from "@/components/services/service-detail";

export default function ServiceDetailsPage() {
	const params = useParams<{ id: string }>();
	const id = params?.id || "";

	return (
		<RoleGuard>
			<ServiceDetail id={id} />
		</RoleGuard>
	);
}
