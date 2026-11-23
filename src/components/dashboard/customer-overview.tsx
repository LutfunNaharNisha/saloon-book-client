"use client";

import Link from "next/link";
import { CalendarCheck2, CalendarX2, Clock3, WalletCards } from "lucide-react";
import { api } from "@/lib/api";
import {
	asArray,
	asRecord,
	appointmentServiceOf,
	getErrorMessage,
	numberFrom,
	readStats,
	transactionAppointmentOf,
} from "@/lib/data";
import { formatCurrency, formatDate, shortRef } from "@/lib/format";
import type { Appointment, CustomerStats, Transaction } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/components/auth/auth-provider";
import { DataError, EmptyState, PageHeader, StatCard } from "./dashboard-parts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardPayload = {
	stats?: unknown;
	appointments?: Appointment[];
	transactions?: Transaction[];
};

const computeStats = (appointments: Appointment[]): CustomerStats => ({
	totalAppointments: appointments.length,
	pendingCount: appointments.filter((item) => item.status === "pending").length,
	confirmedCount: appointments.filter((item) => item.status === "confirmed").length,
	cancelledCount: appointments.filter((item) => item.status === "cancelled").length,
	totalSpent: appointments
		.filter((item) => item.paymentStatus === "paid")
		.reduce((sum, item) => sum + Number(item.servicePrice || 0), 0),
});

