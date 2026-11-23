"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock3, ShieldCheck, Star } from "lucide-react";
import { api } from "@/lib/api";
import { asArray } from "@/lib/data";
import { SALON, SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { ServiceCard, ServiceCardSkeleton } from "@/components/services/service-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const heroImage =
	"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=85";

const steps = [
	{
		icon: CalendarCheck2,
		title: "Pick your service",
		description: "Browse treatments, compare prices and find the right fit for you.",
	},
	{
		icon: Clock3,
		title: "Request a time",
		description: "Choose your preferred date and time slot in a few simple clicks.",
	},
	{
		icon: ShieldCheck,
		title: "Relax — you're booked",
		description: "Our team confirms your request and you pay securely after confirmation.",
	},
];

export function HomePage() {
	const {
		data: services,
		loading,
		error,
	} = useAsyncData<Service[]>(
		async () => asArray<Service>(await api.get<unknown>("/api/services")),
		[],
	);

	const featured = (services || [])
		.filter((service) => service.status !== "inactive")
		.slice(0, 6);

	return (
		<>
			<section className="relative isolate overflow-hidden">
				<div
					className="absolute inset-0 -z-20 bg-cover bg-center"
					style={{ backgroundImage: `url("${heroImage}")` }}
					aria-hidden="true"
				/>
				<div className="hero-overlay absolute inset-0 -z-10" aria-hidden="true" />
				<div className="container flex min-h-[560px] flex-col justify-center py-20 text-white md:min-h-[640px] md:py-28">
					<div className="max-w-2xl">
						<Badge className="mb-5 border-white/25 bg-white/15 text-white backdrop-blur">
							<Star className="mr-1 h-3 w-3 fill-current" /> Your beauty, your schedule
						</Badge>
						<h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
							Look your best, <span className="text-gold">effortlessly.</span>
						</h1>
						<p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
							Discover expert hair, skin, makeup and spa services. Request an
							appointment online and let our stylists take care of the rest.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Button asChild size="lg" variant="gold">
								<Link href="/services">
									Explore Salon Services <ArrowRight />
								</Link>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
							>
								<Link href="/#how-it-works">How it works</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="section-shell">
				<div className="mb-9 flex flex-col justify-between gap-3 md:flex-row md:items-end">
					<div>
						<p className="eyebrow">What we offer</p>
						<h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
							Featured salon services
						</h2>
						<p className="mt-2 max-w-xl text-sm text-muted-foreground">
							A curated selection of our most-loved treatments, ready for you to book.
						</p>
					</div>
					<Button asChild variant="link" className="self-start md:self-auto">
						<Link href="/services">
							View all services <ArrowRight />
						</Link>
					</Button>
				</div>

				{error ? (
					<div className="rounded-xl border border-dashed p-10 text-center">
						<p className="font-medium">Services are temporarily unavailable.</p>
						<p className="mt-1 text-sm text-muted-foreground">{error}</p>
						<Button asChild className="mt-4" variant="outline">
							<Link href="/services">Browse services</Link>
						</Button>
					</div>
				) : loading ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<ServiceCardSkeleton key={index} />
						))}
					</div>
				) : featured.length ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{featured.map((service) => (
							<ServiceCard key={service._id} service={service} />
						))}
					</div>
				) : (
					<div className="rounded-xl border border-dashed p-10 text-center">
						<p className="font-medium">No featured services yet.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Please check back soon — our team is preparing something beautiful.
						</p>
					</div>
				)}
			</section>

			<section className="border-y bg-muted/40 py-14 md:py-20">
				<div className="container">
					<div className="mx-auto mb-10 max-w-2xl text-center">
						<p className="eyebrow">Explore by category</p>
						<h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
							Find your next favourite treatment
						</h2>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						{SERVICE_CATEGORIES.map((category) => (
							<Link
								key={category.name}
								href={`/services?category=${encodeURIComponent(category.name)}`}
								className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-card"
							>
								<Image
									src={category.image}
									alt={category.name}
									fill
									unoptimized
									sizes="(max-width: 768px) 50vw, 25vw"
									className="object-cover transition-transform duration-300 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
								<div className="absolute inset-x-0 bottom-0 p-4 text-white">
									<p className="font-display text-base font-semibold leading-tight">
										{category.name}
									</p>
									<p className="mt-1 text-xs text-white/80">{category.description}</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section id="how-it-works" className="section-shell">
				<div className="mx-auto mb-10 max-w-2xl text-center">
					<p className="eyebrow">Simple by design</p>
					<h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
						Your appointment in three steps
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						No phone tag, no waiting. Just a smoother way to look after yourself.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{steps.map((step, index) => (
						<Card key={step.title} className="relative overflow-hidden">
							<span className="absolute right-4 top-2 font-display text-5xl font-bold text-primary/10">
								0{index + 1}
							</span>
							<CardHeader>
								<span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<step.icon className="h-5 w-5" />
								</span>
								<CardTitle className="text-lg">{step.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>{step.description}</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
				<div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border bg-card p-6 text-center sm:flex-row sm:text-left">
					<div>
						<p className="font-display text-lg font-semibold">Ready for a refresh?</p>
						<p className="text-sm text-muted-foreground">
							{SALON.tagline} Join our clients at {SALON.name}.
						</p>
					</div>
					<Button asChild>
						<Link href="/services">
							Browse all services <ArrowRight />
						</Link>
					</Button>
				</div>
			</section>
		</>
	);
}
