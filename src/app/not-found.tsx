import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
			<Compass className="h-12 w-12 text-primary" />
			<p className="font-display text-5xl font-semibold">404</p>
			<h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that page</h1>
			<p className="max-w-md text-sm text-muted-foreground">
				The page may have moved or the link might be incorrect. Let&apos;s get you
				back to something beautiful.
			</p>
			<div className="flex flex-wrap justify-center gap-2">
				<Button asChild>
					<Link href="/">Go home</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/services">Browse services</Link>
				</Button>
			</div>
		</div>
	);
}
