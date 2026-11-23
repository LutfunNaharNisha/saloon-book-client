import type { Metadata } from "next";
import Link from "next/link";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
	return (
		<div className="container flex items-center justify-center py-16">
			<Card className="w-full max-w-lg text-center">
				<CardHeader>
					<CircleX className="mx-auto h-12 w-12 text-destructive" />
					<CardTitle className="mt-3 text-2xl">Payment cancelled</CardTitle>
					<CardDescription>
						No charge was made. Your appointment is still confirmed — you can try
						the payment again at any time.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap justify-center gap-2">
					<Button asChild>
						<Link href="/dashboard/customer/appointments">Back to appointments</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/">Return home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
