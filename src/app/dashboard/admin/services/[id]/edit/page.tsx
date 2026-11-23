"use client";

import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { asRecord } from "@/lib/data";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { ServiceForm } from "@/components/admin/service-form";
import { DataError, PageHeader } from "@/components/dashboard/dashboard-parts";
import { LoadingScreen } from "@/components/shared/loading-screen";

export default function EditServicePage() {
	const params = useParams<{ id: string }>();
	const id = params?.id || "";

	const { data: service, loading, error, reload } = useAsyncData<Service | null>(
		async () => {
			const payload = await api.get<unknown>(`/api/services/${id}`);
			const record = asRecord(payload);
			const candidate =
				(record?.service as Service | undefined) ?? (payload as Service);
			return candidate?._id ? candidate : null;
		},
		[id],
	);

	if (loading) return <LoadingScreen label="Loading service..." />;

	if (error || !service) {
		return (
			<>
				<PageHeader title="Service not found" />
				<DataError
					message={error || "This service may have been removed."}
					onRetry={() => void reload()}
				/>
			</>
		);
	}

	return <ServiceForm service={service} />;
}
