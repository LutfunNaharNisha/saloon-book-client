import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: string;
	actions?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
			<div>
				<h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
				{description ? (
					<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
		</div>
	);
}

export function StatCard({
	label,
	value,
	icon: Icon,
	hint,
}: {
	label: string;
	value: string | number;
	icon: LucideIcon;
	hint?: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-start justify-between gap-3 p-5">
				<div className="min-w-0">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{label}
					</p>
					<p className="mt-2 truncate font-display text-2xl font-semibold">{value}</p>
					{hint ? (
						<p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
					) : null}
				</div>
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon className="h-5 w-5" />
				</span>
			</CardContent>
		</Card>
	);
}

export function DataError({
	message,
	onRetry,
}: {
	message: string;
	onRetry?: () => void;
}) {
	return (
		<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
			<AlertCircle className="mx-auto h-8 w-8 text-destructive" />
			<p className="mt-3 font-medium">Unable to load this data</p>
			<p className="mt-1 text-sm text-muted-foreground">{message}</p>
			{onRetry ? (
				<Button className="mt-4" variant="outline" onClick={onRetry}>
					<RotateCcw /> Try again
				</Button>
			) : null}
		</div>
	);
}

export function EmptyState({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<div className="rounded-xl border border-dashed p-10 text-center">
			<Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
			<p className="mt-3 font-display text-base font-semibold">{title}</p>
			{description ? (
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			) : null}
			{action ? <div className="mt-4 flex justify-center">{action}</div> : null}
		</div>
	);
}
