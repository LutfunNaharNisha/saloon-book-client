"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { asArray, getErrorMessage } from "@/lib/data";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataError, EmptyState, PageHeader } from "@/components/dashboard/dashboard-parts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function ServiceManager() {
	const [search, setSearch] = useState("");
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
	const [deleting, setDeleting] = useState(false);

	const {
		data: services,
		loading,
		error,
		reload,
		setData,
	} = useAsyncData<Service[]>(
		async () => asArray<Service>(await api.get<unknown>("/api/services?all=true")),
		[],
	);

	const visible = (services || []).filter((service) =>
		service.serviceName.toLowerCase().includes(search.trim().toLowerCase()),
	);

	const toggleStatus = async (service: Service) => {
		const nextStatus = service.status === "active" ? "inactive" : "active";
		setUpdatingId(service._id);
		try {
			await api.patch(`/api/services/${service._id}`, { status: nextStatus });
			setData((current) =>
				(current || []).map((item) =>
					item._id === service._id ? { ...item, status: nextStatus } : item,
				),
			);
			toast.success(
				nextStatus === "active"
					? "Service is now active."
					: "Service is now inactive.",
			);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to update service status."));
		} finally {
			setUpdatingId(null);
		}
	};

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await api.delete(`/api/services/${deleteTarget._id}`);
			setData((current) =>
				(current || []).filter((item) => item._id !== deleteTarget._id),
			);
			toast.success("Service deleted successfully.");
			setDeleteTarget(null);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to delete this service."));
		} finally {
			setDeleting(false);
		}
	};

	return (
		<>
			<PageHeader
				title="Manage services"
				description="Add treatments, update details and control what customers can book."
				actions={
					<Button asChild>
						<Link href="/dashboard/admin/services/new">
							<Plus /> Add new service
						</Link>
					</Button>
				}
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : !services?.length ? (
				<EmptyState
					title="No services yet"
					description="Create your first salon service to start taking bookings."
					action={
						<Button asChild>
							<Link href="/dashboard/admin/services/new">
								<Plus /> Add service
							</Link>
						</Button>
					}
				/>
			) : (
				<Card className="overflow-hidden">
					<div className="border-b p-4">
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search services by name..."
							className="max-w-sm"
							aria-label="Search services by name"
						/>
					</div>
					{visible.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Service</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Active</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{visible.map((service) => (
									<TableRow key={service._id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
													{service.image ? (
														<Image
															src={service.image}
															alt={service.serviceName}
															fill
															unoptimized
															sizes="44px"
															className="object-cover"
														/>
													) : null}
												</div>
												<span className="font-medium">{service.serviceName}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{service.category}</Badge>
										</TableCell>
										<TableCell>{formatCurrency(Number(service.price))}</TableCell>
										<TableCell>{formatDuration(Number(service.duration))}</TableCell>
										<TableCell>
											<StatusBadge value={service.status} type="transaction" />
										</TableCell>
										<TableCell>
											<Switch
												checked={service.status === "active"}
												disabled={updatingId === service._id}
												onCheckedChange={() => void toggleStatus(service)}
												aria-label={`Toggle active status for ${service.serviceName}`}
											/>
											{updatingId === service._id ? (
												<Loader2 className="mt-1 h-3 w-3 animate-spin" />
											) : null}
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-1">
												<Button asChild variant="ghost" size="icon">
													<Link
														href={`/dashboard/admin/services/${service._id}/edit`}
														aria-label={`Edit ${service.serviceName}`}
													>
														<Pencil />
													</Link>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive"
													aria-label={`Delete ${service.serviceName}`}
													onClick={() => setDeleteTarget(service)}
												>
													<Trash2 />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<EmptyState
							title="No matching services"
							description="Try a different search term."
						/>
					)}
				</Card>
			)}

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this service?</AlertDialogTitle>
						<AlertDialogDescription>
							“{deleteTarget?.serviceName}” will be permanently removed. Existing
							appointments will keep their recorded service price.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleting}
							onClick={(event) => {
								event.preventDefault();
								void confirmDelete();
							}}
						>
							{deleting ? <Loader2 className="animate-spin" /> : null}
							Delete service
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
