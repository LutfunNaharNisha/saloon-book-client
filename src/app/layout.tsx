import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "SalonBook | Salon Appointment Booking",
		template: "%s | SalonBook",
	},
	description:
		"Explore salon services, book appointments and manage your beauty routine with SalonBook.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${playfair.variable} font-sans`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
