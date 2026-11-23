"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { asArray, getErrorMessage } from "@/lib/data";
import { SERVICE_CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/hooks/use-async-data";
import { ServiceCard, ServiceCardSkeleton } from "./service-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ServicesExplorer() {
	const searchParams = useSearchParams();
	const initialCategory = searchParams.get("category") || "all";

	const [search, setSearch] = useState("");
	const [category, setCategory] = useState(initialCategory);
	const [sort, setSort] = useState("newest");

	useEffect(() => setCategory(initialCategory), [initialCategory]);

	const {
		data: services,
		loading,
		error,
		reload,
	} = useAsyncData<Service[]>(
		async () => asArray<Service>(await api.get<unknown>("/api/services")),
		[],
	);

	const categories = useMemo(() => {
		const names = new Set<string>(SERVICE_CATEGORIES.map((item) => item.name));
		services?.forEach((service) => {
			if (service.category) names.add(service.category);
		});
		return Array.from(names).sort();
	}, [services]);

	const visibleServices = useMemo(() => {
		const query = search.trim().toLowerCase();
		const list = (services || []).filter(
			(service) => service.status !== "inactive",
		);

		const filtered = list.filter((service) => {
			const matchesSearch =
				!query || service.serviceName.toLowerCase().includes(query);
			const matchesCategory =
				category === "all" || service.category === category;
			return matchesSearch && matchesCategory;
		});

		return [...filtered].sort((a, b) => {
			if (sort === "price-asc") return Number(a.price) - Number(b.price);
			if (sort === "price-desc") return Number(b.price) - Number(a.price);
			const aTime = new Date(a.createdAt || 0).getTime();
			const bTime = new Date(b.createdAt || 0).getTime();
			return bTime - aTime;
		});
	}, [services, search, category, sort]);

	const resetFilters = () => {
		setSearch("");
		setCategory("all");
		setSort("newest");
	};

	return (
		<div className="space-y-8">
			<div className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
				<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_200px]">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search services by name..."
							className="pl-9"
							aria-label="Search services by name"
						/>
					</div>

					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger aria-label="Filter by category">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categories.map((name) => (
								<SelectItem key={name} value={name}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger aria-label="Sort services">
							<SlidersHorizontal className="mr-1 h-4 w-4 text-muted-foreground" />
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex items-center justify-between gap-4">
				<p className="text-sm text-muted-foreground">
					{loading
						? "Finding your services..."
						: `${visibleServices.length} service${visibleServices.length === 1 ? "" : "s"} available`}
				</p>
				{(search || category !== "all" || sort !== "newest") && !loading ? (
					<Button variant="ghost" size="sm" onClick={resetFilters}>
						<RotateCcw /> Reset filters
					</Button>
				) : null}
			</div>

			{error ? (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
					<p className="font-medium text-destructive">Unable to load services</p>
					<p className="mt-1 text-sm text-muted-foreground">{error}</p>
					<Button
						className="mt-4"
						variant="outline"
						onClick={() => {
							void reload().then(() => toast.success("Services refreshed."));
						}}
					>
						Try again
					</Button>
				</div>
			) : loading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<ServiceCardSkeleton key={index} />
					))}
				</div>
			) : visibleServices.length ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{visibleServices.map((service) => (
						<ServiceCard key={service._id} service={service} />
					))}
				</div>
			) : (
				<div className="rounded-xl border border-dashed p-12 text-center">
					<h3 className="font-display text-lg font-semibold">No services found</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Try a different name, category or reset your filters.
					</p>
					<Button className="mt-4" variant="outline" onClick={resetFilters}>
						Reset filters
					</Button>
				</div>
			)}
		</div>
	);
}

export function ServicesLoadError({ message }: { message: string }) {
	return <p className="text-sm text-destructive">{getErrorMessage(message)}</p>;
}
