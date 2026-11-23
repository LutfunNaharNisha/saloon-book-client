"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { homeForRole, profileForRole } from "@/lib/auth-paths";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
	CalendarDays,
	LayoutDashboard,
	LogOut,
	Menu,
	Scissors,
	Settings2,
	UserRound,
	UsersRound,
	WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const customerNav: NavItem[] = [
	{ href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
	{
		href: "/dashboard/customer/appointments",
		label: "My Appointments",
		icon: CalendarDays,
	},
	{
		href: "/dashboard/customer/profile",
		label: "My Profile",
		icon: UserRound,
	},
];

const adminNav: NavItem[] = [
	{ href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
	{
		href: "/dashboard/admin/services",
		label: "Manage Services",
		icon: Scissors,
	},
	{
		href: "/dashboard/admin/appointments",
		label: "Manage Appointments",
		icon: CalendarDays,
	},
	{
		href: "/dashboard/admin/customers",
		label: "Manage Users",
		icon: UsersRound,
	},
	{
		href: "/dashboard/admin/transactions",
		label: "Transactions",
		icon: WalletCards,
	},
	{ href: "/dashboard/admin/profile", label: "My Profile", icon: UserRound },
];

export function DashboardShell({ children }: { children: ReactNode }) {
	const { user, isAdmin, signOut } = useAuth();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => setMobileOpen(false), [pathname]);

	const nav = isAdmin ? adminNav : customerNav;

	const isActive = (href: string) =>
		href === "/dashboard/admin" || href === "/dashboard/customer"
			? pathname === href
			: pathname.startsWith(href);

	const currentLabel =
		[...nav].reverse().find((item) => isActive(item.href))?.label ||
		"Dashboard";

	const sidebar = (
		<div className="flex h-full flex-col">
			<div className="flex h-16 items-center gap-2.5 border-b px-5">
				{/* <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Scissors className="h-5 w-5" />
				</span>
				<span className="font-display text-lg font-semibold">
					Salon<span className="text-primary">Book</span>
				</span> */}
				<Link
					href="/"
					className="flex items-center gap-2.5"
					aria-label="SalonBook home"
				>
					<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Scissors className="h-5 w-5" />
					</span>
					<span className="font-display text-xl font-semibold tracking-tight">
						Salon<span className="text-primary">Book</span>
					</span>
				</Link>
			</div>

			<div className="px-5 py-4">
				<Badge
					variant="secondary"
					className="capitalize"
				>
					{isAdmin ? "Administrator" : "Customer"} workspace
				</Badge>
			</div>

			<nav
				className="flex-1 space-y-1 px-3"
				aria-label="Dashboard navigation"
			>
				{nav.map((item) => (
					<Button
						key={item.href}
						asChild
						variant={isActive(item.href) ? "secondary" : "ghost"}
						className={cn(
							"w-full justify-start gap-3",
							isActive(item.href) && "font-semibold text-primary",
						)}
					>
						<Link href={item.href}>
							<item.icon />
							{item.label}
						</Link>
					</Button>
				))}
			</nav>

			<div className="space-y-1 border-t p-3">
				<Button
					asChild
					variant="ghost"
					className="w-full justify-start gap-3"
				>
					<Link href="/services">
						<Settings2 /> Browse services
					</Link>
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start gap-3 text-destructive hover:text-destructive"
					onClick={() => void signOut()}
				>
					<LogOut /> Logout
				</Button>
			</div>
		</div>
	);

	return (
		<div className="flex min-h-screen bg-muted/30">
			<aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-background lg:block">
				{sidebar}
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
					<Dialog
						open={mobileOpen}
						onOpenChange={setMobileOpen}
					>
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							aria-label="Open dashboard menu"
							onClick={() => setMobileOpen(true)}
						>
							<Menu />
						</Button>
						<DialogContent className="left-0 top-0 h-full w-[78vw] max-w-xs translate-x-0 translate-y-0 rounded-none p-0">
							<DialogHeader className="sr-only">
								<DialogTitle>Dashboard navigation</DialogTitle>
								<DialogDescription>
									Choose a dashboard section.
								</DialogDescription>
							</DialogHeader>
							{sidebar}
						</DialogContent>
					</Dialog>

					<h1 className="truncate font-display text-lg font-semibold md:text-xl">
						{currentLabel}
					</h1>

					<div className="ml-auto flex items-center gap-1.5">
						<ThemeToggle />
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-10 gap-2 rounded-full px-1.5 sm:px-2"
										aria-label="Open account menu"
									>
										<Avatar className="h-7 w-7">
											{user.image ? (
												<AvatarImage
													src={user.image}
													alt={user.name}
												/>
											) : null}
											<AvatarFallback className="text-xs">
												{initials(user.name)}
											</AvatarFallback>
										</Avatar>
										<span className="hidden max-w-32 truncate text-sm font-medium sm:block">
											{user.name}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
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
											<Scissors /> Browse services
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
						) : null}
					</div>
				</header>

				<main className="flex-1 p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
