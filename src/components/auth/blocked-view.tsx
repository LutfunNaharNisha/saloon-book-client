"use client";

import Link from "next/link";
import { Ban } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function BlockedView() {
	const { signOut } = useAuth();

	return (
		<div className="container flex items-center justify-center py-16">
			<Card className="w-full max-w-lg text-center">
				<CardHeader>
					<Ban className="mx-auto h-12 w-12 text-destructive" />
					<CardTitle className="mt-3 text-2xl">Account access paused</CardTitle>
					<CardDescription>
						This account has been blocked by the salon administrator. Protected
						features are unavailable until it is unblocked.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap justify-center gap-2">
					<Button variant="outline" onClick={() => void signOut()}>
						Sign out
					</Button>
					<Button asChild>
						<Link href="/">Return home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
