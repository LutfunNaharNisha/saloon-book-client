"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";

type VerificationState = "verifying" | "paid" | "pending" | "error";

type VerifyResponse = {
	paid?: boolean;
	message?: string;
	appointmentId?: string;
	amount?: number;
	currency?: string;
};

/**
 * Stripe redirects to the success page with a `session_id`. The webhook is the
 * primary way the backend marks a payment as paid, but it is not always wired
 * up (e.g. local development). Calling the existing verify-session endpoint
 * here finalises the appointment and transaction without relying on the
 * webhook ever arriving.
 */
export function PaymentVerification({ sessionId }: { sessionId?: string }) {
	const router = useRouter();
	const { isPending: isSessionPending } = useAuth();
	const [state, setState] = useState<VerificationState>("verifying");
	const [message, setMessage] = useState<string | null>(null);
	const hasVerified = useRef(false);

	useEffect(() => {
		// Wait until the auth provider has loaded so the request carries a JWT.
		if (isSessionPending || hasVerified.current) return;

		if (!sessionId) {
			hasVerified.current = true;
			setState("error");
			setMessage("Missing Stripe checkout session ID. Please contact support.");
			return;
		}

		hasVerified.current = true;
		void (async () => {
			try {
				const result = await api.get<VerifyResponse>(
					`/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
				);
				if (result?.paid) {
					setState("paid");
					// Re-render server components so the appointments/payment
					// history reflect the newly saved status.
					router.refresh();
				} else {
					setState("pending");
					setMessage(result?.message ?? "Payment has not been completed yet.");
				}
			} catch (error) {
				setState("error");
				setMessage(
					getErrorMessage(error, "We could not confirm your payment yet."),
				);
			}
		})();
	}, [sessionId, isSessionPending, router]);

	if (state === "verifying") {
		return (
			<div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Confirming your payment...
			</div>
		);
	}

	if (state === "paid") {
		return (
			<div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
				<CheckCircle2 className="h-4 w-4" />
				Payment confirmed. Your appointment is now marked as paid.
			</div>
		);
	}

	return (
		<div className="flex items-start justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-800 dark:text-amber-400">
			<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
			<span>
				<strong className="font-semibold">Payment not finalised yet.</strong>{" "}
				{message ?? "Please check your appointments and payment history shortly."}
			</span>
		</div>
	);
}
