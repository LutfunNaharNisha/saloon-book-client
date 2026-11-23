"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock3, ShieldAlert, Tag } from "lucide-react";
import { api } from "@/lib/api";
import { asRecord, getErrorMessage } from "@/lib/data";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/components/auth/auth-provider";
import { BookingForm } from "@/components/appointments/booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceDetail({ id }: { id: string }) {
	const { isAdmin } = useAuth();
	const [bookingOpen, setBookingOpen] = useState(false);

	const {
		data: service,
		loading,
		error,
	} = useAsyncData<Service | null>(async () => {
		const payload = await api.get<unknown>(`/api/services/${id}`);
		const record = asRecord(payload);
		const candidate = (record?.service as Service | undefined) ?? (payload as Service);
		return candidate?._id ? candidate : null;
	}, [id]);

	if (loading) {
		return (
			<div className="container grid gap-8 py-10 lg:grid-cols-2">
				<Skeleton className="aspect-[4/3] w-full rounded-xl" />
				<div className="space-y-4">
					<Skeleton className="h-5 w-28" />
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-12 w-full" />
				</div>
			</div>
		);
	}

	if (error || !service) {
		return (
			<div className="container py-16">
				<Card className="mx-auto max-w-xl text-center">
					<CardHeader>
						<AlertCircle className="mx-auto h-9 w-9 text-destructive" />
						<CardTitle className="mt-3">Service not available</CardTitle>
						<CardDescription>
							{error
								? getErrorMessage(error, "We could not load this service.")
								: "We could not find a service with this ID. It may have been removed."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href="/services">
								<ArrowLeft /> Back to services
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const inactive = service.status === "inactive";

	return (
		<div className="container py-8 md:py-12">
			<Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
				<Link href="/services">
					<ArrowLeft /> All services
				</Link>
			</Button>

			<div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
				<div className="space-y-6">
					<div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
						{service.image ? (
							<Image
								src={service.image}
								alt={service.serviceName}
								fill
								unoptimized
								priority
								sizes="(max-width: 1024px) 100vw, 55vw"
								className="object-cover"
							/>
						) : (
							<div className="flex h-full items-center justify-center text-muted-foreground">
								Image coming soon
							</div>
						)}
					</div>

					<Card>
						<CardHeader>
							<CardTitle>About this service</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
								{service.description}
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-5 lg:sticky lg:top-24">
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">{service.category}</Badge>
							<Badge variant={inactive ? "destructive" : "success"}>
								{inactive ? "Inactive" : "Available"}
							</Badge>
						</div>
						<h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
							{service.serviceName}
						</h1>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<Tag className="h-5 w-5 text-primary" />
								<div>
									<p className="text-xs text-muted-foreground">Price</p>
									<p className="font-display text-lg font-semibold">
										{formatCurrency(Number(service.price))}
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<Clock3 className="h-5 w-5 text-primary" />
								<div>
									<p className="text-xs text-muted-foreground">Duration</p>
									<p className="font-display text-lg font-semibold">
										{formatDuration(Number(service.duration))}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Book this service</CardTitle>
							<CardDescription>
								Select a date and time — our team will review your request.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isAdmin ? (
								<div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
									<ShieldAlert className="h-5 w-5 shrink-0" />
									<p>
										Admin accounts cannot submit customer appointment requests. Use
										the admin dashboard to manage bookings instead.
									</p>
								</div>
							) : inactive ? (
								<div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
									<AlertCircle className="h-5 w-5 shrink-0" />
									<p>This service is currently inactive and cannot be booked.</p>
								</div>
							) : bookingOpen ? (
								<BookingForm service={service} />
							) : (
								<Button
									size="lg"
									className="w-full"
									onClick={() => setBookingOpen(true)}
								>
									Request appointment
								</Button>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
