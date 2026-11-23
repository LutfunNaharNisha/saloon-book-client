"use client";

import { useMemo, useState } from "react";
import { Loader2, UserRoundX, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { asArray, getErrorMessage } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";
import type { Customer } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataError, EmptyState, PageHeader } from "@/components/dashboard/dashboard-parts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type AdminCustomer = Customer & { id?: string };
const idOf = (customer: AdminCustomer) => customer._id || customer.id || "";

export function CustomerManager() {
	const [search, setSearch] = useState("");
	const [blockTarget, setBlockTarget] = useState<AdminCustomer | null>(null);
	const [updating, setUpdating] = useState(false);

	const {
		data: customers,
		loading,
		error,
		reload,
		setData,
	} = useAsyncData<AdminCustomer[]>(
		async () => asArray<AdminCustomer>(await api.get<unknown>("/api/admin/customers")),
		[],
	);

	const visible = useMemo(() => {
		const query = search.trim().toLowerCase();
		return (customers || []).filter(
			(customer) =>
				!query ||
				customer.name?.toLowerCase().includes(query) ||
				customer.email?.toLowerCase().includes(query),
		);
	}, [customers, search]);

	const confirmBlock = async () => {
		if (!blockTarget) return;
		const nextBlocked = !blockTarget.isBlocked;
		setUpdating(true);
		try {
			await api.patch(`/api/admin/customers/${idOf(blockTarget)}/block`, {
				isBlocked: nextBlocked,
			});
			setData((current) =>
				(current || []).map((customer) =>
					idOf(customer) === idOf(blockTarget)
						? { ...customer, isBlocked: nextBlocked }
						: customer,
				),
			);
			toast.success(
				nextBlocked
					? "Customer blocked from protected features."
					: "Customer access restored.",
			);
			setBlockTarget(null);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to update this customer."));
		} finally {
			setUpdating(false);
		}
	};

	return (
		<>
			<PageHeader
				title="Manage users"
				description="View registered customers and control access to protected features."
			/>

			{error ? (
				<DataError message={error} onRetry={() => void reload()} />
			) : loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : !customers?.length ? (
				<EmptyState
					title="No customers yet"
					description="Registered customers will appear here."
				/>
			) : (
				<Card className="overflow-hidden">
					<div className="border-b p-4">
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search customers by name or email..."
							className="max-w-sm"
							aria-label="Search customers"
						/>
					</div>
					{visible.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Customer</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Appointments</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{visible.map((customer) => (
									<TableRow key={idOf(customer)}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9">
													{customer.image ? (
														<AvatarImage src={customer.image} alt={customer.name} />
													) : null}
													<AvatarFallback className="text-xs">
														{initials(customer.name)}
													</AvatarFallback>
												</Avatar>
												<div className="min-w-0">
													<p className="truncate font-medium">{customer.name}</p>
													<p className="truncate text-xs text-muted-foreground">
														{customer.email}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>{customer.phone || "—"}</TableCell>
										<TableCell>{customer.appointmentCount ?? "—"}</TableCell>
										<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
											{formatDate(customer.createdAt)}
										</TableCell>
										<TableCell>
											<Badge variant={customer.isBlocked ? "destructive" : "success"}>
												{customer.isBlocked ? "Blocked" : "Active"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button
												size="sm"
												variant={customer.isBlocked ? "outline" : "destructive"}
												onClick={() => setBlockTarget(customer)}
											>
												{customer.isBlocked ? (
													<>
														<UserRoundCheck /> Unblock
													</>
												) : (
													<>
														<UserRoundX /> Block
													</>
												)}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<EmptyState title="No matching customers" description="Try another search." />
					)}
				</Card>
			)}

			<AlertDialog
				open={Boolean(blockTarget)}
				onOpenChange={(open) => !open && setBlockTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{blockTarget?.isBlocked ? "Unblock this customer?" : "Block this customer?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{blockTarget?.isBlocked
								? `${blockTarget.name} will regain access to protected features.`
								: `${blockTarget?.name} will no longer be able to access the dashboard or booking features.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className={
								blockTarget?.isBlocked
									? undefined
									: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
							}
							disabled={updating}
							onClick={(event) => {
								event.preventDefault();
								void confirmBlock();
							}}
						>
							{updating ? <Loader2 className="animate-spin" /> : null}
							{blockTarget?.isBlocked ? "Unblock customer" : "Block customer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
