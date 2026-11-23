import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
	return (
		<Card className="card-hover group flex h-full flex-col overflow-hidden">
			<div className="relative aspect-[4/3] overflow-hidden bg-muted">
				{service.image ? (
					<Image
						src={service.image}
						alt={service.serviceName}
						fill
						unoptimized
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
						Image coming soon
					</div>
				)}
				<Badge className="absolute left-3 top-3 bg-background/90 text-foreground shadow-sm">
					{service.category}
				</Badge>
				{service.status === "inactive" ? (
					<Badge variant="destructive" className="absolute right-3 top-3">
						Inactive
					</Badge>
				) : null}
			</div>

			<CardHeader className="pb-3">
				<CardTitle className="text-lg">{service.serviceName}</CardTitle>
				<CardDescription className="line-clamp-2 text-sm">
					{service.description}
				</CardDescription>
			</CardHeader>

			<CardContent className="mt-auto flex items-center justify-between pb-4">
				<div>
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
					<p className="font-display text-xl font-semibold text-primary">
						{formatCurrency(Number(service.price))}
					</p>
				</div>
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Clock3 className="h-4 w-4" />
					{formatDuration(Number(service.duration))}
				</div>
			</CardContent>

			<CardFooter className="pt-0">
				<Button asChild variant="outline" className="w-full">
					<Link href={`/services/${service._id}`}>
						View Details <ArrowUpRight className="h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export function ServiceCardSkeleton() {
	return (
		<Card className="flex h-full flex-col overflow-hidden">
			<Skeleton className="aspect-[4/3] w-full rounded-none" />
			<CardHeader className="space-y-3 pb-3">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</CardHeader>
			<CardContent className="mt-auto flex items-center justify-between pb-4">
				<Skeleton className="h-7 w-20" />
				<Skeleton className="h-5 w-16" />
			</CardContent>
			<CardFooter className="pt-0">
				<Skeleton className="h-10 w-full" />
			</CardFooter>
		</Card>
	);
}
