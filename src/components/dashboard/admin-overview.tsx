"use client";

import Link from "next/link";
import {
	CalendarCheck2,
	CalendarClock,
	CalendarX2,
	CircleDollarSign,
	Scissors,
	UsersRound,
} from "lucide-react";
import { api } from "@/lib/api";
import {
	asArray,
	asRecord,
	appointmentServiceOf,
	appointmentCustomerOf,
	numberFrom,
	readStats,
} from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
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

export function AdminOverview() {
	const {
		data: stats,
		loading,
		error,
		reload,
	} = useAsyncData<Record<string, unknown>>(async () => {
		const payload = await api.get<unknown>("/api/admin/dashboard");
		return readStats(payload);
	}, []);

	const {
		data: recent,
		loading: recentLoading,
	} = useAsyncData<Appointment[]>(async () => {
		const payload = await api.get<unknown>("/api/admin/dashboard");
		const record = asRecord(payload);
		return asArray<Appointment>(record?.recentAppointments ?? []);
	}, []);

	const values = {
		customers: numberFrom(stats?.totalCustomers ?? stats?.customers),
		activeServices: numberFrom(
			stats?.totalActiveServices ?? stats?.activeServices,
		),
		appointments: numberFrom(stats?.totalAppointments ?? stats?.appointments),
		pending: numberFrom(stats?.pendingAppointments ?? stats?.pending),
		confirmed: numberFrom(stats?.confirmedAppointments ?? stats?.confirmed),
		payments: numberFrom(
			stats?.totalSuccessfulPayments ??
				stats?.successfulPayments ??
				stats?.successfulPaymentsCount,
		),
		revenue: numberFrom(stats?.totalRevenue ?? stats?.revenue),
	};

	return (
		<>
			<PageHeader
				title="Dashboard overview"
				description="A quick look at customers, services, appointments and payments."
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/admin/services">Manage services</Link>
					</Button>
				}
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} className="h-28 rounded-xl" />
					))}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<StatCard
						label="Registered customers"
						value={values.customers}
						icon={UsersRound}
					/>
					<StatCard
						label="Active services"
						value={values.activeServices}
						icon={Scissors}
					/>
					<StatCard
						label="Total appointments"
						value={values.appointments}
						icon={CalendarCheck2}
					/>
					<StatCard
						label="Pending"
						value={values.pending}
						icon={CalendarClock}
						hint="Need your review"
					/>
					<StatCard
						label="Confirmed"
						value={values.confirmed}
						icon={CalendarCheck2}
					/>
					<StatCard
						label="Successful payments"
						value={values.payments}
						icon={CircleDollarSign}
						hint={formatCurrency(values.revenue) + " collected"}
					/>
				</div>
			)}

			<Card className="mt-6">
				<CardHeader className="flex flex-row items-center justify-between gap-3">
					<div>
						<CardTitle>Recent appointment requests</CardTitle>
						<CardDescription>The newest requests across the salon.</CardDescription>
					</div>
					<Button asChild variant="link" size="sm">
						<Link href="/dashboard/admin/appointments">View all</Link>
					</Button>
				</CardHeader>
				<CardContent>
					{recentLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={index} className="h-12 w-full" />
							))}
						</div>
					) : recent?.length ? (
						<div className="divide-y">
							{recent.slice(0, 6).map((appointment) => {
								const customer = appointmentCustomerOf(appointment);
								const service = appointmentServiceOf(appointment);
								return (
									<div
										key={appointment._id}
										className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
									>
										<div>
											<p className="font-medium">
												{customer?.name || "Customer"}
											</p>
											<p className="text-xs text-muted-foreground">
												{service?.serviceName || "Service"} ·{" "}
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
							title="No recent requests"
							description="New appointment requests will show up here."
							action={
								<Button asChild variant="outline" size="sm">
									<Link href="/dashboard/admin/appointments">
										<CalendarX2 /> Open appointment manager
									</Link>
								</Button>
							}
						/>
					)}
				</CardContent>
			</Card>
		</>
	);
}
