import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentVerification } from "@/components/payments/payment-verification";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment Successful" };

export default async function PaymentSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const { session_id } = await searchParams;

	return (
		<div className="container flex items-center justify-center py-16">
			<Card className="w-full max-w-lg text-center">
				<CardHeader>
					<CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
					<CardTitle className="mt-3 text-2xl">Payment complete</CardTitle>
					<CardDescription>
						Thank you! Your payment has been received and your appointment is
						confirmed on our side.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<PaymentVerification sessionId={session_id} />
					<p className="text-sm text-muted-foreground">
						You can check the latest status in your appointments and payment
						history.
					</p>
					<div className="flex flex-wrap justify-center gap-2">
						<Button asChild>
							<Link href="/dashboard/customer/appointments">View appointments</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/services">Browse more services</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
