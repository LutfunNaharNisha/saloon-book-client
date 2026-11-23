import Link from "next/link";
import { Clock3, Instagram, Mail, Facebook, MapPin, Phone, Scissors } from "lucide-react";
import { SALON } from "@/lib/constants";

const exploreLinks = [
	{ href: "/", label: "Home" },
	{ href: "/services", label: "Browse services" },
	{ href: "/sign-in", label: "Sign in" },
	{ href: "/sign-up", label: "Create account" },
];

export function SiteFooter() {
	return (
		<footer id="contact" className="border-t bg-muted/40">
			<div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
				<div className="space-y-4">
					<Link href="/" className="flex items-center gap-2.5">
						<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Scissors className="h-5 w-5" />
						</span>
						<span className="font-display text-xl font-semibold">
							Salon<span className="text-primary">Book</span>
						</span>
					</Link>
					<p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
						{SALON.description} Book your next appointment in minutes.
					</p>
					<div className="flex items-center gap-2">
						{SALON.socials.map((social) => {
							const Icon =
								social.label === "Instagram"
									? Instagram
									: social.label === "Facebook"
										? Facebook
										: Clock3;
							return (
								<Link
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									aria-label={social.label}
									className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-primary"
								>
									<Icon className="h-4 w-4" />
								</Link>
							);
						})}
					</div>
				</div>

				<div>
					<h3 className="mb-4 font-display text-base font-semibold">Explore</h3>
					<ul className="space-y-2.5 text-sm">
						{exploreLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-muted-foreground transition-colors hover:text-primary"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="mb-4 font-display text-base font-semibold">Visit the salon</h3>
					<ul className="space-y-3 text-sm text-muted-foreground">
						<li className="flex gap-2.5">
							<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>{SALON.address}</span>
						</li>
						<li className="flex gap-2.5">
							<Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<a href={`tel:${SALON.phone.replace(/[^\d+]/g, "")}`} className="hover:text-primary">
								{SALON.phone}
							</a>
						</li>
						<li className="flex gap-2.5">
							<Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<a href={`mailto:${SALON.email}`} className="hover:text-primary">
								{SALON.email}
							</a>
						</li>
					</ul>
				</div>

				<div>
					<h3 className="mb-4 font-display text-base font-semibold">Opening hours</h3>
					<ul className="space-y-2.5 text-sm text-muted-foreground">
						{SALON.hours.map((entry) => (
							<li key={entry.day} className="flex justify-between gap-3">
								<span>{entry.day}</span>
								<span className="text-right text-foreground">{entry.time}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="border-t py-5">
				<div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
					<p>
						© {new Date().getFullYear()} {SALON.name}. All rights reserved.
					</p>
					<p>Beauty, booked beautifully.</p>
				</div>
			</div>
		</footer>
	);
}
