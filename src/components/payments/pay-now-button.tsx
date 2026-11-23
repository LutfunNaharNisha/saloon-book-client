"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { asRecord, getErrorMessage, isRecord } from "@/lib/data";
import type { Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";

const readCheckoutUrl = (payload: unknown): string | null => {
	if (typeof payload === "string" && payload.startsWith("http")) return payload;
	const record = asRecord(payload);
	if (!record) return null;
	for (const key of ["url", "checkoutUrl", "sessionUrl", "checkoutURL"]) {
		const value = record[key];
		if (typeof value === "string" && value.startsWith("http")) return value;
	}
	const session = record.session;
	if (isRecord(session) && typeof session.url === "string") return session.url;
	return null;
};

export function PayNowButton({
	appointment,
	size = "sm",
}: {
	appointment: Appointment;
	size?: "sm" | "default";
}) {
	const [loading, setLoading] = useState(false);

	const canPay =
		appointment.status === "confirmed" && appointment.paymentStatus !== "paid";

	const handlePay = async () => {
		if (!canPay) {
			toast.error("Only confirmed, unpaid appointments can be paid for.");
			return;
		}

		setLoading(true);
		try {
			const payload = await api.post<unknown>(
				"/api/payments/create-checkout-session",
				{ appointmentId: appointment._id },
			);
			const url = readCheckoutUrl(payload);
			if (!url) {
				throw new Error("Stripe did not return a checkout URL. Please try again.");
			}
			toast.success("Redirecting to secure checkout...");
			window.location.assign(url);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to start checkout. Please try again."));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button size={size} onClick={() => void handlePay()} disabled={loading || !canPay}>
			{loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
			{loading ? "Redirecting..." : "Pay Now"}
		</Button>
	);
}
