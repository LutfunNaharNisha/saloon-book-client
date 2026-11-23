"use client";

import { useMemo, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
	asArray,
	appointmentCustomerOf,
	appointmentServiceOf,
	getErrorMessage,
} from "@/lib/data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { Appointment, AppointmentStatus } from "@/lib/types";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type StatusAction = { appointment: Appointment; status: Extract<AppointmentStatus, "confirmed" | "cancelled"> };

export function AppointmentManager() {
	const [search, setSearch] = useState("");
	const [statusTarget, setStatusTarget] = useState<StatusAction | null>(null);
	const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
	const [updating, setUpdating] = useState(false);

	const {
		data: appointments,
		loading,
		error,
		reload,
		setData,
	} = useAsyncData<Appointment[]>(
		async () => asArray<Appointment>(await api.get<unknown>("/api/admin/appointments")),
		[],
	);

	const visible = useMemo(() => {
		const query = search.trim().toLowerCase();
		return [...(appointments || [])]
			.filter((appointment) => {
				if (!query) return true;
				const customer = appointmentCustomerOf(appointment);
				const service = appointmentServiceOf(appointment);
				return [customer?.name, customer?.email, service?.serviceName]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(query));
			})
			.sort(
				(a, b) =>
					new Date(b.createdAt || 0).getTime() -
					new Date(a.createdAt || 0).getTime(),
			);
	}, [appointments, search]);

	const updateStatus = async () => {
		if (!statusTarget) return;
		setUpdating(true);
		try {
			await api.patch(
				`/api/admin/appointments/${statusTarget.appointment._id}/status`,
				{ status: statusTarget.status },
			);
			setData((current) =>
				(current || []).map((item) =>
					item._id === statusTarget.appointment._id
						? {
								...item,
								status: statusTarget.status,
							}
						: item,
				),
			);
			toast.success(
				statusTarget.status === "confirmed"
					? "Appointment confirmed."
					: "Appointment cancelled.",
			);
			setStatusTarget(null);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to update appointment status."));
		} finally {
			setUpdating(false);
		}
	};

	return (
		<>
			<PageHeader
				title="Manage appointments"
				description="Review requests, confirm bookings and cancel appointments when needed."
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : !appointments?.length ? (
				<EmptyState
					title="No appointment requests"
					description="Customer booking requests will appear here."
				/>
			) : (
				<Card className="overflow-hidden">
					<div className="border-b p-4">
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by customer or service..."
							className="max-w-sm"
							aria-label="Search appointments"
						/>
					</div>
					{visible.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Customer</TableHead>
									<TableHead>Service</TableHead>
									<TableHead>Appointment</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Payment</TableHead>
									<TableHead>Requested</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{visible.map((appointment) => {
									const customer = appointmentCustomerOf(appointment);
									const service = appointmentServiceOf(appointment);
									return (
										<TableRow key={appointment._id}>
											<TableCell>
												<p className="font-medium">{customer?.name || "Customer"}</p>
												<p className="text-xs text-muted-foreground">
													{customer?.email || "—"}
												</p>
											</TableCell>
											<TableCell>
												<p className="font-medium">
													{service?.serviceName || "Service"}
												</p>
												<p className="text-xs text-muted-foreground">
													{service?.category || "—"}
												</p>
											</TableCell>
											<TableCell className="whitespace-nowrap">
												<p className="text-sm">{formatDate(appointment.appointmentDate)}</p>
												<p className="text-xs text-muted-foreground">
													{appointment.timeSlot}
												</p>
											</TableCell>
											<TableCell>{formatCurrency(Number(appointment.servicePrice))}</TableCell>
											<TableCell>
												<StatusBadge value={appointment.status} />
											</TableCell>
											<TableCell>
												<StatusBadge
													value={appointment.paymentStatus}
													type="payment"
												/>
											</TableCell>
											<TableCell className="whitespace-nowrap text-xs text-muted-foreground">
												{formatDate(appointment.createdAt)}
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														aria-label="View appointment details"
														onClick={() => setDetailsTarget(appointment)}
													>
														<Eye />
													</Button>
													{appointment.status === "pending" ? (
														<Button
															size="sm"
															onClick={() =>
																setStatusTarget({
																	appointment,
																	status: "confirmed",
																})
															}
														>
															Confirm
														</Button>
													) : null}
													{appointment.status === "pending" ||
													appointment.status === "confirmed" ? (
														<Button
															size="sm"
															variant="outline"
															className="text-destructive hover:text-destructive"
															onClick={() =>
																setStatusTarget({
																	appointment,
																	status: "cancelled",
																})
															}
														>
															Cancel
														</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					) : (
						<EmptyState title="No matching appointments" description="Try another search." />
					)}
				</Card>
			)}

			<AlertDialog
				open={Boolean(statusTarget)}
				onOpenChange={(open) => !open && setStatusTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{statusTarget?.status === "confirmed"
								? "Confirm this appointment?"
								: "Cancel this appointment?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{statusTarget?.status === "confirmed"
								? "The customer will be able to pay for this confirmed appointment."
								: "This will close the appointment and prevent payment. This action cannot be undone."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={updating}>Go back</AlertDialogCancel>
						<AlertDialogAction
							className={
								statusTarget?.status === "cancelled"
									? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
									: undefined
							}
							disabled={updating}
							onClick={(event) => {
								event.preventDefault();
								void updateStatus();
							}}
						>
							{updating ? <Loader2 className="animate-spin" /> : null}
							{statusTarget?.status === "confirmed" ? "Confirm" : "Cancel appointment"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog
				open={Boolean(detailsTarget)}
				onOpenChange={(open) => !open && setDetailsTarget(null)}
			>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Appointment details</DialogTitle>
						<DialogDescription>Full request information.</DialogDescription>
					</DialogHeader>
					{detailsTarget ? (
						<div className="space-y-4">
							<div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
								<div>
									<p className="text-muted-foreground">Customer</p>
									<p className="font-medium">
										{appointmentCustomerOf(detailsTarget)?.name || "Customer"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Email</p>
									<p className="font-medium">
										{appointmentCustomerOf(detailsTarget)?.email || "—"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Phone</p>
									<p className="font-medium">
										{appointmentCustomerOf(detailsTarget)?.phone || "—"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Service</p>
									<p className="font-medium">
										{appointmentServiceOf(detailsTarget)?.serviceName || "Service"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Date & time</p>
									<p className="font-medium">
										{formatDate(detailsTarget.appointmentDate)} ·{" "}
										{detailsTarget.timeSlot}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Price</p>
									<p className="font-medium">
										{formatCurrency(Number(detailsTarget.servicePrice))}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<StatusBadge value={detailsTarget.status} />
								<StatusBadge
									value={detailsTarget.paymentStatus}
									type="payment"
								/>
								<Badge variant="outline">
									Requested {formatDateTime(detailsTarget.createdAt)}
								</Badge>
							</div>
							{detailsTarget.message ? (
								<div>
									<p className="text-sm font-medium">Customer message</p>
									<p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
										{detailsTarget.message}
									</p>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									No additional message was provided.
								</p>
							)}
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
