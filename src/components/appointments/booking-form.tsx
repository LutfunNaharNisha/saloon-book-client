"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/data";
import { TIME_SLOTS } from "@/lib/constants";
import { formatCurrency, formatDate, todayInputValue } from "@/lib/format";
import type { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function BookingForm({ service }: { service: Service }) {
	const [appointmentDate, setAppointmentDate] = useState(todayInputValue());
	const [timeSlot, setTimeSlot] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [confirmed, setConfirmed] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!appointmentDate) {
			toast.error("Please choose an appointment date.");
			return;
		}
		if (appointmentDate < todayInputValue()) {
			toast.error("Appointment date cannot be in the past.");
			return;
		}
		if (!timeSlot) {
			toast.error("Please choose an available time slot.");
			return;
		}

		setSubmitting(true);
		try {
			await api.post("/api/appointments", {
				serviceId: service._id,
				appointmentDate,
				timeSlot,
				message: message.trim(),
				servicePrice: Number(service.price),
			});
			setConfirmed(true);
			setMessage("");
			setTimeSlot("");
			toast.success("Appointment request submitted. Our team will confirm it shortly.");
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to submit your appointment request."));
		} finally {
			setSubmitting(false);
		}
	};

	if (confirmed) {
		return (
			<div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
				<CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600 dark:text-emerald-400" />
				<h3 className="mt-3 font-display text-lg font-semibold">Request received</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Your {formatDate(appointmentDate)} request for {service.serviceName} is
					pending confirmation. Track it from your dashboard.
				</p>
				<div className="mt-4 flex flex-wrap justify-center gap-2">
					<Button asChild variant="outline">
						<Link href="/dashboard/customer/appointments">View my appointments</Link>
					</Button>
					<Button variant="ghost" onClick={() => setConfirmed(false)}>
						Book another slot
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="appointmentDate">Appointment date</Label>
					<Input
						id="appointmentDate"
						type="date"
						min={todayInputValue()}
						value={appointmentDate}
						onChange={(event) => setAppointmentDate(event.target.value)}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="timeSlot">Available time slot</Label>
					<Select value={timeSlot} onValueChange={setTimeSlot}>
						<SelectTrigger id="timeSlot">
							<SelectValue placeholder="Choose a time" />
						</SelectTrigger>
						<SelectContent>
							{TIME_SLOTS.map((slot) => (
								<SelectItem key={slot} value={slot}>
									{slot}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="message">Additional message (optional)</Label>
				<Textarea
					id="message"
					rows={3}
					maxLength={500}
					placeholder="Tell us anything our stylists should know..."
					value={message}
					onChange={(event) => setMessage(event.target.value)}
				/>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm">
				<span className="font-medium">Service price</span>
				<span className="font-display text-lg font-semibold text-primary">
					{formatCurrency(Number(service.price))}
				</span>
			</div>

			<Button type="submit" className="w-full" size="lg" disabled={submitting}>
				{submitting ? (
					<>
						<Loader2 className="animate-spin" /> Submitting request...
					</>
				) : (
					<>
						<CalendarDays /> Confirm appointment request
					</>
				)}
			</Button>
			<p className="text-center text-xs text-muted-foreground">
				Your request starts as Pending. Payment is only available once confirmed.
			</p>
		</form>
	);
}
