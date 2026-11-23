"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { asArray, appointmentServiceOf, getErrorMessage } from "@/lib/data";
import { formatCurrency, formatDate, formatDateTime, titleCase } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { PayNowButton } from "@/components/payments/pay-now-button";
import { DataError, EmptyState, PageHeader } from "@/components/dashboard/dashboard-parts";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function CustomerAppointments() {
	const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
	const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
	const [cancelling, setCancelling] = useState(false);

	const {
		data: appointments,
		loading,
		error,
		reload,
		setData,
	} = useAsyncData<Appointment[]>(
		async () => asArray<Appointment>(await api.get<unknown>("/api/appointments/my-appointments")),
		[],
	);

	const sorted = useMemo(
		() =>
			[...(appointments || [])].sort(
				(a, b) =>
					new Date(b.createdAt || 0).getTime() -
					new Date(a.createdAt || 0).getTime(),
			),
		[appointments],
	);

	const confirmCancel = async () => {
		if (!cancelTarget) return;
		setCancelling(true);
		try {
			await api.patch(`/api/appointments/${cancelTarget._id}/cancel`);
			setData((current) =>
				(current || []).map((item) =>
					item._id === cancelTarget._id
						? { ...item, status: "cancelled" as const }
						: item,
				),
			);
			toast.success("Appointment request cancelled.");
			setCancelTarget(null);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to cancel this appointment."));
		} finally {
			setCancelling(false);
		}
	};

	return (
		<>
			<PageHeader
				title="My appointments"
				description="Track every request, confirm payments and manage your bookings."
				actions={
					<Button asChild variant="outline">
						<Link href="/services">Book another service</Link>
					</Button>
				}
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton key={index} className="h-20 w-full rounded-xl" />
					))}
				</div>
			) : !sorted.length ? (
				<EmptyState
					title="No appointments yet"
					description="Browse our services and request your first salon visit."
					action={
						<Button asChild>
							<Link href="/services">Explore services</Link>
						</Button>
					}
				/>
			) : (
				<>
					{/* Desktop table */}
					<div className="hidden overflow-hidden rounded-xl border bg-card lg:block">
						<Table>
							<TableHeader>
								<TableRow>
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
								{sorted.map((appointment) => {
									const service = appointmentServiceOf(appointment);
									return (
										<TableRow key={appointment._id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
														{service?.image ? (
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
													<div className="min-w-0">
														<p className="truncate font-medium">
															{service?.serviceName || "Service"}
														</p>
														<p className="text-xs text-muted-foreground">
															{service?.category || "—"}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<p className="whitespace-nowrap text-sm">
													{formatDate(appointment.appointmentDate)}
												</p>
												<p className="text-xs text-muted-foreground">
													{appointment.timeSlot}
												</p>
											</TableCell>
											<TableCell className="font-medium">
												{formatCurrency(Number(appointment.servicePrice))}
											</TableCell>
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
												<div className="flex justify-end gap-1.5">
													<Button
														variant="ghost"
														size="icon"
														aria-label="View appointment details"
														onClick={() => setDetailsTarget(appointment)}
													>
														<Eye />
													</Button>
													{appointment.status === "confirmed" &&
													appointment.paymentStatus !== "paid" ? (
														<PayNowButton appointment={appointment} />
													) : null}
													{appointment.status === "pending" ? (
														<Button
															variant="ghost"
															size="icon"
															className="text-destructive hover:text-destructive"
															aria-label="Cancel pending appointment"
															onClick={() => setCancelTarget(appointment)}
														>
															<XCircle />
														</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Mobile cards */}
					<div className="space-y-3 lg:hidden">
						{sorted.map((appointment) => {
							const service = appointmentServiceOf(appointment);
							return (
								<div key={appointment._id} className="rounded-xl border bg-card p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-center gap-3">
											<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
												{service?.image ? (
													<Image
														src={service.image}
														alt={service.serviceName}
														fill
														unoptimized
														sizes="48px"
														className="object-cover"
													/>
												) : null}
											</div>
											<div className="min-w-0">
												<p className="truncate font-medium">
													{service?.serviceName || "Service"}
												</p>
												<p className="text-xs text-muted-foreground">
													{service?.category || "—"}
												</p>
											</div>
										</div>
										<StatusBadge value={appointment.status} />
									</div>
									<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
										<p>
											<span className="text-muted-foreground">Date: </span>
											{formatDate(appointment.appointmentDate)}
										</p>
										<p>
											<span className="text-muted-foreground">Time: </span>
											{appointment.timeSlot}
										</p>
										<p>
											<span className="text-muted-foreground">Price: </span>
											{formatCurrency(Number(appointment.servicePrice))}
										</p>
										<p className="flex items-center gap-1.5">
											<span className="text-muted-foreground">Payment:</span>
											<StatusBadge
												value={appointment.paymentStatus}
												type="payment"
											/>
										</p>
									</div>
									<div className="mt-3 flex flex-wrap gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setDetailsTarget(appointment)}
										>
											<Eye /> Details
										</Button>
										{appointment.status === "confirmed" &&
										appointment.paymentStatus !== "paid" ? (
											<PayNowButton appointment={appointment} />
										) : null}
										{appointment.status === "pending" ? (
											<Button
												variant="ghost"
												size="sm"
												className="text-destructive hover:text-destructive"
												onClick={() => setCancelTarget(appointment)}
											>
												<XCircle /> Cancel
											</Button>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}

			<AlertDialog
				open={Boolean(cancelTarget)}
				onOpenChange={(open) => !open && setCancelTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
						<AlertDialogDescription>
							This will cancel your pending request for{" "}
							{appointmentServiceOf(cancelTarget)?.serviceName || "this service"} on{" "}
							{formatDate(cancelTarget?.appointmentDate)}. This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={cancelling}>Keep request</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={cancelling}
							onClick={(event) => {
								event.preventDefault();
								void confirmCancel();
							}}
						>
							{cancelling ? <Loader2 className="animate-spin" /> : null}
							Cancel appointment
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
						<DialogDescription>Your booking request information.</DialogDescription>
					</DialogHeader>
					{detailsTarget ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between gap-3">
								<p className="font-medium">
									{appointmentServiceOf(detailsTarget)?.serviceName || "Service"}
								</p>
								<Badge variant="outline">
									{appointmentServiceOf(detailsTarget)?.category || "Salon service"}
								</Badge>
							</div>
							<dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-muted/50 p-4 text-sm">
								<div>
									<dt className="text-muted-foreground">Date</dt>
									<dd className="font-medium">
										{formatDate(detailsTarget.appointmentDate)}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Time slot</dt>
									<dd className="font-medium">{detailsTarget.timeSlot}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Price</dt>
									<dd className="font-medium">
										{formatCurrency(Number(detailsTarget.servicePrice))}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Requested on</dt>
									<dd className="font-medium">
										{formatDateTime(detailsTarget.createdAt)}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Status</dt>
									<dd className="mt-1">
										<StatusBadge value={detailsTarget.status} />
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Payment</dt>
									<dd className="mt-1">
										<StatusBadge
											value={detailsTarget.paymentStatus}
											type="payment"
										/>
									</dd>
								</div>
							</dl>
							{detailsTarget.message ? (
								<div>
									<p className="text-sm font-medium">Your message</p>
									<p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
										{detailsTarget.message}
									</p>
								</div>
							) : null}
							<p className="text-xs text-muted-foreground">
								Reference: {titleCase(detailsTarget._id?.slice(-8) || "—")}
							</p>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
