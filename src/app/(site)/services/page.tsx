import type { Metadata } from "next";
import { Suspense } from "react";
import { ServicesExplorer } from "@/components/services/services-explorer";
import { ServiceCardSkeleton } from "@/components/services/service-card";

export const metadata: Metadata = {
	title: "Browse Services",
	description: "Explore SalonBook services, filter by category and sort by price.",
};

export default function ServicesPage() {
	return (
		<div className="container py-10 md:py-14">
			<div className="mb-8 max-w-2xl">
				<p className="eyebrow">Our menu</p>
				<h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
					Browse salon services
				</h1>
				<p className="mt-3 text-sm text-muted-foreground md:text-base">
					Find the perfect treatment for you. Search by name, explore a category,
					or sort by price — no account needed to browse.
				</p>
			</div>

			<Suspense
				fallback={
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<ServiceCardSkeleton key={index} />
						))}
					</div>
				}
			>
				<ServicesExplorer />
			</Suspense>
		</div>
	);
}
