"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	CalendarDays,
	LayoutDashboard,
	LogOut,
	Menu,
	Scissors,
	UserRound,
	X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { homeForRole, profileForRole } from "@/lib/auth-paths";
import { initials } from "@/lib/format";

const publicLinks = [
	{ href: "/", label: "Home" },
	{ href: "/services", label: "Services" },
	{ href: "/#how-it-works", label: "How it works" },
	{ href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
	const pathname = usePathname();
	const { user, isPending, signOut } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => setMobileOpen(false), [pathname]);

	const isActive = (href: string) => {
		const path = href.split("#")[0] || "/";
		return path === "/" ? pathname === "/" : pathname.startsWith(path);
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md">
			<div className="container flex h-16 items-center justify-between gap-4">
				<Link href="/" className="flex items-center gap-2.5" aria-label="SalonBook home">
					<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Scissors className="h-5 w-5" />
					</span>
					<span className="font-display text-xl font-semibold tracking-tight">
						Salon<span className="text-primary">Book</span>
					</span>
				</Link>

				<nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
					{publicLinks.map((link) => (
						<Button
							key={link.href}
							asChild
							variant={isActive(link.href) ? "secondary" : "ghost"}
							size="sm"
						>
							<Link href={link.href}>{link.label}</Link>
						</Button>
					))}
				</nav>

				<div className="flex items-center gap-1.5">
					<ThemeToggle />

					{isPending ? (
						<Skeleton className="hidden h-9 w-28 sm:block" />
					) : user ? (
						<>
							<Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
								<Link href={homeForRole(user.role)}>
									<LayoutDashboard />
									Dashboard
								</Link>
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-10 gap-2 rounded-full px-1.5 sm:px-2"
										aria-label="Open profile menu"
									>
										<Avatar className="h-7 w-7">
											{user.image ? (
												<AvatarImage src={user.image} alt={user.name} />
											) : null}
											<AvatarFallback className="text-xs">
												{initials(user.name)}
											</AvatarFallback>
										</Avatar>
										<span className="hidden max-w-28 truncate text-sm font-medium lg:block">
											{user.name}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel className="truncate">
										{user.name}
										<span className="block truncate text-xs font-normal text-muted-foreground">
											{user.email}
										</span>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href={homeForRole(user.role)}>
											<LayoutDashboard /> Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={profileForRole(user.role)}>
											<UserRound /> My profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/services">
											<CalendarDays /> Browse services
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onSelect={() => void signOut()}
									>
										<LogOut /> Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<>
							<Button asChild variant="ghost" size="sm">
								<Link href="/sign-in">Sign In</Link>
							</Button>
							<Button asChild size="sm" className="hidden sm:inline-flex">
								<Link href="/sign-up">Get Started</Link>
							</Button>
						</>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						aria-label={mobileOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileOpen}
						onClick={() => setMobileOpen((open) => !open)}
					>
						{mobileOpen ? <X /> : <Menu />}
					</Button>
				</div>
			</div>

			{mobileOpen ? (
				<nav
					className="border-t bg-background px-4 py-3 md:hidden"
					aria-label="Mobile navigation"
				>
					<div className="flex flex-col gap-1">
						{publicLinks.map((link) => (
							<Button
								key={link.href}
								asChild
								variant={isActive(link.href) ? "secondary" : "ghost"}
								className={cn("justify-start")}
							>
								<Link href={link.href}>{link.label}</Link>
							</Button>
						))}
						{user ? (
							<Button asChild variant="secondary" className="justify-start">
								<Link href={homeForRole(user.role)}>Dashboard</Link>
							</Button>
						) : (
							<>
								<Button asChild variant="secondary" className="justify-start">
									<Link href="/sign-in">Sign In</Link>
								</Button>
								<Button asChild className="justify-start">
									<Link href="/sign-up">Create account</Link>
								</Button>
							</>
						)}
					</div>
				</nav>
			) : null}
		</header>
	);
}
