"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import {
	asArray,
	appointmentCustomerOf,
	appointmentServiceOf,
	transactionAppointmentOf,
} from "@/lib/data";
import { formatCurrency, formatDate, shortRef } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataError, EmptyState, PageHeader } from "@/components/dashboard/dashboard-parts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function TransactionManager() {
	const [search, setSearch] = useState("");

	const {
		data: transactions,
		loading,
		error,
		reload,
	} = useAsyncData<Transaction[]>(
		async () => asArray<Transaction>(await api.get<unknown>("/api/admin/transactions")),
		[],
	);

	const visible = useMemo(() => {
		const query = search.trim().toLowerCase();
		return [...(transactions || [])]
			.filter((transaction) => {
				if (!query) return true;
				const customer = transaction.customer || appointmentCustomerOf(
					transactionAppointmentOf(transaction),
				);
				return [customer?.name, customer?.email, transaction.stripeSessionId]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(query));
			})
			.sort(
				(a, b) =>
					new Date(b.createdAt || 0).getTime() -
					new Date(a.createdAt || 0).getTime(),
			);
	}, [transactions, search]);

	const total = (transactions || [])
		.filter((transaction) => transaction.status === "paid")
		.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

	return (
		<>
			<PageHeader
				title="Transactions"
				description="Read-only Stripe payment records, updated by verified webhooks."
			/>

			<div className="mb-6 flex items-center gap-3 rounded-xl border bg-card p-4 text-sm">
				<ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
				<p className="text-muted-foreground">
					Successful payments total:{" "}
					<span className="font-semibold text-foreground">
						{formatCurrency(total)}
					</span>
				</p>
			</div>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : !transactions?.length ? (
				<EmptyState
					title="No transactions yet"
					description="Payments from confirmed appointments will appear here."
				/>
			) : (
				<Card className="overflow-hidden">
					<div className="border-b p-4">
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search transactions..."
							className="max-w-sm"
							aria-label="Search transactions"
						/>
					</div>
					{visible.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Customer</TableHead>
									<TableHead>Service</TableHead>
									<TableHead>Appointment</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Session</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{visible.map((transaction) => {
									const appointment = transactionAppointmentOf(transaction);
									const customer =
										transaction.customer ||
										appointmentCustomerOf(appointment) ||
										null;
									const service =
										transaction.service ||
										appointmentServiceOf(appointment) ||
										null;
									return (
										<TableRow key={transaction._id}>
											<TableCell>
												<p className="font-medium">{customer?.name || "Customer"}</p>
												<p className="text-xs text-muted-foreground">
													{customer?.email || "—"}
												</p>
											</TableCell>
											<TableCell>{service?.serviceName || "Service"}</TableCell>
											<TableCell className="whitespace-nowrap">
												{appointment
													? formatDate(appointment.appointmentDate)
													: "—"}
											</TableCell>
											<TableCell className="font-medium">
												{formatCurrency(
													Number(transaction.amount),
													transaction.currency || "USD",
												)}
											</TableCell>
											<TableCell className="font-mono text-xs text-muted-foreground">
												{shortRef(transaction.stripeSessionId, 16)}
											</TableCell>
											<TableCell>
												<StatusBadge
													value={transaction.status}
													type="transaction"
												/>
											</TableCell>
											<TableCell className="whitespace-nowrap text-xs text-muted-foreground">
												{formatDate(transaction.createdAt)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					) : (
						<EmptyState title="No matching transactions" description="Try another search." />
					)}
				</Card>
			)}
		</>
	);
}