export function CustomerOverview() {
	const { user } = useAuth();

	const {
		data,
		loading,
		error,
		reload,
	} = useAsyncData<DashboardPayload>(async () => {
		try {
			const payload = await api.get<unknown>("/api/appointments/dashboard");
			if (Array.isArray(payload)) {
				const appointments = asArray<Appointment>(payload);
				return { appointments, stats: computeStats(appointments) };
			}
			const record = asRecord(payload);
			if (!record) return { appointments: [], stats: computeStats([]) };
			const appointments = asArray<Appointment>(
				record.appointments ?? payload,
			);
			const transactions = asArray<Transaction>(record.transactions ?? []);
			return {
				appointments,
				transactions,
				stats: (record.stats as DashboardPayload["stats"]) ||
					computeStats(appointments),
			};
		} catch (dashboardError) {
			try {
				const fallback = asArray<Appointment>(
					await api.get<unknown>("/api/appointments/my-appointments"),
				);
				return { appointments: fallback, stats: computeStats(fallback) };
			} catch {
				throw dashboardError;
			}
		}
	}, []);

	const { data: payments } = useAsyncData<Transaction[]>(
		async () =>
			asArray<Transaction>(await api.get<unknown>("/api/payments/my-transactions")),
		[],
	);

	const rawStats = readStats(data?.stats || data);
	const appointments = data?.appointments || [];
	const transactions = payments?.length ? payments : data?.transactions || [];
	const stats: CustomerStats = {
		totalAppointments: numberFrom(
			rawStats.totalAppointments ?? rawStats.total ?? appointments.length,
		),
		pendingCount: numberFrom(
			rawStats.pendingCount ?? rawStats.pendingAppointments ?? rawStats.pending,
		),
		confirmedCount: numberFrom(
			rawStats.confirmedCount ??
				rawStats.confirmedAppointments ??
				rawStats.confirmed,
		),
		cancelledCount: numberFrom(
			rawStats.cancelledCount ??
				rawStats.cancelledAppointments ??
				rawStats.cancelled,
		),
		totalSpent: numberFrom(rawStats.totalSpent ?? rawStats.totalRevenue),
	};

	return (
		<>
			<PageHeader
				title={`Hello, ${user?.name?.split(" ")[0] || "there"}`}
				description="Here is the latest on your salon bookings and payments."
				actions={
					<Button asChild>
						<Link href="/services">Book a service</Link>
					</Button>
				}
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} className="h-28 rounded-xl" />
						))}
					</div>
					<Skeleton className="h-72 rounded-xl" />
				</div>
			) : (
				<div className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label="Total requests"
							value={stats.totalAppointments}
							icon={CalendarCheck2}
							hint="All time"
						/>
						<StatCard
							label="Pending"
							value={stats.pendingCount}
							icon={Clock3}
							hint="Awaiting confirmation"
						/>
						<StatCard
							label="Confirmed"
							value={stats.confirmedCount}
							icon={CalendarCheck2}
							hint="Ready to attend"
						/>
						<StatCard
							label="Cancelled"
							value={stats.cancelledCount}
							icon={CalendarX2}
							hint="Closed requests"
						/>
					</div>

					<div className="grid gap-6 xl:grid-cols-3">
						<Card className="xl:col-span-2">
							<CardHeader className="flex flex-row items-center justify-between gap-3">
								<div>
									<CardTitle>Recent appointments</CardTitle>
									<CardDescription>Your latest booking requests.</CardDescription>
								</div>
								<Button asChild variant="link" size="sm">
									<Link href="/dashboard/customer/appointments">View all</Link>
								</Button>
							</CardHeader>
							<CardContent>
								{appointments.length ? (
									<div className="divide-y">
										{appointments.slice(0, 5).map((appointment) => {
											const service = appointmentServiceOf(appointment);
											return (
												<div
													key={appointment._id}
													className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
												>
													<div>
														<p className="font-medium">
															{service?.serviceName || "Service"}
														</p>
														<p className="text-xs text-muted-foreground">
															{formatDate(appointment.appointmentDate)} ·{" "}
															{appointment.timeSlot}
														</p>
													</div>
													<div className="flex items-center gap-3">
														<span className="text-sm font-medium">
															{formatCurrency(Number(appointment.servicePrice))}
														</span>
														<StatusBadge value={appointment.status} />
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<EmptyState
										title="No appointments yet"
										description="Your booking requests will appear here."
									/>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Payment summary</CardTitle>
								<CardDescription>Your confirmed appointment spend.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg bg-primary/5 p-5">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">
										Total spent
									</p>
									<p className="mt-1 font-display text-3xl font-semibold text-primary">
										{formatCurrency(stats.totalSpent)}
									</p>
								</div>
								<div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
									<WalletCards className="h-5 w-5 shrink-0 text-primary" />
									<p className="text-muted-foreground">
										Payments become available once an administrator confirms your
										appointment. Stripe checkout keeps them secure.
									</p>
								</div>
								<div>
									<p className="mb-2 text-sm font-medium">Recent payments</p>
									{transactions.length ? (
										<div className="divide-y rounded-lg border">
											{transactions.slice(0, 4).map((transaction) => {
												const appointment = transactionAppointmentOf(transaction);
												const service = appointmentServiceOf(appointment);
												return (
													<div
														key={transaction._id}
														className="flex items-center justify-between gap-3 p-3"
													>
														<div className="min-w-0">
															<p className="truncate text-sm font-medium">
																{service?.serviceName || "Salon service"}
															</p>
															<p className="truncate font-mono text-[11px] text-muted-foreground">
																{shortRef(transaction.stripeSessionId, 14)} ·{" "}
																{formatDate(transaction.createdAt)}
															</p>
														</div>
														<div className="flex shrink-0 flex-col items-end gap-1">
															<span className="text-sm font-medium">
																{formatCurrency(
																	Number(transaction.amount),
																	transaction.currency || "USD",
																)}
															</span>
															<StatusBadge
																value={transaction.status}
																type="transaction"
															/>
														</div>
													</div>
												);
											})}
										</div>
									) : (
										<p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
											No payments recorded yet.
										</p>
									)}
								</div>
								<Button asChild variant="outline" className="w-full">
									<Link href="/dashboard/customer/appointments">
										Manage appointments
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</>
	);
}

export function CustomerOverviewLoadError({ error }: { error: unknown }) {
	return <p className="text-sm text-destructive">{getErrorMessage(error)}</p>;
}
