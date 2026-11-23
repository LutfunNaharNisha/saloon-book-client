import type { ReactNode } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const image =
	"https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80";

export function AuthShell({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="container grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
			<div className="relative hidden min-h-[560px] overflow-hidden rounded-2xl border lg:block">
				<Image
					src={image}
					alt="Salon interior"
					fill
					unoptimized
					priority
					sizes="50vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 p-10 text-white">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur">
						<Sparkles className="h-3 w-3" /> SalonBook
					</span>
					<p className="mt-4 font-display text-3xl font-semibold leading-tight">
						Your chair is waiting.
					</p>
					<p className="mt-2 max-w-sm text-sm text-white/80">
						Book trusted salon services, manage appointments and pay securely —
						all in one calm, simple place.
					</p>
				</div>
			</div>

			<div className="mx-auto w-full max-w-md">
				<Card className="shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="text-2xl">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
					<CardContent>{children}</CardContent>
				</Card>
			</div>
		</div>
	);
}
