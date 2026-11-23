export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const GOOGLE_AUTH_ENABLED =
	process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export const SALON = {
	name: "SalonBook",
	tagline: "Beauty, booked beautifully.",
	description:
		"A modern salon studio offering expert hair, skin, makeup and spa rituals — with effortless online appointment booking.",
	phone: "+1 (555) 010-2000",
	email: "hello@salonbook.com",
	address: "128 Rosewood Avenue, Suite 4, New York, NY 10012",
	hours: [
		{ day: "Monday – Friday", time: "9:00 AM – 8:00 PM" },
		{ day: "Saturday", time: "9:00 AM – 7:00 PM" },
		{ day: "Sunday", time: "10:00 AM – 5:00 PM" },
	],
	socials: [
		{ label: "Instagram", href: "https://instagram.com" },
		{ label: "Facebook", href: "https://facebook.com" },
		{ label: "Pinterest", href: "https://pinterest.com" },
	],
};

export const SERVICE_CATEGORIES = [
	{
		name: "Haircut & Styling",
		description: "Precision cuts, blowouts and event styling.",
		image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Hair Coloring",
		description: "Balayage, gloss and dimensional colour.",
		image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Hair Treatment",
		description: "Repair, hydration and scalp rituals.",
		image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Facial & Skincare",
		description: "Glow-boosting facials for every skin type.",
		image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Makeup",
		description: "Soft glam, bridal and editorial looks.",
		image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Manicure & Pedicure",
		description: "Gel colour, nail art and spa pedicures.",
		image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Spa & Massage",
		description: "Relaxing massages and body therapies.",
		image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
	},
];

export const TIME_SLOTS = [
	"09:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"01:00 PM",
	"02:00 PM",
	"03:00 PM",
	"04:00 PM",
	"05:00 PM",
	"06:00 PM",
	"07:00 PM",
];

export const SORT_OPTIONS = [
	{ value: "newest", label: "Newest first" },
	{ value: "price-asc", label: "Price: low to high" },
	{ value: "price-desc", label: "Price: high to low" },
];

export const APPOINTMENT_STATUSES = [
	"pending",
	"confirmed",
	"cancelled",
] as const;
